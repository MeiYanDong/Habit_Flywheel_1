
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Moon, Sun, Bell, Database, Download, Upload } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">设置中心</h2>
        <p className="text-gray-600">个性化你的习惯追踪体验</p>
      </div>

      <div className="grid gap-6">
        {/* 主题设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              主题设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">深色模式</div>
                <div className="text-sm text-gray-600">切换到深色主题</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">主题色彩</div>
                <div className="text-sm text-gray-600">选择你喜欢的主色调</div>
              </div>
              <Select defaultValue="purple">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purple">紫色</SelectItem>
                  <SelectItem value="blue">蓝色</SelectItem>
                  <SelectItem value="green">绿色</SelectItem>
                  <SelectItem value="orange">橙色</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              通知设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">每日提醒</div>
                <div className="text-sm text-gray-600">每天定时提醒完成习惯</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">提醒时间</div>
                <div className="text-sm text-gray-600">设置提醒时间</div>
              </div>
              <Select defaultValue="09:00">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="20:00">20:00</SelectItem>
                  <SelectItem value="21:00">21:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">成就通知</div>
                <div className="text-sm text-gray-600">完成目标时显示通知</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              数据管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">导出数据</div>
                <div className="text-sm text-gray-600">导出所有习惯和完成记录</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">导入数据</div>
                <div className="text-sm text-gray-600">从文件导入数据</div>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">自动备份</div>
                <div className="text-sm text-gray-600">定期自动备份数据</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 应用信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              应用信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-lg font-medium">习惯追踪器</div>
              <div className="text-sm text-gray-600 mt-1">版本 1.0.0</div>
              <div className="text-sm text-gray-600 mt-2">
                帮助你养成良好习惯，实现个人成长
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsView;
