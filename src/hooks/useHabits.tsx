
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  energy_value: number;
  color?: string;
  binding_reward_id?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 获取习惯列表
  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast({
        title: "获取习惯失败",
        description: "无法加载习惯列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建习惯
  const createHabit = async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habitData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setHabits(prev => [data, ...prev]);
      toast({
        title: "习惯创建成功",
        description: `"${habitData.name}" 已添加到您的习惯列表中`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: "创建习惯失败",
        description: "无法创建新习惯",
        variant: "destructive",
      });
    }
  };

  // 更新习惯
  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setHabits(prev => prev.map(habit => habit.id === id ? data : habit));
      toast({
        title: "习惯更新成功",
        description: "习惯信息已更新",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating habit:', error);
      toast({
        title: "更新习惯失败",
        description: "无法更新习惯信息",
        variant: "destructive",
      });
    }
  };

  // 删除习惯
  const deleteHabit = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHabits(prev => prev.filter(habit => habit.id !== id));
      toast({
        title: "习惯已删除",
        description: "习惯及其相关记录已被删除",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: "删除习惯失败",
        description: "无法删除习惯",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
    } else {
      setHabits([]);
      setLoading(false);
    }
  }, [user]);

  return {
    habits,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    refetch: fetchHabits
  };
};
