
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Gift } from 'lucide-react';
import RewardForm from '@/components/RewardForm';

interface Reward {
  id: string;
  name: string;
  cost: number;
  description?: string;
}

interface RewardListProps {
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
}

const RewardList: React.FC<RewardListProps> = ({ rewards, setRewards }) => {
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setRewards(prev => prev.filter(reward => reward.id !== id));
  };

  const handleFormSubmit = (data: any) => {
    if (editingReward) {
      setRewards(prev => prev.map(reward => 
        reward.id === editingReward.id ? { ...reward, ...data } : reward
      ));
    }
    setEditingReward(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {rewards.map(reward => (
          <Card key={reward.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="font-medium">{reward.name}</h3>
                    {reward.description && (
                      <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                    )}
                    <Badge variant="secondary" className="mt-2">
                      {reward.cost} 能量
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(reward)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(reward.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <RewardForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingReward(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingReward ? {
            ...editingReward,
            energyCost: editingReward.cost
          } : undefined}
          isEditing={!!editingReward}
        />
      )}
    </div>
  );
};

export default RewardList;
