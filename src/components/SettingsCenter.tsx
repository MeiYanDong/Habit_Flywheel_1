
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Upload, Trash2, RotateCcw, Bell, Palette, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsCenterProps {
  onExportData: () => void;
  onImportData: (data: any) => void;
  onClearAllData: () => void;
  onResetToDefaults: () => void;
}

const SettingsCenter: React.FC<SettingsCenterProps> = ({
  onExportData,
  onImportData,
  onClearAllData,
  onResetToDefaults
}) => {
  const { toast } = useToast();
  const {
    notifications,
    darkMode,
    showProgress,
    showStats,
    setNotifications,
    setDarkMode,
    setShowProgress,
    setShowStats,
  } = useSettings();

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">设置中心</h2>
        <p className="text-gray-600 dark:text-gray-400">个性化设置，让体验更贴心</p>
      </div>

      {/* 通知设置 */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <span className="dark:text-gray-100">通知设置</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="dark:text-gray-200">推送通知</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">接收习惯提醒和成就通知</p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* 界面设置 */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-purple-600" />
            <span className="dark:text-gray-100">界面设置</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode" className="dark:text-gray-200">深色模式</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">切换到深色主题</p>
            </div>
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showProgress" className="dark:text-gray-200">显示进度条</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">在奖励卡片中显示进度条</p>
            </div>
            <Switch
              id="showProgress"
              checked={showProgress}
              onCheckedChange={setShowProgress}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showStats" className="dark:text-gray-200">显示统计数据</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">在主页显示今日统计</p>
            </div>
            <Switch
              id="showStats"
              checked={showStats}
              onCheckedChange={setShowStats}
            />
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="dark:text-gray-100">数据管理</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-200"
            >
              <Download className="h-4 w-4" />
              <span>导出数据</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleImport}
              className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-200"
            >
              <Upload className="h-4 w-4" />
              <span>导入数据</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>重置默认</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleClearData}
              className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
            >
              <Trash2 className="h-4 w-4" />
              <span>清除所有数据</span>
            </Button>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-700">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>提示：</strong> 数据导出功能会将您的所有习惯、奖励和完成记录保存为JSON文件，建议定期备份。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 应用信息 */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">应用信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">版本</span>
                            <Badge variant="secondary">v2.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">最后更新</span>
                            <span className="text-sm dark:text-gray-300">2024-06-23</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">开发者</span>
            <span className="text-sm dark:text-gray-300">梅炎栋</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsCenter;
