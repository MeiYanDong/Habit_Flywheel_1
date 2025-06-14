import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Calendar, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

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

  // 获取最近7天的数据用于趋势显示
  const recentDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = stats.dailyStats[dateStr] || { completions: 0, energy: 0 };
      days.push({
        date: dateStr,
        dateDisplay: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">数据统计</h2>
        <p className="text-gray-600">回顾成长轨迹，数据见证努力</p>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'all') => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">最近一周</SelectItem>
            <SelectItem value="month">最近一月</SelectItem>
            <SelectItem value="all">全部时间</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedHabit} onValueChange={setSelectedHabit}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部习惯</SelectItem>
            {habits.map(habit => (
              <SelectItem key={habit.id} value={habit.id}>
                {habit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">折线图</SelectItem>
            <SelectItem value="bar">柱状图</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalCompletions}</div>
            <div className="text-sm text-gray-600">总完成次数</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalEnergy}</div>
            <div className="text-sm text-gray-600">总获得能量</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-gray-900">{stats.uniqueDays}</div>
            <div className="text-sm text-gray-600">活跃天数</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900">
              {stats.uniqueDays > 0 ? Math.round(stats.totalCompletions / stats.uniqueDays * 10) / 10 : 0}
            </div>
            <div className="text-sm text-gray-600">日均完成</div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>最近7天趋势</span>
            <Badge variant="outline" className="ml-2">
              {chartType === 'line' ? '折线图' : '柱状图'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={recentDays}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis 
                    dataKey="dateDisplay" 
                    className="text-xs text-gray-600"
                  />
                  <YAxis className="text-xs text-gray-600" />
                  <Tooltip 
                    labelClassName="text-gray-900"
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completions" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                    name="完成次数"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f55e0b', strokeWidth: 2 }}
                    name="获得能量"
                  />
                </LineChart>
              ) : (
                <BarChart data={recentDays}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis 
                    dataKey="dateDisplay" 
                    className="text-xs text-gray-600"
                  />
                  <YAxis className="text-xs text-gray-600" />
                  <Tooltip 
                    labelClassName="text-gray-900"
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="completions" 
                    fill="#8b5cf6" 
                    name="完成次数"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="energy" 
                    fill="#f59e0b" 
                    name="获得能量"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            {getTimeRangeText()}数据趋势 - 紫色: 完成次数, 橙色: 获得能量
          </div>
        </CardContent>
      </Card>

      {/* 习惯排行 */}
      <Card>
        <CardHeader>
          <CardTitle>习惯完成排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.habitStats)
              .sort(([,a], [,b]) => b.completions - a.completions)
              .slice(0, 5)
              .map(([habitId, habitStat], index) => {
                const habit = habits.find(h => h.id === habitId);
                if (!habit) return null;

                return (
                  <div key={habitId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold">{habitStat.completions}</div>
                        <div className="text-gray-500">次数</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{habitStat.energy}</div>
                        <div className="text-gray-500">能量</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryView;
