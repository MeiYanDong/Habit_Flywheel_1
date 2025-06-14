
import React, { useState } from 'react';
import { Calendar, CheckCircle, Gift, Link2, BarChart3, Settings, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeModule?: string;
  onModuleChange?: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule = 'today', 
  onModuleChange = () => {} 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'today', label: '今日习惯', icon: Calendar },
    { id: 'habits', label: '习惯管理', icon: CheckCircle },
    { id: 'rewards', label: '奖励管理', icon: Gift },
    { id: 'bindings', label: '绑定管理', icon: Link2 },
    { id: 'history', label: '历史记录', icon: BarChart3 },
    { id: 'settings', label: '设置中心', icon: Settings }
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 shadow-lg",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* 折叠按钮 */}
      <div className="absolute -right-3 top-6 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 rounded-full p-0 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-md"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* 快速操作按钮 */}
        {!isCollapsed && (
          <div className="space-y-2">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              添加习惯
            </Button>
            <Button variant="outline" className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              添加奖励
            </Button>
          </div>
        )}

        {/* 导航菜单 */}
        <nav className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              主要功能
            </h3>
          )}
          
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={cn(
                "w-full flex items-center text-sm font-medium transition-colors rounded-lg",
                isCollapsed ? "justify-center p-3" : "space-x-3 px-3 py-2",
                activeModule === item.id
                  ? "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* 统计信息 */}
        {!isCollapsed && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              今日统计
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">已完成习惯</span>
                <span className="font-medium text-green-600 dark:text-green-400">3/5</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">获得能量</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">60⚡</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">连续天数</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">7天</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
