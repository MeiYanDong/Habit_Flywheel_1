
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const form = useForm<HabitFormData>({
    defaultValues: {
      name: '',
      description: '',
      energyValue: 10,
      bindingRewardId: 'none',
      frequency: 'daily',
      targetCount: 1,
    }
  });

  // 重置表单当初始数据改变时
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        energyValue: initialData.energyValue || 10,
        bindingRewardId: initialData.bindingRewardId || 'none',
        frequency: initialData.frequency || 'daily',
        targetCount: initialData.targetCount || 1,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        energyValue: 10,
        bindingRewardId: 'none',
        frequency: 'daily',
        targetCount: 1,
      });
    }
  }, [initialData, form]);

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
            {isEditing ? t('habits.edit') : t('habits.create')}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: t('habits.nameRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('habits.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('habits.namePlaceholder')} {...field} />
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
                  <FormLabel>{t('habits.description')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('habits.descriptionPlaceholder')}
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
                required: t('habits.energyRequired'),
                min: { value: 1, message: t('habits.energyMin') },
                max: { value: 100, message: t('habits.energyMax') }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('habits.energyValue')}</FormLabel>
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
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('habits.frequency')}</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => field.onChange('daily')}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          field.value === 'daily'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        {t('habits.daily')}
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('weekly')}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          field.value === 'weekly'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        {t('habits.weekly')}
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('monthly')}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          field.value === 'monthly'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        {t('habits.monthly')}
                      </button>
                    </div>
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
                  required: t('habits.targetRequired'),
                  min: { value: 1, message: t('habits.targetMin') },
                  max: { value: selectedFrequency === 'weekly' ? 7 : 31, message: selectedFrequency === 'weekly' ? t('habits.targetMaxWeekly') : t('habits.targetMaxMonthly') }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedFrequency === 'weekly' ? t('habits.weeklyTarget') : t('habits.monthlyTarget')}
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
              name="bindingRewardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('habits.bindReward')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('habits.bindRewardPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t('habits.noBinding')}</SelectItem>
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
                {t('habits.cancel')}
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                {isEditing ? t('habits.save') : t('habits.create_action')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitForm;
