import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Gift, Link2, BarChart3, Settings, Plus, Target, Zap, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import HabitForm from '@/components/HabitForm';
import RewardForm from '@/components/RewardForm';
import BindingManager from '@/components/BindingManager';
import HistoryView from '@/components/HistoryView';
import SettingsCenter from '@/components/SettingsCenter';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

// 数据管理类
class DataManager {
  static getHabits() {
    const data = localStorage.getItem('habitFlywheel_habits');
    const habits = data ? JSON.parse(data) : [];
    
    // 确保所有习惯都有频率字段
    return habits.map(habit => ({
      ...habit,
      frequency: habit.frequency || 'daily',
      targetCount: habit.targetCount || 1
    }));
  }

  static saveHabits(habits) {
    localStorage.setItem('habitFlywheel_habits', JSON.stringify(habits));
  }

  static getRewards() {
    const data = localStorage.getItem('habitFlywheel_rewards');
    return data ? JSON.parse(data) : [];
  }

  static saveRewards(rewards) {
    localStorage.setItem('habitFlywheel_rewards', JSON.stringify(rewards));
  }

  static getCompletions() {
    const data = localStorage.getItem('habitFlywheel_completions');
    return data ? JSON.parse(data) : [];
  }

  static saveCompletions(completions) {
    localStorage.setItem('habitFlywheel_completions', JSON.stringify(completions));
  }

  static addCompletion(habitId, energy, boundRewardId) {
    const completions = this.getCompletions();
    const today = new Date().toISOString().split('T')[0];
    
    completions.push({
      id: `comp_${Date.now()}`,
      habitId,
      date: today,
      energy,
      boundRewardId,
      timestamp: new Date().toISOString()
    });
    
    this.saveCompletions(completions);
    return completions;
  }

  static isHabitCompletedToday(habitId) {
    const completions = this.getCompletions();
    const today = new Date().toISOString().split('T')[0];
    return completions.some(c => c.habitId === habitId && c.date === today);
  }

