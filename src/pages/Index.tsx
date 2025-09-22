import React, { useState } from 'react';
import { Calendar, CheckCircle, Gift, Link2, BarChart3, Settings, Plus, Target, Zap, Edit, Trash2, Archive, Activity, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
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
import { useTranslation } from 'react-i18next';
import { useHabits, Habit } from '@/hooks/useHabits';
import { useRewards, Reward } from '@/hooks/useRewards';
import { useHabitCompletions } from '@/hooks/useHabitCompletions';

const Index = () => {
  const { showProgress, showStats, notifications } = useSettings();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { habits, loading: habitsLoading, createHabit, updateHabit, deleteHabit, checkInHabit, unCheckInHabit } = useHabits();
  const { rewards, loading: rewardsLoading, createReward, updateReward, deleteReward, redeemReward, optimisticAddEnergyToReward, rollbackAddEnergyToReward, optimisticSubtractEnergyFromReward, rollbackSubtractEnergyFromReward, refetch: refetchRewards } = useRewards();
  const { isCompletedToday, optimisticAddCompletion, rollbackAddCompletion, optimisticRemoveCompletion, rollbackRemoveCompletion, clearOptimisticRemoval, refetch: refetchCompletions } = useHabitCompletions();
  
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
    // 将 undefined 转换为 null，确保数据库字段正确清空
    const binding_reward_id = updates.bindingRewardId === undefined ? null : updates.bindingRewardId;
    await updateHabit(habitId, { binding_reward_id });
  };

  // 菜单项配置
  const menuItems = [
    { id: 'today', label: t('nav.today'), icon: Calendar, shortLabel: t('nav.todayShort') },
    { id: 'habits', label: t('nav.habits'), icon: CheckCircle, shortLabel: t('nav.habitsShort') },
    { id: 'rewards', label: t('nav.rewards'), icon: Gift, shortLabel: t('nav.rewardsShort') },
    { id: 'bindings', label: t('nav.bindings'), icon: Link2, shortLabel: t('nav.bindingsShort') },
    { id: 'history', label: t('nav.history'), icon: BarChart3, shortLabel: t('nav.historyShort') },
    { id: 'settings', label: t('nav.settings'), icon: Settings, shortLabel: t('nav.settingsShort') }
  ];

  // 渲染今日习惯模块
  const renderTodayModule = () => {
    const activeHabits = habits.filter(h => !h.is_archived);

    return (
      <div className="space-y-6 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('today.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('today.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeHabits.map(habit => {
            const boundReward = rewards.find(r => r.id === habit.binding_reward_id);
            const isCompleted = isCompletedToday(habit.id);
            
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
                      className={cn(
                        "w-full",
                        isCompleted 
                          ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600" 
                          : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                      )}
                      onClick={async () => {
                        if (isCompleted) {
                          // 取消打卡
                          optimisticRemoveCompletion(habit.id);
                          if (habit.binding_reward_id) {
                            optimisticSubtractEnergyFromReward(habit.binding_reward_id, habit.energy_value);
                          }
                          try {
                            await unCheckInHabit(habit.id);
                            // 成功后重新获取数据确保一致性
                            refetchCompletions();
                            // 同时刷新奖励数据，确保绑定奖励的能量正确更新
                            refetchRewards();
                            clearOptimisticRemoval(habit.id); // 清理乐观删除状态
                          } catch (error) {
                            // 失败时回滚所有乐观更新
                            rollbackRemoveCompletion(habit.id);
                            if (habit.binding_reward_id) {
                              rollbackSubtractEnergyFromReward(habit.binding_reward_id, habit.energy_value);
                            }
                          }
                        } else {
                          // 打卡
                          optimisticAddCompletion(habit.id);
                          if (habit.binding_reward_id) {
                            optimisticAddEnergyToReward(habit.binding_reward_id, habit.energy_value);
                          }
                          try {
                            await checkInHabit(habit.id);
                            // 成功后重新获取数据确保一致性
                            refetchCompletions();
                            // 同时刷新奖励数据，确保绑定奖励的能量正确更新
                            refetchRewards();
                          } catch (error) {
                            // 失败时回滚所有乐观更新
                            rollbackAddCompletion(habit.id);
                            if (habit.binding_reward_id) {
                              rollbackAddEnergyToReward(habit.binding_reward_id, habit.energy_value);
                            }
                          }
                        }
                      }}
                    >
                      {isCompleted ? t('today.completed') : t('today.checkIn')}
                    </Button>
                    
                    {boundReward && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('today.boundTo', { rewardName: boundReward.name })}
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

    // 准备筛选选项数据
    const activeCount = habits.filter(h => !h.is_archived).length;
    const archivedCount = habits.filter(h => h.is_archived).length;
    const totalCount = habits.length;

    const habitFilterOptions = [
      {
        value: 'active',
        label: t('habits.active'),
        icon: <Activity className="h-4 w-4" />,
        count: activeCount,
        description: t('habits.activeDesc')
      },
      {
        value: 'archived',
        label: t('habits.archived'),
        icon: <Archive className="h-4 w-4" />,
        count: archivedCount,
        description: t('habits.archivedDesc')
      },
      {
        value: 'all',
        label: t('habits.all'),
        icon: <CheckCircle className="h-4 w-4" />,
        count: totalCount,
        description: t('habits.allDesc')
      }
    ];

    return (
      <div className="space-y-6 pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('habits.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('habits.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <div className="w-full sm:w-auto flex justify-center">
            <EnhancedSelect
              value={habitFilter}
              onValueChange={setHabitFilter}
              options={habitFilterOptions}
              width="w-48"
              placeholder={t('habits.filterPlaceholder')}
            />
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-all duration-200 hover:shadow-lg w-full sm:w-auto"
            onClick={() => setHabitFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('habits.add')}
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {habitFilter === 'active' && `${t('habits.active')} (${filteredHabits.length})`}
            {habitFilter === 'archived' && `${t('habits.archived')} (${filteredHabits.length})`}
            {habitFilter === 'all' && `${t('habits.all')} (${filteredHabits.length})`}
          </h3>
          
          {filteredHabits.length === 0 ? (
            <Card className="p-8 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>{t('habits.noHabits')}</p>
                <p className="text-sm mt-2">{t('habits.noHabitsDesc')}</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHabits.map(habit => {
                const boundReward = rewards.find(r => r.id === habit.binding_reward_id);
                
                return (
                  <Card key={habit.id} className={cn(
                    "hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700",
                    habit.is_archived && "opacity-60"
                  )}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h4>
                              {habit.is_archived && (
                                <Badge variant="secondary" className="text-xs">{t('habits.archived')}</Badge>
                              )}
                            </div>
                            {habit.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{habit.description}</p>
                            )}
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">+{habit.energy_value}</span>
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
                              className="dark:border-gray-600"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteHabit(habit.id)}
                              className="dark:border-gray-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {boundReward && (
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">{t('habits.boundReward')}</div>
                            <div className="text-sm font-medium text-purple-800 dark:text-purple-300">
                              {boundReward.name}
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">
                              {boundReward.current_energy}/{boundReward.energy_cost}⚡
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleArchiveHabit(habit.id)}
                            className="flex-1 dark:border-gray-600"
                          >
                            {habit.is_archived ? t('habits.restore') : t('habits.archive')}
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

    // 准备筛选选项数据
    const redeemableCount = rewards.filter(r => !r.is_redeemed).length;
    const redeemedCount = rewards.filter(r => r.is_redeemed).length;
    const totalRewardsCount = rewards.length;

    const rewardFilterOptions = [
      {
        value: 'redeemable',
        label: t('rewards.redeemable'),
        icon: <Star className="h-4 w-4" />,
        count: redeemableCount,
        description: t('rewards.redeemableDesc')
      },
      {
        value: 'redeemed',
        label: t('rewards.redeemed'),
        icon: <CheckCircle className="h-4 w-4" />,
        count: redeemedCount,
        description: t('rewards.redeemedDesc')
      },
      {
        value: 'all',
        label: t('rewards.all'),
        icon: <Gift className="h-4 w-4" />,
        count: totalRewardsCount,
        description: t('rewards.allDesc')
      }
    ];

    return (
      <div className="space-y-6 pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('rewards.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('rewards.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <div className="w-full sm:w-auto flex justify-center">
            <EnhancedSelect
              value={rewardFilter}
              onValueChange={setRewardFilter}
              options={rewardFilterOptions}
              width="w-48"
              placeholder={t('rewards.filterPlaceholder')}
            />
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-all duration-200 hover:shadow-lg w-full sm:w-auto"
            onClick={() => setRewardFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('rewards.add')}
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('rewards.list')} ({filteredRewards.length})
          </h3>
          
          {filteredRewards.length === 0 ? (
            <Card className="p-8 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>{t('rewards.noRewards')}</p>
                <p className="text-sm mt-2">{t('rewards.noRewardsDesc')}</p>
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
                                  {t('rewards.redeemed_status')}
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
                            <span className="dark:text-gray-300">{t('rewards.progress')}</span>
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
                            ✅ {t('rewards.redeemed_status')}
                          </Button>
                        ) : canRedeem ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                            onClick={() => redeemReward(reward.id)}
                          >
                            {t('rewards.redeem')}
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full dark:border-gray-600">
                            {t('rewards.keepGoing')}
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
        return <HistoryView />;
      case 'settings':
        return (
          <div className="space-y-6">
            {/* 手机端显示用户账户 */}
            <div className="lg:hidden">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="dark:text-gray-100">{t('settings.userAccount')}</span>
                    <UserAccountPopover />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.userAccountDesc')}
                  </p>
                </CardContent>
              </Card>
            </div>
            
          <SettingsCenter
            onExportData={() => {}}
            onImportData={() => {}}
            onClearAllData={() => {}}
            onResetToDefaults={() => {}}
          />
          </div>
        );
      default:
        return renderTodayModule();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 左侧边栏 */}
      <div className="hidden lg:block w-64 bg-white dark:bg-gray-800 shadow-lg border-r dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <div className="text-2xl mb-2">🌟</div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {t('app.title')}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t('app.subtitle')}
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
      <div className="hidden lg:block flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>

      {/* 手机端布局 */}
      <div className="lg:hidden w-full">
        {/* 手机端内容区 */}
        <div className="p-4 pb-20">
          {renderContent()}
        </div>

        {/* 手机端底部导航栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t dark:border-gray-700 z-50">
          <div className="grid grid-cols-6 py-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 transition-colors",
                  activeModule === item.id
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
