import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, Calendar, TrendingUp, Zap, CheckCircle, Clock, CalendarDays, Archive } from 'lucide-react';

interface HistoryViewProps {
  habits: Array<{
    id: string;
    name: string;
    energyValue: number;
    isArchived: boolean;
  }>;
  completions: Array<{
    id: string;
    habitId: string;
    date: string;
    energy: number;
    timestamp: string;
  }>;
}

const HistoryView: React.FC<HistoryViewProps> = ({ habits, completions }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [selectedHabit, setSelectedHabit] = useState<string>('all');

  // 计算统计数据
  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    const filteredCompletions = completions.filter(c => {
      const completionDate = new Date(c.date);
      const habitFilter = selectedHabit === 'all' || c.habitId === selectedHabit;
      return completionDate >= startDate && habitFilter;
    });

    const totalCompletions = filteredCompletions.length;
    const totalEnergy = filteredCompletions.reduce((sum, c) => sum + c.energy, 0);
    const uniqueDays = new Set(filteredCompletions.map(c => c.date)).size;

    // 按日期分组
    const dailyStats = filteredCompletions.reduce((acc, completion) => {
      const date = completion.date;
      if (!acc[date]) {
        acc[date] = { completions: 0, energy: 0 };
      }
      acc[date].completions += 1;
      acc[date].energy += completion.energy;
      return acc;
    }, {} as Record<string, { completions: number; energy: number }>);

    // 按习惯分组
    const habitStats = filteredCompletions.reduce((acc, completion) => {
      const habitId = completion.habitId;
      if (!acc[habitId]) {
        acc[habitId] = { completions: 0, energy: 0 };
      }
      acc[habitId].completions += 1;
      acc[habitId].energy += completion.energy;
      return acc;
    }, {} as Record<string, { completions: number; energy: number }>);

    return {
      totalCompletions,
      totalEnergy,
      uniqueDays,
      dailyStats,
      habitStats,
      filteredCompletions
    };
  }, [completions, timeRange, selectedHabit]);

  // 获取最近7天的数据用于折线图显示
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = stats.dailyStats[dateStr] || { completions: 0, energy: 0 };
      days.push({
        date: dateStr,
        day: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        completions: dayStats.completions,
        energy: dayStats.energy
      });
    }
    return days;
  }, [stats.dailyStats]);



  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'week': return '最近一周';
      case 'month': return '最近一月';
      case 'all': return '全部时间';
    }
  };

  return (
    <div className="w-full max-w-none overflow-x-hidden">
      {/* 移动端全宽容器 */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 lg:px-0">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">历史记录</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">回顾成长轨迹，数据见证努力</p>
        </div>

        {/* 筛选器 - 移动端优化 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <EnhancedSelect
            value={timeRange}
            onValueChange={(value: 'week' | 'month' | 'all') => setTimeRange(value)}
            options={[
              {
                value: 'week',
                label: '最近一周',
                icon: <Clock className="h-4 w-4" />,
                description: '查看最近7天的数据'
              },
              {
                value: 'month',
                label: '最近一月',
                icon: <CalendarDays className="h-4 w-4" />,
                description: '查看最近30天的数据'
              },
              {
                value: 'all',
                label: '全部时间',
                icon: <Archive className="h-4 w-4" />,
                description: '查看所有历史数据'
              }
            ]}
            width="w-full sm:w-44"
            placeholder="选择时间范围"
          />

          <EnhancedSelect
            value={selectedHabit}
            onValueChange={setSelectedHabit}
            options={[
              {
                value: 'all',
                label: '全部习惯',
                icon: <CheckCircle className="h-4 w-4" />,
                count: habits.length,
                description: '显示所有习惯的数据'
              },
              ...habits.map(habit => ({
                value: habit.id,
                label: habit.name,
                icon: <Zap className="h-4 w-4" />,
                description: `查看 ${habit.name} 的历史数据`
              }))
            ]}
            width="w-full sm:w-48"
            placeholder="选择习惯"
          />
        </div>

        {/* 统计卡片 - 移动端2x2布局 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
          <Card className="min-w-0 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto mb-1 sm:mb-2 text-green-600 dark:text-green-400" />
              <div className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{stats.totalCompletions}</div>
              <div className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">总完成次数</div>
            </CardContent>
          </Card>

          <Card className="min-w-0 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <Zap className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto mb-1 sm:mb-2 text-amber-500" />
              <div className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{stats.totalEnergy}</div>
              <div className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">总获得能量</div>
            </CardContent>
          </Card>

          <Card className="min-w-0 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto mb-1 sm:mb-2 text-purple-600 dark:text-purple-400" />
              <div className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{stats.uniqueDays}</div>
              <div className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">活跃天数</div>
            </CardContent>
          </Card>

          <Card className="min-w-0 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto mb-1 sm:mb-2 text-blue-600 dark:text-blue-400" />
              <div className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {stats.uniqueDays > 0 ? Math.round(stats.totalCompletions / stats.uniqueDays * 10) / 10 : 0}
              </div>
              <div className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">日均完成</div>
            </CardContent>
          </Card>
        </div>

        {/* 折线图趋势 - 移动端优化 */}
        <Card className="w-full min-w-0 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2 sm:pb-3 md:pb-6">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
              <span>最近7天趋势</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 sm:px-6">
            <div className="w-full overflow-x-auto">
              <div className="h-[160px] sm:h-[200px] md:h-[300px] min-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    className="text-xs dark:fill-gray-400"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    className="text-xs dark:fill-gray-400"
                  />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completions" 
                      stroke="#8b5cf6"
                    strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                      stroke="#f59e0b"
                    strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2 }}
                    strokeDasharray="3 3"
                  />
                </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-center text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 md:mt-4">
              实线表示完成次数，虚线表示获得能量
            </div>
          </CardContent>
        </Card>

        {/* 习惯排行 - 移动端优化 */}
        <Card className="w-full min-w-0 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2 sm:pb-3 md:pb-6">
            <CardTitle className="text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100">习惯完成排行</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 sm:px-6">
            <div className="space-y-2 md:space-y-3">
              {Object.entries(stats.habitStats)
                .sort(([,a], [,b]) => b.completions - a.completions)
                .slice(0, 5)
                .map(([habitId, habitStat], index) => {
                  const habit = habits.find(h => h.id === habitId);
                  if (!habit) return null;

                  return (
                    <div key={habitId} className="flex items-center justify-between p-2 sm:p-3 ranking-item rounded-lg min-w-0 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-xs sm:text-sm md:text-base truncate text-gray-900 dark:text-gray-100">{habit.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 text-xs sm:text-xs md:text-sm flex-shrink-0">
                        <div className="text-center">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{habitStat.completions}</div>
                          <div className="text-gray-500 dark:text-gray-400">次数</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{habitStat.energy}</div>
                          <div className="text-gray-500 dark:text-gray-400">能量</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryView;
