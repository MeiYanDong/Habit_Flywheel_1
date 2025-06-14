
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';

interface Habit {
  id: string;
  name: string;
  energyValue: number;
  isArchived: boolean;
}

interface Reward {
  id: string;
  name: string;
  cost: number;
}

interface Binding {
  id: string;
  habitId: string;
  rewardId: string;
  quantity: number;
}

interface BindingFormData {
  habitId: string;
  rewardId: string;
  quantity: number;
}

interface BindingFormProps {
  habits: Habit[];
  rewards: Reward[];
  bindings: Binding[];
  setBindings: React.Dispatch<React.SetStateAction<Binding[]>>;
}

const BindingForm: React.FC<BindingFormProps> = ({ habits, rewards, bindings, setBindings }) => {
  const form = useForm<BindingFormData>({
    defaultValues: {
      habitId: '',
      rewardId: '',
      quantity: 1
    }
  });

  const handleSubmit = (data: BindingFormData) => {
    const newBinding: Binding = {
      id: Date.now().toString(),
      habitId: data.habitId,
      rewardId: data.rewardId,
      quantity: data.quantity
    };
    
    setBindings(prev => [...prev, newBinding]);
    form.reset();
  };

  const activeHabits = habits.filter(h => !h.isArchived);

  return (
    <Card>
      <CardHeader>
        <CardTitle>创建新绑定</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="habitId"
              rules={{ required: '请选择习惯' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>选择习惯</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择要绑定的习惯" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeHabits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habit.name} ({habit.energyValue} 能量)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rewardId"
              rules={{ required: '请选择奖励' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>选择奖励</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择要绑定的奖励" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rewards.map((reward) => (
                        <SelectItem key={reward.id} value={reward.id}>
                          {reward.name} ({reward.cost} 能量)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              rules={{ 
                required: '请输入所需次数',
                min: { value: 1, message: '次数必须大于0' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所需完成次数</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              创建绑定
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BindingForm;