  static getHabitCompletionProgress(habitId, frequency = 'daily', targetCount = 1) {
    const completions = this.getCompletions();
    const now = new Date();
    let startDate;
    
    // 确保 frequency 有默认值
    if (!frequency) {
      frequency = 'daily';
    }
    
    if (frequency === 'daily') {
      return this.isHabitCompletedToday(habitId) ? 1 : 0;
    } else if (frequency === 'weekly') {
      // 获取本周开始日期（周一）
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
    } else if (frequency === 'monthly') {
      // 获取本月开始日期
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // 确保 startDate 存在且有效
    if (!startDate || isNaN(startDate.getTime())) {
      console.error('Invalid startDate calculated for habit:', habitId, 'frequency:', frequency);
      return 0;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const periodCompletions = completions.filter(c => 
      c.habitId === habitId && 
      c.date >= startDateStr && 
      c.date <= todayStr
    );
    
    return periodCompletions.length;
  }
}

// 主应用组件
const Index = () => {
  const [activeModule, setActiveModule] = useState('today');
  const [habits, setHabits] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [rewardFormOpen, setRewardFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [habitFilter, setHabitFilter] = useState('active'); // 'active', 'archived', 'all'
  const [rewardFilter, setRewardFilter] = useState('redeemable'); // 'redeemable', 'redeemed', 'all'
  const { toast } = useToast();
  const { showStats, showProgress, energyAnimations, compactMode, notifications } = useSettings();

  // 初始化数据
  useEffect(() => {
    const loadedHabits = DataManager.getHabits();
    const loadedRewards = DataManager.getRewards();
    const loadedCompletions = DataManager.getCompletions();

    setHabits(loadedHabits);
    setRewards(loadedRewards);
    setCompletions(loadedCompletions);

    // 如果是首次使用，创建示例数据
    if (loadedHabits.length === 0) {
      const defaultHabits = [
        {
          id: 'h_001',
          name: '每日阅读',
          energyValue: 10,
          bindingRewardId: 'r_001',
          frequency: 'daily',
          targetCount: 1,
          isArchived: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'h_002',
          name: '健身锻炼',
          energyValue: 20,
          bindingRewardId: 'r_002',
          frequency: 'weekly',
          targetCount: 3,
          isArchived: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'h_003',
          name: '学习编程',
          energyValue: 30,
          bindingRewardId: 'r_001',
          frequency: 'monthly',
          targetCount: 15,
          isArchived: false,
          createdAt: new Date().toISOString()
        }
      ];

      const defaultRewards = [
        {
          id: 'r_001',
          name: 'iPhone 15 Pro',
          energyCost: 1000,
          currentEnergy: 120,
          isRedeemed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'r_002',
          name: 'ChatGPT Plus会员',
          energyCost: 200,
          currentEnergy: 60,
          isRedeemed: false,
          createdAt: new Date().toISOString()
        }
      ];

      DataManager.saveHabits(defaultHabits);
      DataManager.saveRewards(defaultRewards);
      setHabits(defaultHabits);
      setRewards(defaultRewards);
    }
  }, []);

  // 创建新习惯
  const createHabit = (habitData) => {
    const newHabit = {
      id: `h_${Date.now()}`,
      name: habitData.name,
      description: habitData.description,
      energyValue: habitData.energyValue,
      bindingRewardId: habitData.bindingRewardId || null,
      frequency: habitData.frequency || 'daily',
      targetCount: habitData.targetCount || 1,
      isArchived: false,
      createdAt: new Date().toISOString()
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    DataManager.saveHabits(updatedHabits);
    
    toast({
      title: "习惯创建成功",
      description: `"${habitData.name}" 已添加到您的习惯列表中`,
    });
  };

  // 更新习惯
  const updateHabit = (habitData) => {
    const updatedHabits = habits.map(habit => 
      habit.id === editingHabit.id 
        ? { 
            ...habit, 
            name: habitData.name,
            description: habitData.description,
            energyValue: habitData.energyValue,
            bindingRewardId: habitData.bindingRewardId || null,
            frequency: habitData.frequency || 'daily',
            targetCount: habitData.targetCount || 1,
          }
        : habit
    );
    
    setHabits(updatedHabits);
    DataManager.saveHabits(updatedHabits);
    setEditingHabit(null);
    
    toast({
      title: "习惯更新成功",
      description: `"${habitData.name}" 的信息已更新`,
    });
  };

  // 删除习惯
  const deleteHabit = (habitId) => {
    const habitToDelete = habits.find(h => h.id === habitId);
    
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(updatedHabits);
    DataManager.saveHabits(updatedHabits);
    
    // 删除相关的完成记录
    const updatedCompletions = completions.filter(c => c.habitId !== habitId);
    setCompletions(updatedCompletions);
    DataManager.saveCompletions(updatedCompletions);
    
    toast({
      title: "习惯已删除",
      description: `"${habitToDelete?.name}" 及其相关记录已被删除`,
      variant: "destructive",
    });
  };

  // 归档/取消归档习惯
  const toggleArchiveHabit = (habitId) => {
    const updatedHabits = habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, isArchived: !habit.isArchived }
        : habit
    );
    
    setHabits(updatedHabits);
    DataManager.saveHabits(updatedHabits);
    
    const habit = habits.find(h => h.id === habitId);
    toast({
      title: habit?.isArchived ? "习惯已恢复" : "习惯已归档",
      description: `"${habit?.name}" ${habit?.isArchived ? '已恢复到活跃状态' : '已移至归档'}`,
    });
  };

  // 完成习惯
  const completeHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentProgress = DataManager.getHabitCompletionProgress(habit.id, habit.frequency, habit.targetCount);
    const targetCount = habit.frequency === 'daily' ? 1 : habit.targetCount;
    
    if (currentProgress >= targetCount) {
      toast({
        title: "本周期目标已完成",
        description: "您已完成本周期的目标，请等待下个周期开始",
        variant: "destructive",
      });
      return;
    }

    DataManager.addCompletion(habitId, habit.energyValue, habit.bindingRewardId);

    if (habit.bindingRewardId) {
      const updatedRewards = rewards.map(reward => {
        if (reward.id === habit.bindingRewardId) {
          return {
            ...reward,
            currentEnergy: reward.currentEnergy + habit.energyValue
          };
        }
        return reward;
      });
      setRewards(updatedRewards);
      DataManager.saveRewards(updatedRewards);
    }

    setCompletions(DataManager.getCompletions());
    
    if (notifications) {
      if (energyAnimations) {
        toast({
          title: "🎉 习惯完成！",
          description: `恭喜完成"${habit.name}"，获得 ${habit.energyValue} ⚡ 能量！`,
        });
      } else {
        toast({
          title: "习惯完成",
          description: `恭喜完成"${habit.name}"，获得 ${habit.energyValue} 能量！`,
        });
      }
    }
  };

  // 创建新奖励
  const createReward = (rewardData) => {
    const newReward = {
      id: `r_${Date.now()}`,
      name: rewardData.name,
      description: rewardData.description,
      energyCost: rewardData.energyCost,
      currentEnergy: 0,
      isRedeemed: false,
      createdAt: new Date().toISOString()
    };

    const updatedRewards = [...rewards, newReward];
    setRewards(updatedRewards);
    DataManager.saveRewards(updatedRewards);
    
    toast({
      title: "奖励创建成功",
      description: `"${rewardData.name}" 已添加到您的奖励列表中`,
    });
  };

  // 更新奖励
  const updateReward = (rewardData) => {
    const updatedRewards = rewards.map(reward => 
      reward.id === editingReward.id 
        ? { 
            ...reward, 
            name: rewardData.name,
            description: rewardData.description,
            energyCost: rewardData.energyCost,
          }
        : reward
    );
    
    setRewards(updatedRewards);
    DataManager.saveRewards(updatedRewards);
    setEditingReward(null);
    
    toast({
      title: "奖励更新成功",
      description: `"${rewardData.name}" 的信息已更新`,
    });
  };

  // 删除奖励
  const deleteReward = (rewardId) => {
    const rewardToDelete = rewards.find(r => r.id === rewardId);
    
    const updatedRewards = rewards.filter(reward => reward.id !== rewardId);
    setRewards(updatedRewards);
    DataManager.saveRewards(updatedRewards);
    
    // 解除相关习惯的绑定
    const updatedHabits = habits.map(habit => 
      habit.bindingRewardId === rewardId 
        ? { ...habit, bindingRewardId: null }
        : habit
    );
    setHabits(updatedHabits);
    DataManager.saveHabits(updatedHabits);
    
    toast({
      title: "奖励已删除",
      description: `"${rewardToDelete?.name}" 及其相关绑定已被删除`,
      variant: "destructive",
    });
  };

  // 兑换奖励
  const redeemReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.currentEnergy < reward.energyCost) return;

