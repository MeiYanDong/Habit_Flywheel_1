
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import HabitForm from '@/components/HabitForm';

interface Habit {
  id: string;
  name: string;
  energyValue: number;
  isArchived: boolean;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  targetCount?: number;
  bindingRewardId?: string;
}

interface HabitListProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const HabitList: React.FC<HabitListProps> = ({ habits, setHabits }) => {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleArchive = (id: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, isArchived: !habit.isArchived } : habit
    ));
  };

  const handleDelete = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const handleFormSubmit = (data: any) => {
    if (editingHabit) {
      setHabits(prev => prev.map(habit => 
        habit.id === editingHabit.id ? { ...habit, ...data } : habit
      ));
    }
    setEditingHabit(null);
    setShowForm(false);
  };

  const activeHabits = habits.filter(h => !h.isArchived);
  const archivedHabits = habits.filter(h => h.isArchived);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {activeHabits.map(habit => (
          <Card key={habit.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {habit.energyValue} 能量
                    </Badge>
                    <Badge variant="outline">
                      {habit.frequency === 'daily' ? '每日' : 
                       habit.frequency === 'weekly' ? `每周 ${habit.targetCount || 1} 次` :
                       habit.frequency === 'monthly' ? `每月 ${habit.targetCount || 1} 次` : '每日'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(habit)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleArchive(habit.id)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(habit.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {archivedHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">已归档习惯</h3>
          <div className="grid gap-4">
            {archivedHabits.map(habit => (
              <Card key={habit.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{habit.name}</h3>
                      <Badge variant="secondary">{habit.energyValue} 能量</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleArchive(habit.id)}>
                        <ArchiveRestore className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(habit.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <HabitForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingHabit || undefined}
          rewards={[]}
          isEditing={!!editingHabit}
        />
      )}
    </div>
  );
};

export default HabitList;
