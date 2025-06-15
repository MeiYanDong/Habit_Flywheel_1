
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { CheckCircle, Zap, MoreVertical, Edit, Archive, Trash2, Link, Unlink } from 'lucide-react';
import { Habit } from '@/hooks/useHabits';
import { Reward } from '@/hooks/useRewards';
import { useHabitCompletions } from '@/hooks/useHabitCompletions';

interface HabitCardProps {
  habit: Habit;
  boundReward?: Reward;
  onEdit: (habit: Habit) => void;
  onArchive: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onManageBinding: (habitId: string) => void;
}

export const HabitCard = ({ 
  habit, 
  boundReward, 
  onEdit, 
  onArchive, 
  onDelete, 
  onManageBinding 
}: HabitCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { createCompletion } = useHabitCompletions();

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await createCompletion(habit.id, habit.energy_value);
    } finally {
      setIsCompleting(false);
    }
  };

  const progressPercentage = boundReward 
    ? Math.min(100, (boundReward.current_energy / boundReward.energy_cost) * 100)
    : 0;

  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: habit.color || '#8B5CF6' }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{habit.name}</CardTitle>
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {habit.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageBinding(habit.id)}>
                {boundReward ? <Unlink className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                {boundReward ? '管理绑定' : '绑定奖励'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(habit.id)}>
                <Archive className="h-4 w-4 mr-2" />
                归档
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            +{habit.energy_value} 能量
          </Badge>
          <Button 
            size="sm" 
            onClick={handleComplete}
            disabled={isCompleting}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            {isCompleting ? '完成中...' : '完成'}
          </Button>
        </div>

        {boundReward && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">🎁 {boundReward.name}</span>
              <span className="text-xs">
                {boundReward.current_energy}/{boundReward.energy_cost}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-right">
              {progressPercentage.toFixed(0)}% 完成
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
