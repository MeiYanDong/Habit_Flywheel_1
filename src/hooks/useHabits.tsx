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

  // 习惯打卡功能
  const checkInHabit = async (habitId: string) => {
    if (!user) return;

    try {
      // 找到对应的习惯
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        toast({
          title: "习惯不存在",
          description: "找不到指定的习惯",
          variant: "destructive",
        });
        return;
      }

      // 检查今天是否已经打卡
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const { data: existingCompletion, error: checkError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .gte('completed_at', startOfDay.toISOString())
        .lt('completed_at', endOfDay.toISOString())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCompletion) {
        toast({
          title: "今日已打卡",
          description: `您今天已经完成了"${habit.name}"的打卡`,
          variant: "default",
        });
        return;
      }

      // 记录打卡
      const { error: completionError } = await supabase
        .from('habit_completions')
        .insert([{
          user_id: user.id,
          habit_id: habitId,
          energy_gained: habit.energy_value,
          completed_at: new Date().toISOString()
        }]);

      if (completionError) throw completionError;

      // 更新用户总能量
      const { data: currentEnergy, error: energyError } = await supabase
        .from('user_energy')
        .select('total_energy')
        .eq('user_id', user.id)
        .single();

      if (energyError && energyError.code !== 'PGRST116') {
        throw energyError;
      }

      const newTotalEnergy = (currentEnergy?.total_energy || 0) + habit.energy_value;

      const { error: updateEnergyError } = await supabase
        .from('user_energy')
        .upsert({
          user_id: user.id,
          total_energy: newTotalEnergy,
          updated_at: new Date().toISOString()
        });

      if (updateEnergyError) throw updateEnergyError;

      // 如果有绑定奖励，更新奖励的当前能量
      if (habit.binding_reward_id) {
        // 先获取当前奖励的能量值
        const { data: currentReward, error: getRewardError } = await supabase
          .from('rewards')
          .select('current_energy')
          .eq('id', habit.binding_reward_id)
          .eq('user_id', user.id)
          .single();

        if (getRewardError) {
          console.error('Error getting reward energy:', getRewardError);
        } else {
          // 更新奖励的当前能量
          const { error: rewardError } = await supabase
            .from('rewards')
            .update({
              current_energy: (currentReward.current_energy || 0) + habit.energy_value
            })
            .eq('id', habit.binding_reward_id)
            .eq('user_id', user.id);

          if (rewardError) {
            console.error('Error updating reward energy:', rewardError);
            // 不中断流程，只记录错误
          }
        }
      }

      toast({
        title: "打卡成功！",
        description: `完成"${habit.name}"，获得 ${habit.energy_value} 点能量`,
      });

      return true; // 成功返回 true

    } catch (error) {
      console.error('Error checking in habit:', error);
      toast({
        title: "打卡失败",
        description: "无法完成打卡，请稍后再试",
        variant: "destructive",
      });
      
      throw error; // 抛出错误以便调用方处理
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
    checkInHabit,
    refetch: fetchHabits
  };
};
