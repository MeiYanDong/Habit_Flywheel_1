
import React from 'react';
import { Bell, Search, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';

const Navbar: React.FC = () => {
  const { darkMode, setDarkMode } = useSettings();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* 左侧：Logo和标题 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌟</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                习惯飞轮
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                让每一份努力都精准浇灌你的目标
              </p>
            </div>
          </div>
        </div>

        {/* 中间：搜索栏 */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索习惯或奖励..."
              className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* 右侧：功能按钮 */}
        <div className="flex items-center space-x-4">
          {/* 通知按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
          </Button>

          {/* 深色模式切换 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2"
          >
            {darkMode ? '🌙' : '☀️'}
          </Button>

          {/* 设置按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* 用户头像 */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
