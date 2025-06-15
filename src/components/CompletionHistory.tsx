
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Zap, TrendingUp } from 'lucide-react';
import { useHabitCompletions } from '@/hooks/useHabitCompletions';
import { useHabits } from '@/hooks/useHabits';
import { HabitCompletionCard } from './HabitCompletionCard';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { zh } from 'date-fns/locale';

export const CompletionHistory = () => {
  const { completions, loading, deleteCompletion } = useHabitCompletions();
  const { habits } = useHabits();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const getHabitName = (habitId: string) => {
    return habits.find(h => h.id === habitId)?.name || '未知习惯';
  };

  const filterCompletionsByTime = (completions: any[]) => {
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        return completions.filter(c => {
          const date = new Date(c.completed_at);
          return date >= startOfDay(now) && date <= endOfDay(now);
        });
      case 'week':
        return completions.filter(c => {
          const date = new Date(c.completed_at);
          return date >= subDays(now, 7);
        });
      case 'month':
        return completions.filter(c => {
          const date = new Date(c.completed_at);
          return date >= subDays(now, 30);
        });
      default:
        return completions;
    }
  };

  const filteredCompletions = filterCompletionsByTime(completions);
  const totalEnergyGained = filteredCompletions.reduce((sum, c) => sum + c.energy_gained, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            完成历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="today">今天</TabsTrigger>
              <TabsTrigger value="week">本周</TabsTrigger>
              <TabsTrigger value="month">本月</TabsTrigger>
              <TabsTrigger value="all">全部</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  {filteredCompletions.length}
                </div>
                <p className="text-sm text-muted-foreground">完成次数</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                  <Zap className="h-5 w-5" />
                  {totalEnergyGained}
                </div>
                <p className="text-sm text-muted-foreground">获得能量</p>
              </div>
            </div>

            <TabsContent value={timeFilter} className="mt-4">
              {filteredCompletions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">暂无完成记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCompletions.map((completion) => (
                    <HabitCompletionCard
                      key={completion.id}
                      completion={completion}
                      habitName={getHabitName(completion.habit_id)}
                      onDelete={deleteCompletion}
                      showHabitName={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
