
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface HabitFormData {
  name: string;
  description?: string;
  energyValue: number;
  bindingRewardId?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount?: number;
}

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => void;
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    energyValue: number;
    bindingRewardId?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetCount?: number;
  };
  rewards: Array<{ id: string; name: string; }>;
  isEditing?: boolean;
}

const HabitForm: React.FC<HabitFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  rewards,
  isEditing = false
}) => {
  const form = useForm<HabitFormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      energyValue: initialData?.energyValue || 10,
      bindingRewardId: initialData?.bindingRewardId || 'none',
      frequency: initialData?.frequency || 'daily',
      targetCount: initialData?.targetCount || 1,
    }
  });

  const handleSubmit = (data: HabitFormData) => {
    // Convert 'none' back to undefined/empty string for the API
    const processedData = {
      ...data,
      bindingRewardId: data.bindingRewardId === 'none' ? undefined : data.bindingRewardId
    };
    onSubmit(processedData);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const selectedFrequency = form.watch('frequency');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '编辑习惯' : '创建新习惯'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: '习惯名称不能为空' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>习惯名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：每日阅读" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述（可选）</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="描述这个习惯的具体内容..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>频率</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="text-sm font-normal">每日</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="text-sm font-normal">每周</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="text-sm font-normal">每月</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedFrequency !== 'daily' && (
              <FormField
                control={form.control}
                name="targetCount"
                rules={{ 
                  required: '目标次数不能为空',
                  min: { value: 1, message: '目标次数必须大于0' },
                  max: { value: selectedFrequency === 'weekly' ? 7 : 31, message: `目标次数不能超过${selectedFrequency === 'weekly' ? 7 : 31}` }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedFrequency === 'weekly' ? '每周目标次数' : '每月目标次数'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={selectedFrequency === 'weekly' ? '3' : '10'}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="energyValue"
              rules={{ 
                required: '能量值不能为空',
                min: { value: 1, message: '能量值必须大于0' },
                max: { value: 100, message: '能量值不能超过100' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>能量值</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="10"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bindingRewardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>绑定奖励（可选）</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择要绑定的奖励" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">不绑定奖励</SelectItem>
                      {rewards.map((reward) => (
                        <SelectItem key={reward.id} value={reward.id}>
                          {reward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {isEditing ? '保存修改' : '创建习惯'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitForm;
