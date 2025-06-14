
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Calendar } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  energyValue: number;
  isArchived: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  targetCount?: number;
}

interface Completion {
  id: string;
  habitId: string;
  date: string;
  energy: number;
  timestamp: string;
}

interface CompletionFormProps {
  habits: Habit[];
  completions: Completion[];
  setCompletions: React.Dispatch<React.SetStateAction<Completion[]>>;
}

const CompletionForm: React.FC<CompletionFormProps> = ({ habits, completions, setCompletions }) => {
  const today = new Date().toISOString().split('T')[0];

  const todayCompletions = completions.filter(c => c.date === today);
  const totalEnergyToday = todayCompletions.reduce((sum, c) => sum + c.energy, 0);

  const getHabitProgress = (habit: Habit) => {
    if (habit.frequency === 'daily') {
      return {
        completed: todayCompletions.filter(c => c.habitId === habit.id).length,
        target: 1,
        isCompleted: todayCompletions.some(c => c.habitId === habit.id)
      };
    }
    
    const now = new Date();
    let startDate: Date;
    
    if (habit.frequency === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
    } else { // monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const periodCompletions = completions.filter(c => {
      const completionDate = new Date(c.date);
      return c.habitId === habit.id && completionDate >= startDate;
    });
    
    return {
      completed: periodCompletions.length,
      target: habit.targetCount || 1,
      isCompleted: periodCompletions.length >= (habit.targetCount || 1)
    };
  };

  const handleComplete = (habit: Habit) => {
    const newCompletion: Completion = {
      id: `${Date.now()}-${habit.id}`,
      habitId: habit.id,
      date: today,
      energy: habit.energyValue,
      timestamp: Date.now().toString()
    };
    
    setCompletions(prev => [...prev, newCompletion]);
  };

  const activeHabits = habits.filter(h => !h.isArchived);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            今日概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{todayCompletions.length}</div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">{totalEnergyToday}</div>
              <div className="text-sm text-gray-600">获得能量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeHabits.length}</div>
              <div className="text-sm text-gray-600">总习惯数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {activeHabits.map(habit => {
          const progress = getHabitProgress(habit);
          
          return (
            <Card key={habit.id} className={progress.isCompleted ? 'bg-green-50 border-green-200' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{habit.name}</h3>
                      {progress.isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {habit.energyValue} 能量
                      </Badge>
                      <Badge variant="outline">
                        {habit.frequency === 'daily' ? '每日' : 
                         habit.frequency === 'weekly' ? `每周 ${habit.targetCount || 1} 次 (${progress.completed}/${progress.target})` :
                         habit.frequency === 'monthly' ? `每月 ${habit.targetCount || 1} 次 (${progress.completed}/${progress.target})` : 
                         '每日'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleComplete(habit)}
                    disabled={habit.frequency === 'daily' && progress.isCompleted}
                    className={progress.isCompleted ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}
                  >
                    {progress.isCompleted && habit.frequency === 'daily' ? '已完成' : '完成'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CompletionForm;
