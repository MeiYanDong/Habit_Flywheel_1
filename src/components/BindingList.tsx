
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Link } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  energyValue: number;
  isArchived: boolean;
}

interface Reward {
  id: string;
  name: string;
  cost: number;
}

interface Binding {
  id: string;
  habitId: string;
  rewardId: string;
  quantity: number;
}

interface BindingListProps {
  habits: Habit[];
  rewards: Reward[];
  bindings: Binding[];
  setBindings: React.Dispatch<React.SetStateAction<Binding[]>>;
}

const BindingList: React.FC<BindingListProps> = ({ habits, rewards, bindings, setBindings }) => {
  const handleDelete = (id: string) => {
    setBindings(prev => prev.filter(binding => binding.id !== id));
  };

  const getHabitName = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.name : '未知习惯';
  };

  const getRewardName = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    return reward ? reward.name : '未知奖励';
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-medium">当前绑定</h3>
      <div className="grid gap-4">
        {bindings.map(binding => (
          <Card key={binding.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getHabitName(binding.habitId)}</span>
                      <span className="text-gray-500">→</span>
                      <span className="font-medium">{getRewardName(binding.rewardId)}</span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      需要完成 {binding.quantity} 次
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleDelete(binding.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {bindings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">暂无绑定关系</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BindingList;
