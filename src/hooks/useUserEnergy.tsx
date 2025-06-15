
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserEnergy = () => {
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserEnergy = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_energy')
        .select('total_energy')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setTotalEnergy(data?.total_energy || 0);
    } catch (error) {
      console.error('Error fetching user energy:', error);
      setTotalEnergy(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserEnergy();
    } else {
      setTotalEnergy(0);
      setLoading(false);
    }
  }, [user]);

  return {
    totalEnergy,
    loading,
    refetch: fetchUserEnergy
  };
};
