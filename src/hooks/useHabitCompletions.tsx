
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 获取完成记录
  const fetchCompletions = async (habitId?: string, limit?: number) => {
    if (!user) return;

    try {
      let query = supabase
        .from('habit_completions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (habitId) {
        query = query.eq('habit_id', habitId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
      toast({
        title: "获取完成记录失败",
        description: "无法加载完成记录",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建完成记录
  const createCompletion = async (habitId: string, energyGained: number, notes?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .insert([{
          habit_id: habitId,
          user_id: user.id,
          energy_gained: energyGained,
          notes: notes,
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // 更新用户总能量
      await updateUserEnergy(energyGained);
      
      setCompletions(prev => [data, ...prev]);
      toast({
        title: "习惯完成",
        description: `获得 ${energyGained} 点能量！`,
      });

      return data;
    } catch (error) {
      console.error('Error creating completion:', error);
      toast({
        title: "记录完成失败",
        description: "无法记录习惯完成",
        variant: "destructive",
      });
    }
  };

  // 更新用户能量
  const updateUserEnergy = async (energyGained: number) => {
    if (!user) return;

    try {
      const { data: currentEnergy } = await supabase
        .from('user_energy')
        .select('total_energy')
        .eq('user_id', user.id)
        .single();

      const newTotal = (currentEnergy?.total_energy || 0) + energyGained;

      await supabase
        .from('user_energy')
        .upsert({
          user_id: user.id,
          total_energy: newTotal
        });
    } catch (error) {
      console.error('Error updating user energy:', error);
    }
  };

  // 删除完成记录
  const deleteCompletion = async (id: string) => {
    if (!user) return;

    try {
      const completion = completions.find(c => c.id === id);
      if (!completion) return;

      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 减少用户能量
      await updateUserEnergy(-completion.energy_gained);

      setCompletions(prev => prev.filter(c => c.id !== id));
      toast({
        title: "记录已删除",
        description: "完成记录已被删除",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting completion:', error);
      toast({
        title: "删除记录失败",
        description: "无法删除完成记录",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompletions();
    } else {
      setCompletions([]);
      setLoading(false);
    }
  }, [user]);

  return {
    completions,
    loading,
    createCompletion,
    deleteCompletion,
    refetch: fetchCompletions
  };
};
