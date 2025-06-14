import React, { useState } from 'react';
import { HabitList } from '@/components/HabitList';
import { HabitForm } from '@/components/HabitForm';
import { RewardList } from '@/components/RewardList';
import { RewardForm } from '@/components/RewardForm';
import { CompletionForm } from '@/components/CompletionForm';
import { BindingForm } from '@/components/BindingForm';
import { BindingList } from '@/components/BindingList';
import HistoryView from '@/components/HistoryView';
import SettingsView from '@/components/SettingsView';

const IndexPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'today' | 'habits' | 'rewards' | 'bindings' | 'history' | 'settings'>('today');

  // 示例数据，实际项目中应从数据库或API获取
  const [habits, setHabits] = useState([
    { id: '1', name: '早起', energyValue: 10, isArchived: false },
    { id: '2', name: '阅读', energyValue: 15, isArchived: false },
    { id: '3', name: '运动', energyValue: 20, isArchived: false },
  ]);
  const [rewards, setRewards] = useState([
    { id: '1', name: '一杯奶茶', cost: 50 },
    { id: '2', name: '看一场电影', cost: 100 },
  ]);
  const [bindings, setBindings] = useState([
    { id: '1', habitId: '1', rewardId: '1', quantity: 2 },
    { id: '2', habitId: '2', rewardId: '2', quantity: 1 },
  ]);
  const [completions, setCompletions] = useState([
    { id: '1', habitId: '1', date: '2024-07-24', energy: 10, timestamp: '1674567890' },
    { id: '2', habitId: '2', date: '2024-07-24', energy: 15, timestamp: '1674567890' },
    { id: '3', habitId: '1', date: '2024-07-25', energy: 10, timestamp: '1674567890' },
    { id: '4', habitId: '3', date: '2024-07-25', energy: 20, timestamp: '1674567890' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto py-12">
        <div className="flex flex-col md:flex-row gap-8">

          {/* 侧边栏导航 */}
          <aside className="md:w-64 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveView('today')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeView === 'today' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">📅</span>
                今日习惯
              </button>
              
              <button
                onClick={() => setActiveView('habits')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeView === 'habits' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">✅</span>
                习惯管理
              </button>
              
              <button
                onClick={() => setActiveView('rewards')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeView === 'rewards' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">🎁</span>
                奖励管理
              </button>
              
              <button
                onClick={() => setActiveView('bindings')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeView === 'bindings' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">🔗</span>
                绑定管理
              </button>
              
              <button
                onClick={() => setActiveView('history')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeView === 'history' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">📊</span>
                数据统计
              </button>
              
              <button
                onClick={() => setActiveView('settings')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeView === 'settings' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">⚙️</span>
                设置中心
              </button>
            </nav>
          </aside>

          {/* 主要内容区域 */}
          <main className="flex-1 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            {activeView === 'today' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">今日习惯</h2>
                <CompletionForm habits={habits} completions={completions} setCompletions={setCompletions} />
              </div>
            )}
            {activeView === 'habits' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">习惯管理</h2>
                <HabitForm habits={habits} setHabits={setHabits} />
                <HabitList habits={habits} setHabits={setHabits} />
              </div>
            )}
            {activeView === 'rewards' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">奖励管理</h2>
                <RewardForm rewards={rewards} setRewards={setRewards} />
                <RewardList rewards={rewards} setRewards={setRewards} />
              </div>
            )}
            {activeView === 'bindings' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">绑定管理</h2>
                <BindingForm habits={habits} rewards={rewards} bindings={bindings} setBindings={setBindings} />
                <BindingList habits={habits} rewards={rewards} bindings={bindings} setBindings={setBindings} />
              </div>
            )}
            {activeView === 'history' && (
              <div>
                <HistoryView habits={habits} completions={completions} />
              </div>
            )}
            {activeView === 'settings' && (
              <div>
                <SettingsView />
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default IndexPage;
