import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { Link2, Unlink, Zap, Target, CheckCircle, Gift, Activity, Star } from 'lucide-react';
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

  const unboundHabits = activeHabits.filter(h => !h.bindingRewardId);

  // 获取有绑定习惯的奖励
  const rewardsWithBindings = availableRewards.filter(reward => 
    activeHabits.some(habit => habit.bindingRewardId === reward.id)
  ).map(reward => {
    const boundHabits = activeHabits.filter(habit => habit.bindingRewardId === reward.id);
    return {
      ...reward,
      boundHabits
    };
  });

  return (
    <div className="space-y-6 pt-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">绑定管理</h2>
        <p className="text-gray-600 dark:text-gray-400">将习惯绑定到奖励，让每次努力都有明确目标</p>
      </div>

      {/* 创建新绑定 */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <Link2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>创建新绑定</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择习惯
              </label>
              <EnhancedSelect
                value={selectedHabit}
                onValueChange={setSelectedHabit}
                options={unboundHabits.map(habit => ({
                  value: habit.id,
                  label: habit.name,
                  icon: <Activity className="h-4 w-4" />,
                  count: habit.energyValue,
                  description: `每次完成获得 ${habit.energyValue} 能量`
                }))}
                width="w-full"
                placeholder="选择要绑定的习惯"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择奖励
              </label>
              <EnhancedSelect
                value={selectedReward}
                onValueChange={setSelectedReward}
                options={availableRewards.map(reward => ({
                  value: reward.id,
                  label: reward.name,
                  icon: <Star className="h-4 w-4" />,
                  count: reward.energyCost,
                  description: `需要消耗 ${reward.energyCost} 能量兑换`
                }))}
                width="w-full"
                placeholder="选择要绑定的奖励"
              />
            </div>
          </div>

          <Button 
            onClick={createBinding}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            disabled={!selectedHabit || !selectedReward}
          >
            创建绑定
          </Button>
        </CardContent>
      </Card>

      {/* 现有绑定 - 以奖励为主体显示 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          现有绑定 ({rewardsWithBindings.length} 个奖励)
        </h3>

        {rewardsWithBindings.length === 0 ? (
          <Card className="p-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>还没有任何绑定关系</p>
              <p className="text-sm mt-2">创建绑定让习惯与奖励产生关联！</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {rewardsWithBindings.map(reward => {
              const progress = Math.min((reward.currentEnergy / reward.energyCost) * 100, 100);

              return (
                <Card key={reward.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* 奖励信息 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Gift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          <div>
                            <h4 className="font-semibold text-lg text-purple-800 dark:text-purple-300">{reward.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700">
                                需要 {reward.energyCost}⚡
                              </Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {reward.boundHabits.length} 个习惯绑定
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 奖励进度 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>完成进度</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-amber-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                          {reward.currentEnergy}/{reward.energyCost}⚡
                        </div>
                      </div>

                      {/* 绑定的习惯列表 */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">绑定的习惯：</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {reward.boundHabits.map(habit => (
                            <div 
                              key={habit.id}
                              className="flex items-center justify-between p-3 ranking-item rounded-lg bg-gray-50 dark:bg-gray-700 border dark:border-gray-600"
                            >
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <div>
                                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{habit.name}</span>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    +{habit.energyValue}⚡ 每次完成
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeBinding(habit.id)}
                                className="text-xs px-2 py-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                <Unlink className="h-3 w-3 mr-1" />
                                解绑
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
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
