
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Download, Upload, Trash2, RotateCcw, Bell, Palette, Database, Clock, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsCenterProps {
  onExportData: () => void;
  onImportData: (data: any) => void;
  onClearAllData: () => void;
  onResetToDefaults: () => void;
}

interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
  showProgress: boolean;
  showStats: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  reminderTime: string;
  reminderEnabled: boolean;
  energyAnimations: boolean;
  compactMode: boolean;
  dataRetention: number; // days
}

const SettingsCenter: React.FC<SettingsCenterProps> = ({
  onExportData,
  onImportData,
  onClearAllData,
  onResetToDefaults
}) => {
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    darkMode: false,
    showProgress: true,
    showStats: true,
    autoBackup: false,
    backupFrequency: 'weekly',
    reminderTime: '09:00',
    reminderEnabled: false,
    energyAnimations: true,
    compactMode: false,
    dataRetention: 365
  });

  const { toast } = useToast();

  // 从 localStorage 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('habitFlywheel_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // 保存设置到 localStorage
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('habitFlywheel_settings', JSON.stringify(newSettings));
    toast({
      title: "设置已保存",
      description: "您的偏好设置已成功保存",
    });
  };

  // 更新单个设置项
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // 重置所有设置
  const resetSettings = () => {
    if (window.confirm('确定要重置所有设置为默认值吗？')) {
      const defaultSettings: AppSettings = {
        notifications: true,
        darkMode: false,
        showProgress: true,
        showStats: true,
        autoBackup: false,
        backupFrequency: 'weekly',
        reminderTime: '09:00',
        reminderEnabled: false,
        energyAnimations: true,
        compactMode: false,
        dataRetention: 365
      };
      saveSettings(defaultSettings);
      toast({
        title: "设置已重置",
        description: "所有设置已恢复为默认值",
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            onImportData(data);
            toast({
              title: "数据导入成功",
              description: "您的数据已成功导入",
            });
          } catch (error) {
            toast({
              title: "导入失败",
              description: "文件格式不正确，请检查后重试",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    onExportData();
    toast({
      title: "数据导出成功",
      description: "您的数据已成功导出到下载文件夹",
    });
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      onClearAllData();
      toast({
        title: "数据已清除",
        description: "所有数据已成功清除",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要重置为默认设置吗？这将恢复示例数据。')) {
      onResetToDefaults();
      toast({
        title: "已重置为默认",
        description: "应用已重置为默认状态，示例数据已恢复",
      });
    }
  };

  // 获取存储统计信息
  const getStorageStats = () => {
    const habits = localStorage.getItem('habitFlywheel_habits');
    const rewards = localStorage.getItem('habitFlywheel_rewards');
    const completions = localStorage.getItem('habitFlywheel_completions');
    
    const habitCount = habits ? JSON.parse(habits).length : 0;
    const rewardCount = rewards ? JSON.parse(rewards).length : 0;
    const completionCount = completions ? JSON.parse(completions).length : 0;
    
    const totalSize = (habits?.length || 0) + (rewards?.length || 0) + (completions?.length || 0);
    
    return { habitCount, rewardCount, completionCount, totalSize };
  };

  const storageStats = getStorageStats();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">设置中心</h2>
        <p className="text-gray-600">个性化设置，让体验更贴心</p>
      </div>

      {/* 通知与提醒设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <span>通知与提醒</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">推送通知</Label>
              <p className="text-sm text-gray-600">接收习惯提醒和成就通知</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(value) => updateSetting('notifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reminder">每日提醒</Label>
              <p className="text-sm text-gray-600">设置每日习惯提醒时间</p>
            </div>
            <Switch
              id="reminder"
              checked={settings.reminderEnabled}
              onCheckedChange={(value) => updateSetting('reminderEnabled', value)}
            />
          </div>

          {settings.reminderEnabled && (
            <div className="pl-4 border-l-2 border-purple-200">
              <Label htmlFor="reminderTime">提醒时间</Label>
              <Select 
                value={settings.reminderTime} 
                onValueChange={(value) => updateSetting('reminderTime', value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">早上 7:00</SelectItem>
                  <SelectItem value="08:00">早上 8:00</SelectItem>
                  <SelectItem value="09:00">早上 9:00</SelectItem>
                  <SelectItem value="10:00">早上 10:00</SelectItem>
                  <SelectItem value="20:00">晚上 8:00</SelectItem>
                  <SelectItem value="21:00">晚上 9:00</SelectItem>
                  <SelectItem value="22:00">晚上 10:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 界面设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-purple-600" />
            <span>界面设置</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">深色模式</Label>
              <p className="text-sm text-gray-600">切换到深色主题</p>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(value) => updateSetting('darkMode', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showProgress">显示进度条</Label>
              <p className="text-sm text-gray-600">在奖励卡片中显示进度条</p>
            </div>
            <Switch
              id="showProgress"
              checked={settings.showProgress}
              onCheckedChange={(value) => updateSetting('showProgress', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showStats">显示统计数据</Label>
              <p className="text-sm text-gray-600">在主页显示今日统计</p>
            </div>
            <Switch
              id="showStats"
              checked={settings.showStats}
              onCheckedChange={(value) => updateSetting('showStats', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="energyAnimations">能量动画</Label>
              <p className="text-sm text-gray-600">完成习惯时显示能量动画</p>
            </div>
            <Switch
              id="energyAnimations"
              checked={settings.energyAnimations}
              onCheckedChange={(value) => updateSetting('energyAnimations', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode">紧凑模式</Label>
              <p className="text-sm text-gray-600">使用更紧凑的卡片布局</p>
            </div>
            <Switch
              id="compactMode"
              checked={settings.compactMode}
              onCheckedChange={(value) => updateSetting('compactMode', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 数据与隐私 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>数据与隐私</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">自动备份</Label>
              <p className="text-sm text-gray-600">定期自动备份您的数据</p>
            </div>
            <Switch
              id="autoBackup"
              checked={settings.autoBackup}
              onCheckedChange={(value) => updateSetting('autoBackup', value)}
            />
          </div>

          {settings.autoBackup && (
            <div className="pl-4 border-l-2 border-purple-200">
              <Label htmlFor="backupFrequency">备份频率</Label>
              <Select 
                value={settings.backupFrequency} 
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => updateSetting('backupFrequency', value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每日</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dataRetention">数据保留期 (天)</Label>
            <p className="text-sm text-gray-600">完成记录保留 {settings.dataRetention} 天</p>
            <Slider
              id="dataRetention"
              min={30}
              max={1095}
              step={30}
              value={[settings.dataRetention]}
              onValueChange={(value) => updateSetting('dataRetention', value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>30天</span>
              <span>3年</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span>数据管理</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 存储统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">{storageStats.habitCount}</div>
              <div className="text-xs text-gray-600">习惯</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">{storageStats.rewardCount}</div>
              <div className="text-xs text-gray-600">奖励</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{storageStats.completionCount}</div>
              <div className="text-xs text-gray-600">完成记录</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{Math.round(storageStats.totalSize / 1024)}KB</div>
              <div className="text-xs text-gray-600">存储大小</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>导出数据</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleImport}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>导入数据</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>重置默认</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleClearData}
              className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>清除所有数据</span>
            </Button>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>提示：</strong> 数据导出功能会将您的所有习惯、奖励和完成记录保存为JSON文件，建议定期备份。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 应用信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <span>应用信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">版本</span>
            <Badge variant="secondary">v1.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">最后更新</span>
            <span className="text-sm">2024-06-14</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">开发者</span>
            <span className="text-sm">习惯飞轮团队</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">数据存储</span>
            <span className="text-sm">本地存储</span>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="flex-1"
            >
              重置设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsCenter;
