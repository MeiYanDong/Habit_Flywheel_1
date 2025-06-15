
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Zap, TrendingUp } from 'lucide-react';
import { useUserEnergy } from '@/hooks/useUserEnergy';

export const EnergyDisplay = () => {
  const { totalEnergy, loading } = useUserEnergy();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200">
      <CardContent className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">总能量</p>
            <p className="text-2xl font-bold">{totalEnergy}</p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          能量值
        </Badge>
      </CardContent>
    </Card>
  );
};