    const updatedRewards = rewards.map(r => 
      r.id === rewardId 
        ? { ...r, isRedeemed: true, redeemedAt: new Date().toISOString() }
        : r
    );
    
    setRewards(updatedRewards);
    DataManager.saveRewards(updatedRewards);
    
    toast({
      title: "奖励兑换成功",
      description: `恭喜您兑换了"${reward.name}"！`,
    });
  };

  // 更新习惯的绑定奖励
  const updateHabitBinding = (habitId: string, updates: { bindingRewardId?: string }) => {
    const updatedHabits = habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, ...updates }
        : habit
    );
    
    setHabits(updatedHabits);
    DataManager.saveHabits(updatedHabits);
  };

  // 数据导出功能
  const handleExportData = () => {
    const exportData = {
      habits: DataManager.getHabits(),
      rewards: DataManager.getRewards(),
      completions: DataManager.getCompletions(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-flywheel-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 数据导入功能
  const handleImportData = (importedData: any) => {
    try {
      if (importedData.habits) {
        setHabits(importedData.habits);
        DataManager.saveHabits(importedData.habits);
      }
      
      if (importedData.rewards) {
        setRewards(importedData.rewards);
        DataManager.saveRewards(importedData.rewards);
      }
      
      if (importedData.completions) {
        setCompletions(importedData.completions);
        DataManager.saveCompletions(importedData.completions);
      }
    } catch (error) {
      console.error('导入数据时出错:', error);
      throw error;
    }
  };

  // 清除所有数据
  const handleClearAllData = () => {
    setHabits([]);
    setRewards([]);
    setCompletions([]);
    DataManager.saveHabits([]);
    DataManager.saveRewards([]);
    DataManager.saveCompletions([]);
  };

  // 重置为默认数据
  const handleResetToDefaults = () => {
    const defaultHabits = [
      {
        id: 'h_001',
        name: '每日阅读',
        energyValue: 10,
        bindingRewardId: 'r_001',
        frequency: 'daily',
        targetCount: 1,
        isArchived: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'h_002',
        name: '健身锻炼',
        energyValue: 20,
        bindingRewardId: 'r_002',
        frequency: 'weekly',
        targetCount: 3,
        isArchived: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'h_003',
        name: '学习编程',
        energyValue: 30,
        bindingRewardId: 'r_001',
        frequency: 'monthly',
        targetCount: 15,
        isArchived: false,
        createdAt: new Date().toISOString()
      }
    ];

    const defaultRewards = [
      {
        id: 'r_001',
        name: 'iPhone 15 Pro',
        energyCost: 1000,
        currentEnergy: 120,
        isRedeemed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'r_002',
        name: 'ChatGPT Plus会员',
        energyCost: 200,
        currentEnergy: 60,
        isRedeemed: false,
        createdAt: new Date().toISOString()
      }
    ];

    setHabits(defaultHabits);
    setRewards(defaultRewards);
    setCompletions([]);
    DataManager.saveHabits(defaultHabits);
    DataManager.saveRewards(defaultRewards);
    DataManager.saveCompletions([]);
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

  // 渲染今日习惯模块（应用设置）
  const renderTodayModule = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = completions.filter(c => c.date === today);
    const activeHabits = habits.filter(h => !h.isArchived);
    const totalEnergyToday = todayCompletions.reduce((sum, c) => sum + c.energy, 0);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">今日习惯</h2>
          <p className="text-gray-600 dark:text-gray-400">专注今天，让每一次打卡都充满成就感</p>
        </div>

        {/* 统计卡片 - 根据设置显示 */}
        {showStats && (
          <Card className="bg-gradient-to-r from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 border-none">
            <CardContent className={cn("p-6", compactMode && "p-4")}>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                  {todayCompletions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">今日已完成</div>
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="text-lg font-medium">
                    已获得 {energyAnimations ? '⚡' : ''} {totalEnergyToday} 能量
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className={cn(
          "grid gap-4",
          compactMode ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {activeHabits.map(habit => {
            const currentProgress = DataManager.getHabitCompletionProgress(habit.id, habit.frequency || 'daily', habit.targetCount || 1);
            const targetCount = habit.frequency === 'daily' ? 1 : (habit.targetCount || 1);
            const isCompleted = currentProgress >= targetCount;
            const boundReward = rewards.find(r => r.id === habit.bindingRewardId);
            
            const getFrequencyText = () => {
              if (!habit.frequency || habit.frequency === 'daily') return '每日';
              if (habit.frequency === 'weekly') return `每周 ${habit.targetCount || 1} 次`;
              if (habit.frequency === 'monthly') return `每月 ${habit.targetCount || 1} 次`;
              return '每日';
            };
            
            return (
              <Card key={habit.id} className={cn(
                "transition-all duration-200 hover:shadow-lg",
                isCompleted ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "hover:shadow-md",
                compactMode && "p-2"
              )}>
                <CardContent className={cn("p-4", compactMode && "p-3")}>
                  <div className="text-center space-y-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{getFrequencyText()}</div>
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        +{habit.energyValue}{energyAnimations ? '⚡' : ''}
                      </span>
                    </div>
                    
                    {habit.frequency !== 'daily' && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        进度: {currentProgress}/{targetCount}
                      </div>
                    )}
                    
                    {isCompleted ? (
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                        ✅ 已完成
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => completeHabit(habit.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size={compactMode ? "sm" : "default"}
                      >
                        🎯 立即打卡
                      </Button>
                    )}
                    
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

  // 渲染习惯管理模块（应用进度条设置）
  const renderHabitsModule = () => {
    // 根据筛选条件过滤和排序习惯
    const getFilteredAndSortedHabits = () => {
      let filtered;
      switch (habitFilter) {
        case 'active':
          filtered = habits.filter(h => !h.isArchived);
          break;
        case 'archived':
          filtered = habits.filter(h => h.isArchived);
          break;
        case 'all':
          filtered = habits;
          break;
        default:
          filtered = habits.filter(h => !h.isArchived);
      }

      // 当筛选为全部习惯时，已归档习惯排序置后
      if (habitFilter === 'all') {
        return filtered.sort((a, b) => {
          if (a.isArchived && !b.isArchived) return 1;
          if (!a.isArchived && b.isArchived) return -1;
          return 0;
        });
      }

      return filtered;
    };

    const filteredHabits = getFilteredAndSortedHabits();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">习惯管理</h2>
            <p className="text-gray-600 dark:text-gray-400">管理您的习惯，让每一个小目标都成为成长的动力</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={habitFilter} onValueChange={setHabitFilter}>
              <SelectTrigger className="w-32">
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

        {/* 习惯列表 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {habitFilter === 'active' && `活跃习惯 (${filteredHabits.length})`}
            {habitFilter === 'archived' && `归档习惯 (${filteredHabits.length})`}
            {habitFilter === 'all' && `全部习惯 (${filteredHabits.length})`}
          </h3>
          
          {filteredHabits.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>
                  {habitFilter === 'active' && '还没有活跃的习惯'}
                  {habitFilter === 'archived' && '还没有归档的习惯'}
                  {habitFilter === 'all' && '还没有任何习惯'}
                </p>
                <p className="text-sm mt-2">点击"添加习惯"开始您的第一个习惯吧！</p>
              </div>
            </Card>
          ) : (
            <div className={cn(
              "grid gap-4",
              compactMode ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {filteredHabits.map(habit => {
                const boundReward = rewards.find(r => r.id === habit.bindingRewardId);
                const currentProgress = DataManager.getHabitCompletionProgress(habit.id, habit.frequency || 'daily', habit.targetCount || 1);
                const targetCount = habit.frequency === 'daily' ? 1 : (habit.targetCount || 1);
                const isCompleted = currentProgress >= targetCount;
                
                const getFrequencyText = () => {
                  if (!habit.frequency || habit.frequency === 'daily') return '每日';
                  if (habit.frequency === 'weekly') return `每周 ${habit.targetCount || 1} 次`;
                  if (habit.frequency === 'monthly') return `每月 ${habit.targetCount || 1} 次`;
                  return '每日';
                };
                
                return (
                  <Card key={habit.id} className={cn(
                    "hover:shadow-lg transition-shadow",
                    habit.isArchived && "opacity-60"
                  )}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{habit.name}</h4>
                              {habit.isArchived && (
                                <Badge variant="secondary" className="text-xs">已归档</Badge>
                              )}
                            </div>
                            {habit.description && (
                              <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
                            )}
                            <div className="text-xs text-gray-500 mb-2">{getFrequencyText()}</div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">+{habit.energyValue}{energyAnimations ? '⚡' : ''}</span>
                              </div>
                              {isCompleted && !habit.isArchived && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  本周期已完成
                                </Badge>
                              )}
                            </div>
                            {habit.frequency !== 'daily' && !habit.isArchived && (
                              <div className="text-xs text-gray-500 mt-1">
                                本周期进度: {currentProgress}/{targetCount}
                              </div>
                            )}
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
                              {boundReward.currentEnergy}/{boundReward.energyCost}⚡
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
                            {habit.isArchived ? '恢复' : '归档'}
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

        {/* 习惯表单对话框 */}
        <HabitForm
          isOpen={habitFormOpen}
          onClose={() => {
            setHabitFormOpen(false);
            setEditingHabit(null);
          }}
          onSubmit={editingHabit ? updateHabit : createHabit}
          initialData={editingHabit}
          rewards={rewards}
          isEditing={!!editingHabit}
        />
      </div>
    );
  };

  // 渲染奖励管理模块（应用进度条设置）
  const renderRewardsModule = () => {
    // 根据筛选条件过滤和排序奖励
    const getFilteredAndSortedRewards = () => {
      let filtered;
      switch (rewardFilter) {
        case 'redeemable':
          filtered = rewards.filter(r => !r.isRedeemed);
          break;
        case 'redeemed':
          filtered = rewards.filter(r => r.isRedeemed);
          break;
        case 'all':
          filtered = rewards;
          break;
        default:
          filtered = rewards;
      }

      if (rewardFilter === 'all') {
        return filtered.sort((a, b) => {
          const aCanRedeem = !a.isRedeemed && a.currentEnergy >= a.energyCost;
          const bCanRedeem = !b.isRedeemed && b.currentEnergy >= b.energyCost;
          
          if (aCanRedeem && !bCanRedeem) return -1;
          if (!aCanRedeem && bCanRedeem) return 1;
          if (a.isRedeemed && !b.isRedeemed) return 1;
          if (!a.isRedeemed && b.isRedeemed) return -1;
          return 0;
        });
      }

      return filtered;
    };

    const filteredRewards = getFilteredAndSortedRewards();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">奖励管理</h2>
            <p className="text-gray-600 dark:text-gray-400">设定目标，用能量点亮梦想</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={rewardFilter} onValueChange={setRewardFilter}>
              <SelectTrigger className="w-32">
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
            {rewardFilter === 'redeemable' && `可兑换奖励 (${filteredRewards.length})`}
            {rewardFilter === 'redeemed' && `已兑换奖励 (${filteredRewards.length})`}
            {rewardFilter === 'all' && `全部奖励 (${filteredRewards.length})`}
          </h3>
          
          {filteredRewards.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>
                  {rewardFilter === 'redeemable' && '还没有可兑换的奖励'}
                  {rewardFilter === 'redeemed' && '还没有已兑换的奖励'}
                  {rewardFilter === 'all' && '还没有任何奖励'}
                </p>
                <p className="text-sm mt-2">点击"添加奖励"创建您的第一个奖励吧！</p>
              </div>
            </Card>
          ) : (
            <div className={cn(
              "grid gap-4",
              compactMode ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {filteredRewards.map(reward => {
                const progress = Math.min((reward.currentEnergy / reward.energyCost) * 100, 100);
                const canRedeem = reward.currentEnergy >= reward.energyCost;
                
                return (
                  <Card key={reward.id} className={cn(
                    "transition-all duration-200 hover:shadow-lg",
                    canRedeem && !reward.isRedeemed && "ring-2 ring-amber-400",
                    reward.isRedeemed && "opacity-60"
                  )}>
                    <CardContent className={cn("p-4", compactMode && "p-3")}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{reward.name}</h3>
                              {reward.isRedeemed && (
                                <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 text-xs">
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
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteReward(reward.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>进度</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          
                          {/* 根据设置显示或隐藏进度条 */}
                          {showProgress && (
                            <Progress value={progress} className="h-2" />
                          )}
                          
                          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                            {reward.currentEnergy}/{reward.energyCost}{energyAnimations ? '⚡' : ' 能量'}
                          </div>
                        </div>
                        
                        {reward.isRedeemed ? (
                          <Button variant="outline" className="w-full" disabled>
                            ✅ 已兑换
                          </Button>
                        ) : canRedeem ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                            onClick={() => redeemReward(reward.id)}
                            size={compactMode ? "sm" : "default"}
                          >
                            🎉 立即兑换
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" size={compactMode ? "sm" : "default"}>
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

        {/* 奖励表单对话框 */}
        <RewardForm
          isOpen={rewardFormOpen}
          onClose={() => {
            setRewardFormOpen(false);
            setEditingReward(null);
          }}
          onSubmit={editingReward ? updateReward : createReward}
          initialData={editingReward}
          isEditing={!!editingReward}
        />
      </div>
    );
  };

  // 渲染绑定管理模块
  const renderBindingsModule = () => {
    return (
      <BindingManager
        habits={habits}
        rewards={rewards}
        onUpdateHabit={updateHabitBinding}
      />
    );
  };

  // 渲染其他模块的占位内容
  const renderPlaceholderModule = (title, description) => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <Card className="p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>该模块正在开发中...</p>
          <p className="text-sm mt-2">敬请期待更多功能！</p>
        </div>
      </Card>
    </div>
  );

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
            habits={habits}
            completions={completions}
          />
        );
      case 'settings':
        return (
          <SettingsCenter
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
            onResetToDefaults={handleResetToDefaults}
          />
        );
      default:
        return renderTodayModule();
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200",
      compactMode && "text-sm"
    )}>
      {/* 左侧边栏 */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
        <div className={cn("p-6", compactMode && "p-4")}>
          <div className="text-center mb-8">
            <div className="text-2xl mb-2">🌟</div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              习惯飞轮
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              让每一份努力<br />都精准浇灌你的目标
            </p>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeModule === item.id
                    ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200",
                  compactMode && "py-1"
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
