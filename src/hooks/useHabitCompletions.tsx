import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  energy_gained: number;
  notes?: string;
}

// 时间范围类型
export type TimeRange = 'week' | 'month' | 'all';

// 缓存接口
interface CacheData {
  data: HabitCompletion[];
  timestamp: number;
  timeRange: TimeRange;
}

export const useHabitCompletions = (timeRange: TimeRange = 'week') => {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<Map<TimeRange, CacheData>>(new Map());
  const { user } = useAuth();
  const { toast } = useToast();

  // 计算时间范围的开始时间
  const getStartDate = useCallback((range: TimeRange): Date => {
    const now = new Date();
    switch (range) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'all':
        return new Date('2020-01-01');
    }
  }, []);

  // 检查缓存是否有效（5分钟内的数据认为有效）
  const isCacheValid = useCallback((cacheData: CacheData): boolean => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
    return Date.now() - cacheData.timestamp < CACHE_DURATION;
  }, []);

  // 获取习惯完成记录（优化版）
  const fetchCompletions = useCallback(async (range: TimeRange = timeRange) => {
    if (!user) return;

    // 检查缓存
    const cachedData = cache.get(range);
    if (cachedData && isCacheValid(cachedData)) {
      setCompletions(cachedData.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 构建查询
      let query = supabase
        .from('habit_completions')
        .select('*')
        .order('completed_at', { ascending: false });

      // 根据时间范围限制查询
      if (range !== 'all') {
        const startDate = getStartDate(range);
        query = query.gte('completed_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const completionsData = data || [];
      setCompletions(completionsData);
      
      // 更新缓存
      const newCacheData: CacheData = {
        data: completionsData,
        timestamp: Date.now(),
        timeRange: range
      };
      setCache(prev => new Map(prev).set(range, newCacheData));
      
      // 筛选今日完成的习惯ID
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const todayCompleted = completionsData
        .filter(completion => {
          const completedAt = new Date(completion.completed_at);
          return completedAt >= startOfDay && completedAt < endOfDay;
        })
        .map(completion => completion.habit_id);
      
      setTodayCompletions(todayCompleted);
      
    } catch (error) {
      console.error('Error fetching habit completions:', error);
      toast({
        title: "获取打卡记录失败",
        description: "无法加载打卡历史",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, timeRange, cache, getStartDate, isCacheValid, toast]);

  // 检查习惯今日是否已完成
  const isCompletedToday = useCallback((habitId: string): boolean => {
    return todayCompletions.includes(habitId);
  }, [todayCompletions]);

  // 获取习惯的完成统计
  const getHabitStats = useCallback((habitId: string) => {
    const habitCompletions = completions.filter(c => c.habit_id === habitId);
    const totalCompletions = habitCompletions.length;
    const totalEnergy = habitCompletions.reduce((sum, c) => sum + c.energy_gained, 0);
    
    return {
      totalCompletions,
      totalEnergy,
      lastCompleted: habitCompletions[0]?.completed_at
    };
  }, [completions]);

  // 清除缓存
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // 预加载下一个时间范围的数据
  const preloadTimeRange = useCallback(async (range: TimeRange) => {
    if (!user || cache.has(range)) return;
    
    // 后台静默加载，不改变当前状态
    try {
      const startDate = getStartDate(range);
      let query = supabase
        .from('habit_completions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (range !== 'all') {
        query = query.gte('completed_at', startDate.toISOString());
      }

      const { data } = await query;
      
      if (data) {
        const newCacheData: CacheData = {
          data,
          timestamp: Date.now(),
          timeRange: range
        };
        setCache(prev => new Map(prev).set(range, newCacheData));
      }
    } catch (error) {
      console.error('Preload error:', error);
    }
  }, [user, cache, getStartDate]);

  useEffect(() => {
    if (user) {
      fetchCompletions(timeRange);
    } else {
      setCompletions([]);
      setTodayCompletions([]);
      setLoading(false);
    }
  }, [user, timeRange, fetchCompletions]);

  // 乐观更新：立即添加今日完成状态
  const optimisticAddCompletion = useCallback((habitId: string) => {
    setTodayCompletions(prev => [...prev, habitId]);
    // 清除相关缓存，确保下次获取最新数据
    clearCache();
  }, [clearCache]);

  // 回滚更新：移除乐观添加的完成状态
  const rollbackAddCompletion = useCallback((habitId: string) => {
    setTodayCompletions(prev => prev.filter(id => id !== habitId));
  }, []);

  return {
    completions,
    todayCompletions,
    loading,
    isCompletedToday,
    getHabitStats,
    optimisticAddCompletion,
    rollbackAddCompletion,
    refetch: () => fetchCompletions(timeRange),
    clearCache,
    preloadTimeRange,
    // 新增：缓存统计信息
    cacheInfo: {
      size: cache.size,
      hasData: (range: TimeRange) => cache.has(range)
    }
  };
}; 