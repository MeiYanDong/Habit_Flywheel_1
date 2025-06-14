
import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Gift, Link2, BarChart3, Settings, Plus, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 数据管理类
class DataManager {
  static getHabits() {
    const data = localStorage.getItem('habitFlywheel_habits');
    return data ? JSON.parse(data) : [];
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
}

// 主应用组件
const Index = () => {
  const [activeModule, setActiveModule] = useState('today');
  const [habits, setHabits] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [completions, setCompletions] = useState([]);

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
          isArchived: false,
          createdAt: new Date().toISOString(),
          icon: '📚'
        },
        {
          id: 'h_002',
          name: '健身锻炼',
          energyValue: 20,
          bindingRewardId: 'r_002',
          isArchived: false,
          createdAt: new Date().toISOString(),
          icon: '💪'
        },
        {
          id: 'h_003',
          name: '学习编程',
          energyValue: 30,
          bindingRewardId: 'r_001',
          isArchived: false,
          createdAt: new Date().toISOString(),
          icon: '💻'
        }
      ];

      const defaultRewards = [
        {
          id: 'r_001',
          name: 'iPhone 15 Pro',
          energyCost: 1000,
          currentEnergy: 120,
          isRedeemed: false,
          createdAt: new Date().toISOString(),
          icon: '📱'
        },
        {
          id: 'r_002',
          name: 'ChatGPT Plus会员',
          energyCost: 200,
          currentEnergy: 60,
          isRedeemed: false,
          createdAt: new Date().toISOString(),
          icon: '🤖'
        }
      ];

      DataManager.saveHabits(defaultHabits);
      DataManager.saveRewards(defaultRewards);
      setHabits(defaultHabits);
      setRewards(defaultRewards);
    }
  }, []);

  // 完成习惯
  const completeHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || DataManager.isHabitCompletedToday(habitId)) return;

    // 添加完成记录
    DataManager.addCompletion(habitId, habit.energyValue, habit.bindingRewardId);

    // 如果有绑定奖励，增加奖励能量
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

    // 刷新完成记录
    setCompletions(DataManager.getCompletions());
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
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = completions.filter(c => c.date === today);
    const activeHabits = habits.filter(h => !h.isArchived);
    const completedHabits = activeHabits.filter(h => 
      todayCompletions.some(c => c.habitId === h.id)
    );
    const totalEnergyToday = todayCompletions.reduce((sum, c) => sum + c.energy, 0);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">今日习惯</h2>
          <p className="text-gray-600">专注今天，让每一次打卡都充满成就感</p>
        </div>

        <Card className="bg-gradient-to-r from-purple-50 to-amber-50 border-none">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700 mb-2">
                {completedHabits.length}/{activeHabits.length}
              </div>
              <div className="text-sm text-gray-600 mb-4">今日任务完成</div>
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-medium">已获得 {totalEnergyToday} 能量</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeHabits.map(habit => {
            const isCompleted = DataManager.isHabitCompletedToday(habit.id);
            const boundReward = rewards.find(r => r.id === habit.bindingRewardId);
            
            return (
              <Card key={habit.id} className={cn(
                "transition-all duration-200 hover:shadow-lg",
                isCompleted ? "bg-green-50 border-green-200" : "hover:shadow-md"
              )}>
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="text-2xl">{habit.icon}</div>
                    <h3 className="font-medium text-gray-900">{habit.name}</h3>
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-gray-600">+{habit.energyValue}</span>
                    </div>
                    
                    {isCompleted ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        ✅ 已完成
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => completeHabit(habit.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        🎯 立即打卡
                      </Button>
                    )}
                    
                    {boundReward && (
                      <div className="text-xs text-gray-500">
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

  // 渲染奖励管理模块
  const renderRewardsModule = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">奖励管理</h2>
            <p className="text-gray-600">设定目标，用能量点亮梦想</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            添加奖励
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(reward => {
            const progress = Math.min((reward.currentEnergy / reward.energyCost) * 100, 100);
            const canRedeem = reward.currentEnergy >= reward.energyCost;
            
            return (
              <Card key={reward.id} className={cn(
                "transition-all duration-200 hover:shadow-lg",
                canRedeem && "ring-2 ring-amber-400"
              )}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2">{reward.icon}</div>
                      <h3 className="font-medium text-gray-900">{reward.name}</h3>
                    </div>
                    
                    <div className="space-y-2">
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
                      <div className="text-center text-sm text-gray-600">
                        {reward.currentEnergy}/{reward.energyCost}⚡
                      </div>
                    </div>
                    
                    {canRedeem ? (
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                        🎉 立即兑换
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        🎯 继续努力
                      </Button>
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

  // 渲染其他模块的占位内容
  const renderPlaceholderModule = (title, description) => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
      case 'rewards':
        return renderRewardsModule();
      case 'habits':
        return renderPlaceholderModule('习惯管理', '全面的习惯生命周期管理');
      case 'bindings':
        return renderPlaceholderModule('绑定管理', '将习惯绑定到奖励，让每次努力都有明确目标');
      case 'history':
        return renderPlaceholderModule('历史记录', '回顾成长轨迹，数据见证努力');
      case 'settings':
        return renderPlaceholderModule('设置中心', '个性化设置，让体验更贴心');
      default:
        return renderTodayModule();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧边栏 */}
      <div className="w-64 bg-white shadow-lg border-r">
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="text-2xl mb-2">🌟</div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              习惯飞轮
            </h1>
            <p className="text-xs text-gray-600 mt-1">
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
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
