import { useState, useEffect } from 'react';
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

export const useHabitCompletions = () => {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 获取习惯完成记录
  const fetchCompletions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      setCompletions(data || []);
      
      // 筛选今日完成的习惯ID
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const todayCompleted = (data || [])
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
  };

  // 检查习惯今日是否已完成
  const isCompletedToday = (habitId: string): boolean => {
    return todayCompletions.includes(habitId);
  };

  // 获取习惯的完成统计
  const getHabitStats = (habitId: string) => {
    const habitCompletions = completions.filter(c => c.habit_id === habitId);
    const totalCompletions = habitCompletions.length;
    const totalEnergy = habitCompletions.reduce((sum, c) => sum + c.energy_gained, 0);
    
    return {
      totalCompletions,
      totalEnergy,
      lastCompleted: habitCompletions[0]?.completed_at
    };
  };

  useEffect(() => {
    if (user) {
      fetchCompletions();
    } else {
      setCompletions([]);
      setTodayCompletions([]);
      setLoading(false);
    }
  }, [user]);

  // 乐观更新：立即添加今日完成状态
  const optimisticAddCompletion = (habitId: string) => {
    setTodayCompletions(prev => [...prev, habitId]);
  };

  // 回滚更新：移除乐观添加的完成状态
  const rollbackAddCompletion = (habitId: string) => {
    setTodayCompletions(prev => prev.filter(id => id !== habitId));
  };

  return {
    completions,
    todayCompletions,
    loading,
    isCompletedToday,
    getHabitStats,
    optimisticAddCompletion,
    rollbackAddCompletion,
    refetch: fetchCompletions
  };
}; 