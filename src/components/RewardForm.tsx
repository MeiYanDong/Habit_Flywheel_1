
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
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';

interface RewardFormData {
  name: string;
  description?: string;
  energyCost: number;
}

interface RewardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RewardFormData) => void;
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    energyCost: number;
  };
  isEditing?: boolean;
}

const RewardForm: React.FC<RewardFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const form = useForm<RewardFormData>({
    defaultValues: {
      name: '',
      description: '',
      energyCost: 100,
    }
  });

  // 重置表单当初始数据改变时
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        energyCost: initialData.energyCost || 100,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        energyCost: 100,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: RewardFormData) => {
    onSubmit(data);
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
            {isEditing ? '编辑奖励' : '创建新奖励'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: '奖励名称不能为空' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>奖励名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：iPhone 15 Pro" {...field} />
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
                      placeholder="描述这个奖励的具体内容..."
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
              name="energyCost"
              rules={{ 
                required: '能量消耗不能为空',
                min: { value: 1, message: '能量消耗必须大于0' },
                max: { value: 10000, message: '能量消耗不能超过10000' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>能量消耗</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                {isEditing ? '保存修改' : '创建奖励'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RewardForm;
