
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Zap, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zh } from 'date-fns/locale';

interface HabitCompletionCardProps {
  completion: {
    id: string;
    habit_id: string;
    completed_at: string;
    energy_gained: number;
    notes?: string;
  };
  habitName?: string;
  onDelete?: (id: string) => void;
  showHabitName?: boolean;
}

export const HabitCompletionCard = ({ 
  completion, 
  habitName, 
  onDelete,
  showHabitName = false 
}: HabitCompletionCardProps) => {
  const completedDate = new Date(completion.completed_at);

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(completedDate, 'MM月dd日 HH:mm', { locale: zh })}
            </span>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(completion.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showHabitName && habitName && (
          <CardTitle className="text-base">{habitName}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            +{completion.energy_gained} 能量
          </Badge>
        </div>
        {completion.notes && (
          <p className="text-sm text-muted-foreground mt-2">
            {completion.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
