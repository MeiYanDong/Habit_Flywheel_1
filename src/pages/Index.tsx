import React, { useState } from 'react';
import { Calendar, CheckCircle, Gift, Link2, BarChart3, Settings, Plus, Target, Zap, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import HabitForm from '@/components/HabitForm';
import RewardForm from '@/components/RewardForm';
import BindingManager from '@/components/BindingManager';
import HistoryView from '@/components/HistoryView';
import SettingsCenter from '@/components/SettingsCenter';
import UserAccountPopover from '@/components/UserAccountPopover';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { useHabits, Habit } from '@/hooks/useHabits';
import { useRewards, Reward } from '@/hooks/useRewards';

const Index = () => {
  const { showProgress, showStats, notifications } = useSettings();
  const { user } = useAuth();
  const { habits, loading: habitsLoading, createHabit, updateHabit, deleteHabit } = useHabits();
  const { rewards, loading: rewardsLoading, createReward, updateReward, deleteReward, redeemReward } = useRewards();
  
  const [activeModule, setActiveModule] = useState('today');
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [rewardFormOpen, setRewardFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [habitFilter, setHabitFilter] = useState('active');
  const [rewardFilter, setRewardFilter] = useState('redeemable');
  const { toast } = useToast();

  // 处理创建习惯
  const handleCreateHabit = async (habitData: any) => {
    await createHabit({
      name: habitData.name,
      description: habitData.description,
      energy_value: habitData.energyValue,
      binding_reward_id: habitData.bindingRewardId || null,
      is_archived: false,
    });
    setHabitFormOpen(false);
  };

  // 处理更新习惯
  const handleUpdateHabit = async (habitData: any) => {
    if (!editingHabit) return;
    
    await updateHabit(editingHabit.id, {
      name: habitData.name,
      description: habitData.description,
      energy_value: habitData.energyValue,
      binding_reward_id: habitData.bindingRewardId || null,
    });
    setEditingHabit(null);
    setHabitFormOpen(false);
  };

  // 处理归档/恢复习惯
  const toggleArchiveHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    await updateHabit(habitId, { is_archived: !habit.is_archived });
  };

  // 处理创建奖励
  const handleCreateReward = async (rewardData: any) => {
    await createReward({
      name: rewardData.name,
      description: rewardData.description,
      energy_cost: rewardData.energyCost,
    });
    setRewardFormOpen(false);
  };

  // 处理更新奖励
  const handleUpdateReward = async (rewardData: any) => {
    if (!editingReward) return;
    
    await updateReward(editingReward.id, {
      name: rewardData.name,
      description: rewardData.description,
      energy_cost: rewardData.energyCost,
    });
    setEditingReward(null);
    setRewardFormOpen(false);
  };

  // 更新习惯绑定
  const updateHabitBinding = async (habitId: string, updates: { bindingRewardId?: string }) => {
    await updateHabit(habitId, { binding_reward_id: updates.bindingRewardId });
  };

  // 菜单项配置
  const menuItems = [
    { id: 'today', label: '今日习惯', icon: Calendar },
    { id: 'habits', label: '习惯管理', icon: CheckCircle },
    { id: 'rewards', label: '奖励管理', icon: Gift },
    { id: 'bindings', label: '绑定管理', icon: Link2 },
    { id: 'history', label: '历史记录', icon: BarChart3 },
    { id: 'settings', label: '设置中心', icon: Settings }
  ];

  // 渲染今日习惯模块
  const renderTodayModule = () => {
    const activeHabits = habits.filter(h => !h.is_archived);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">今日习惯</h2>
          <p className="text-gray-600 dark:text-gray-400">专注今天，让每一次打卡都充满成就感</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeHabits.map(habit => {
            const boundReward = rewards.find(r => r.id === habit.binding_reward_id);
            
            return (
              <Card key={habit.id} className="transition-all duration-200 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h3>
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">+{habit.energy_value}</span>
                    </div>
                    
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      🎯 立即打卡
                    </Button>
                    
                    {boundReward && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        → {boundReward.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染习惯管理模块
  const renderHabitsModule = () => {
    const getFilteredHabits = () => {
      switch (habitFilter) {
        case 'active':
          return habits.filter(h => !h.is_archived);
        case 'archived':
          return habits.filter(h => h.is_archived);
        case 'all':
          return habits;
        default:
          return habits.filter(h => !h.is_archived);
      }
    };

    const filteredHabits = getFilteredHabits();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">习惯管理</h2>
            <p className="text-gray-600 dark:text-gray-400">管理您的习惯，让每一个小目标都成为成长的动力</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={habitFilter} onValueChange={setHabitFilter}>
              <SelectTrigger className="w-32 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">活跃习惯</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
                <SelectItem value="all">全部习惯</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setHabitFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加习惯
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {habitFilter === 'active' && `活跃习惯 (${filteredHabits.length})`}
            {habitFilter === 'archived' && `归档习惯 (${filteredHabits.length})`}
            {habitFilter === 'all' && `全部习惯 (${filteredHabits.length})`}
          </h3>
          
          {filteredHabits.length === 0 ? (
            <Card className="p-8 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>还没有习惯</p>
                <p className="text-sm mt-2">点击"添加习惯"开始您的第一个习惯吧！</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHabits.map(habit => {
                const boundReward = rewards.find(r => r.id === habit.binding_reward_id);
                
                return (
                  <Card key={habit.id} className={cn(
                    "hover:shadow-lg transition-shadow",
                    habit.is_archived && "opacity-60"
                  )}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{habit.name}</h4>
                              {habit.is_archived && (
                                <Badge variant="secondary" className="text-xs">已归档</Badge>
                              )}
                            </div>
                            {habit.description && (
                              <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
                            )}
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">+{habit.energy_value}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingHabit(habit);
                                setHabitFormOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteHabit(habit.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {boundReward && (
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <div className="text-xs text-purple-600 mb-1">绑定奖励</div>
                            <div className="text-sm font-medium text-purple-800">
                              {boundReward.name}
                            </div>
                            <div className="text-xs text-purple-600">
                              {boundReward.current_energy}/{boundReward.energy_cost}⚡
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleArchiveHabit(habit.id)}
                            className="flex-1"
                          >
                            {habit.is_archived ? '恢复' : '归档'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <HabitForm
          isOpen={habitFormOpen}
          onClose={() => {
            setHabitFormOpen(false);
            setEditingHabit(null);
          }}
          onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
          initialData={editingHabit ? {
            name: editingHabit.name,
            description: editingHabit.description,
            energyValue: editingHabit.energy_value,
            bindingRewardId: editingHabit.binding_reward_id
          } : null}
          rewards={rewards.map(r => ({
            id: r.id,
            name: r.name,
            energyCost: r.energy_cost,
            currentEnergy: r.current_energy,
            isRedeemed: r.is_redeemed
          }))}
          isEditing={!!editingHabit}
        />
      </div>
    );
  };

  // 渲染奖励管理模块
  const renderRewardsModule = () => {
    const getFilteredRewards = () => {
      switch (rewardFilter) {
        case 'redeemable':
          return rewards.filter(r => !r.is_redeemed);
        case 'redeemed':
          return rewards.filter(r => r.is_redeemed);
        case 'all':
          return rewards;
        default:
          return rewards;
      }
    };

    const filteredRewards = getFilteredRewards();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">奖励管理</h2>
            <p className="text-gray-600 dark:text-gray-400">设定目标，用能量点亮梦想</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={rewardFilter} onValueChange={setRewardFilter}>
              <SelectTrigger className="w-32 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="redeemable">可兑换</SelectItem>
                <SelectItem value="redeemed">已兑换</SelectItem>
                <SelectItem value="all">全部奖励</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setRewardFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加奖励
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            奖励列表 ({filteredRewards.length})
          </h3>
          
          {filteredRewards.length === 0 ? (
            <Card className="p-8 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>还没有奖励</p>
                <p className="text-sm mt-2">点击"添加奖励"创建您的第一个奖励吧！</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRewards.map(reward => {
                const progress = Math.min((reward.current_energy / reward.energy_cost) * 100, 100);
                const canRedeem = reward.current_energy >= reward.energy_cost;
                
                return (
                  <Card key={reward.id} className={cn(
                    "transition-all duration-200 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700",
                    canRedeem && !reward.is_redeemed && "ring-2 ring-amber-400",
                    reward.is_redeemed && "opacity-60"
                  )}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{reward.name}</h3>
                              {reward.is_redeemed && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs dark:bg-green-800 dark:text-green-100">
                                  已兑换
                                </Badge>
                              )}
                            </div>
                            {reward.description && (
                              <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingReward(reward);
                                setRewardFormOpen(true);
                              }}
                              className="dark:border-gray-600"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteReward(reward.id)}
                              className="dark:border-gray-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="dark:text-gray-300">进度</span>
                            <span className="dark:text-gray-300">{Math.round(progress)}%</span>
                          </div>
                          {showProgress && (
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                            {reward.current_energy}/{reward.energy_cost}⚡
                          </div>
                        </div>
                        
                        {reward.is_redeemed ? (
                          <Button variant="outline" className="w-full dark:border-gray-600" disabled>
                            ✅ 已兑换
                          </Button>
                        ) : canRedeem ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                            onClick={() => redeemReward(reward.id)}
                          >
                            🎉 立即兑换
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full dark:border-gray-600">
                            🎯 继续努力
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <RewardForm
          isOpen={rewardFormOpen}
          onClose={() => {
            setRewardFormOpen(false);
            setEditingReward(null);
          }}
          onSubmit={editingReward ? handleUpdateReward : handleCreateReward}
          initialData={editingReward ? {
            name: editingReward.name,
            description: editingReward.description,
            energyCost: editingReward.energy_cost
          } : null}
          isEditing={!!editingReward}
        />
      </div>
    );
  };

  // 渲染绑定管理模块
  const renderBindingsModule = () => {
    const mappedHabits = habits.map(h => ({
      id: h.id,
      name: h.name,
      energyValue: h.energy_value,
      bindingRewardId: h.binding_reward_id,
      isArchived: h.is_archived
    }));

    const mappedRewards = rewards.map(r => ({
      id: r.id,
      name: r.name,
      energyCost: r.energy_cost,
      currentEnergy: r.current_energy,
      isRedeemed: r.is_redeemed
    }));

    return (
      <BindingManager
        habits={mappedHabits}
        rewards={mappedRewards}
        onUpdateHabit={updateHabitBinding}
      />
    );
  };

  // 根据当前模块渲染内容
  const renderContent = () => {
    switch (activeModule) {
      case 'today':
        return renderTodayModule();
      case 'habits':
        return renderHabitsModule();
      case 'rewards':
        return renderRewardsModule();
      case 'bindings':
        return renderBindingsModule();
      case 'history':
        return (
          <HistoryView
            habits={habits.map(h => ({
              id: h.id,
              name: h.name,
              energyValue: h.energy_value,
              frequency: 'daily',
              targetCount: 1,
              isArchived: h.is_archived,
              createdAt: h.created_at
            }))}
            completions={[]}
          />
        );
      case 'settings':
        return (
          <SettingsCenter
            onExportData={() => {}}
            onImportData={() => {}}
            onClearAllData={() => {}}
            onResetToDefaults={() => {}}
          />
        );
      default:
        return renderTodayModule();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 左侧边栏 */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <div className="text-2xl mb-2">🌟</div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                习惯飞轮
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                让每一份努力<br />都精准浇灌你的目标
              </p>
            </div>
            
            {/* 用户账户图标 */}
            <div className="ml-2">
              <UserAccountPopover />
            </div>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeModule === item.id
                    ? "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
