
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2, Unlink, Zap, Target, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BindingManagerProps {
  habits: Array<{
    id: string;
    name: string;
    energyValue: number;
    bindingRewardId?: string;
    isArchived: boolean;
  }>;
  rewards: Array<{
    id: string;
    name: string;
    energyCost: number;
    currentEnergy: number;
    isRedeemed: boolean;
  }>;
  onUpdateHabit: (habitId: string, updates: { bindingRewardId?: string }) => void;
}

const BindingManager: React.FC<BindingManagerProps> = ({
  habits,
  rewards,
  onUpdateHabit
}) => {
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<string>('');
  const { toast } = useToast();

  const activeHabits = habits.filter(h => !h.isArchived);
  const availableRewards = rewards.filter(r => !r.isRedeemed);

  const createBinding = () => {
    if (!selectedHabit || !selectedReward) {
      toast({
        title: "请选择习惯和奖励",
        description: "需要选择一个习惯和一个奖励才能创建绑定",
        variant: "destructive",
      });
      return;
    }

    onUpdateHabit(selectedHabit, { bindingRewardId: selectedReward });
    
    const habit = habits.find(h => h.id === selectedHabit);
    const reward = rewards.find(r => r.id === selectedReward);
    
    toast({
      title: "绑定创建成功",
      description: `"${habit?.name}" 已绑定到 "${reward?.name}"`,
    });

    setSelectedHabit('');
    setSelectedReward('');
  };

  const removeBinding = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    const reward = rewards.find(r => r.id === habit?.bindingRewardId);
    
    onUpdateHabit(habitId, { bindingRewardId: undefined });
    
    toast({
      title: "绑定已移除",
      description: `"${habit?.name}" 与 "${reward?.name}" 的绑定已移除`,
    });
  };

  const boundHabits = activeHabits.filter(h => h.bindingRewardId);
  const unboundHabits = activeHabits.filter(h => !h.bindingRewardId);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">绑定管理</h2>
        <p className="text-gray-600">将习惯绑定到奖励，让每次努力都有明确目标</p>
      </div>

      {/* 创建新绑定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="h-5 w-5 text-purple-600" />
            <span>创建新绑定</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择习惯
              </label>
              <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                <SelectTrigger>
                  <SelectValue placeholder="选择要绑定的习惯" />
                </SelectTrigger>
                <SelectContent>
                  {unboundHabits.map(habit => (
                    <SelectItem key={habit.id} value={habit.id}>
                      <div className="flex items-center space-x-2">
                        <span>{habit.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          +{habit.energyValue}⚡
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择奖励
              </label>
              <Select value={selectedReward} onValueChange={setSelectedReward}>
                <SelectTrigger>
                  <SelectValue placeholder="选择要绑定的奖励" />
                </SelectTrigger>
                <SelectContent>
                  {availableRewards.map(reward => (
                    <SelectItem key={reward.id} value={reward.id}>
                      <div className="flex items-center space-x-2">
                        <span>{reward.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {reward.energyCost}⚡
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={createBinding}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={!selectedHabit || !selectedReward}
          >
            创建绑定
          </Button>
        </CardContent>
      </Card>

      {/* 现有绑定 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          现有绑定 ({boundHabits.length})
        </h3>

        {boundHabits.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>还没有任何绑定关系</p>
              <p className="text-sm mt-2">创建绑定让习惯与奖励产生关联！</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boundHabits.map(habit => {
              const reward = rewards.find(r => r.id === habit.bindingRewardId);
              if (!reward) return null;

              const progress = Math.min((reward.currentEnergy / reward.energyCost) * 100, 100);

              return (
                <Card key={habit.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{habit.name}</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          +{habit.energyValue}⚡
                        </Badge>
                      </div>

                      <div className="text-center py-2">
                        <div className="text-2xl">↓</div>
                        <div className="text-xs text-gray-500">绑定到</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-purple-800">{reward.name}</span>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            {reward.energyCost}⚡
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>进度</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-center text-xs text-gray-600">
                            {reward.currentEnergy}/{reward.energyCost}⚡
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBinding(habit.id)}
                        className="w-full"
                      >
                        <Unlink className="h-3 w-3 mr-2" />
                        移除绑定
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BindingManager;
