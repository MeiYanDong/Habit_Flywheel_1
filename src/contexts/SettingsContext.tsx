
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  notifications: boolean;
  darkMode: boolean;
  showProgress: boolean;
  showStats: boolean;
  setNotifications: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  setShowProgress: (value: boolean) => void;
  setShowStats: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('habitFlywheel_notifications');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('habitFlywheel_darkMode');
    if (saved) {
      return JSON.parse(saved);
    }
    // 检查系统偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [showProgress, setShowProgress] = useState(() => {
    const saved = localStorage.getItem('habitFlywheel_showProgress');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem('habitFlywheel_showStats');
    return saved ? JSON.parse(saved) : true;
  });

  // 保存设置到 localStorage
  useEffect(() => {
    localStorage.setItem('habitFlywheel_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('habitFlywheel_darkMode', JSON.stringify(darkMode));
    
    // 平滑过渡应用深色模式
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      // 为深色模式设置元主题颜色
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', '#1f2937');
      }
    } else {
      root.classList.remove('dark');
      // 为浅色模式设置元主题颜色
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', '#ffffff');
      }
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('habitFlywheel_showProgress', JSON.stringify(showProgress));
  }, [showProgress]);

  useEffect(() => {
    localStorage.setItem('habitFlywheel_showStats', JSON.stringify(showStats));
  }, [showStats]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置过时才跟随系统
      const savedDarkMode = localStorage.getItem('habitFlywheel_darkMode');
      if (!savedDarkMode) {
        setDarkMode(e.matches);
      }
    };

    // 现代浏览器使用 addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 兼容旧浏览器
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const value = {
    notifications,
    darkMode,
    showProgress,
    showStats,
    setNotifications,
    setDarkMode,
    setShowProgress,
    setShowStats,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
