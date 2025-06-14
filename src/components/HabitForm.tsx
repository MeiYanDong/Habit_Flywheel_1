
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

interface HabitFormData {
  name: string;
  description?: string;
  energyValue: number;
  bindingRewardId?: string;
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
