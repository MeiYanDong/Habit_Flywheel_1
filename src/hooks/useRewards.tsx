
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Reward {
  id: string;
  name: string;
  description?: string;
  energy_cost: number;
  current_energy: number;
  is_redeemed: boolean;
  redeemed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 获取奖励列表
  const fetchRewards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "获取奖励失败",
        description: "无法加载奖励列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建奖励
  const createReward = async (rewardData: Omit<Reward, 'id' | 'current_energy' | 'is_redeemed' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert([{ 
          ...rewardData, 
          user_id: user.id,
          current_energy: 0,
          is_redeemed: false
        }])
        .select()
        .single();

      if (error) throw error;
      
      setRewards(prev => [data, ...prev]);
      toast({
        title: "奖励创建成功",
        description: `"${rewardData.name}" 已添加到您的奖励列表中`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating reward:', error);
      toast({
        title: "创建奖励失败",
        description: "无法创建新奖励",
        variant: "destructive",
      });
    }
  };

  // 更新奖励
  const updateReward = async (id: string, updates: Partial<Reward>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRewards(prev => prev.map(reward => reward.id === id ? data : reward));
      toast({
        title: "奖励更新成功",
        description: "奖励信息已更新",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating reward:', error);
      toast({
        title: "更新奖励失败",
        description: "无法更新奖励信息",
        variant: "destructive",
      });
    }
  };

  // 删除奖励
  const deleteReward = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRewards(prev => prev.filter(reward => reward.id !== id));
      toast({
        title: "奖励已删除",
        description: "奖励及其相关绑定已被删除",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast({
        title: "删除奖励失败",
        description: "无法删除奖励",
        variant: "destructive",
      });
    }
  };

  // 兑换奖励
  const redeemReward = async (id: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .update({ 
          is_redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRewards(prev => prev.map(reward => reward.id === id ? data : reward));
      toast({
        title: "奖励兑换成功",
        description: `恭喜您兑换了"${data.name}"！`,
      });
      
      return data;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "兑换奖励失败",
        description: "无法兑换奖励",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchRewards();
    } else {
      setRewards([]);
      setLoading(false);
    }
  }, [user]);

  return {
    rewards,
    loading,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    refetch: fetchRewards
  };
};
