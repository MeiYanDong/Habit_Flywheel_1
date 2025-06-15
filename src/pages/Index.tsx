
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target, Gift, Calendar, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { useRewards } from '@/hooks/useRewards';
import { HabitForm } from '@/components/HabitForm';
import { RewardForm } from '@/components/RewardForm';
import { BindingManager } from '@/components/BindingManager';
import { CompletionHistory } from '@/components/CompletionHistory';
import { SettingsCenter } from '@/components/SettingsCenter';
import { HabitCard } from '@/components/HabitCard';
import { EnergyDisplay } from '@/components/EnergyDisplay';
import { UserAccountPopover } from '@/components/UserAccountPopover';

export default function Index() {
  const { user } = useAuth();
  const { habits, updateHabit, deleteHabit } = useHabits();
  const { rewards } = useRewards();
  
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [showBindingManager, setShowBindingManager] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">习惯养成</CardTitle>
            <p className="text-muted-foreground">请先登录以开始使用</p>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/auth'}>
              去登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeHabits = habits.filter(h => !h.is_archived);
  const availableRewards = rewards.filter(r => !r.is_redeemed);

  const getBoundReward = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit?.binding_reward_id) return undefined;
    return rewards.find(r => r.id === habit.binding_reward_id);
  };

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setShowHabitForm(true);
  };

  const handleArchiveHabit = (habitId: string) => {
    updateHabit(habitId, { is_archived: true });
  };

  const handleManageBinding = (habitId: string) => {
    setSelectedHabitId(habitId);
    setShowBindingManager(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">习惯养成</h1>
            <p className="text-muted-foreground">培养好习惯，获得奖励</p>
          </div>
          <UserAccountPopover />
        </div>

        {/* Energy Display */}
        <div className="mb-6">
          <EnergyDisplay />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="habits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              习惯
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              奖励
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              历史
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">我的习惯</h2>
              <Button onClick={() => setShowHabitForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                添加习惯
              </Button>
            </div>

            {activeHabits.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">还没有习惯</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    创建您的第一个习惯，开始习惯养成之旅！
                  </p>
                  <Button onClick={() => setShowHabitForm(true)}>
                    添加习惯
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    boundReward={getBoundReward(habit.id)}
                    onEdit={handleEditHabit}
                    onArchive={handleArchiveHabit}
                    onDelete={deleteHabit}
                    onManageBinding={handleManageBinding}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">我的奖励</h2>
              <Button onClick={() => setShowRewardForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                添加奖励
              </Button>
            </div>

            {availableRewards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">还没有奖励</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    创建奖励来激励自己完成习惯！
                  </p>
                  <Button onClick={() => setShowRewardForm(true)}>
                    添加奖励
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableRewards.map((reward) => (
                  <Card key={reward.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>🎁 {reward.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingReward(reward);
                            setShowRewardForm(true);
                          }}
                        >
                          编辑
                        </Button>
                      </CardTitle>
                      {reward.description && (
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">需要 {reward.energy_cost} 能量</span>
                        <span className="text-sm text-muted-foreground">
                          {reward.current_energy}/{reward.energy_cost}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <CompletionHistory />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsCenter />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showHabitForm && (
          <HabitForm
            habit={editingHabit}
            onClose={() => {
              setShowHabitForm(false);
              setEditingHabit(null);
            }}
          />
        )}

        {showRewardForm && (
          <RewardForm
            reward={editingReward}
            onClose={() => {
              setShowRewardForm(false);
              setEditingReward(null);
            }}
          />
        )}

        {showBindingManager && (
          <BindingManager
            habitId={selectedHabitId}
            onClose={() => {
              setShowBindingManager(false);
              setSelectedHabitId('');
            }}
          />
        )}
      </div>
    </div>
  );
}
