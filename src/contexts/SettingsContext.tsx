
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
    return saved ? JSON.parse(saved) : false;
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
    // 应用深色模式
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('habitFlywheel_showProgress', JSON.stringify(showProgress));
  }, [showProgress]);

  useEffect(() => {
    localStorage.setItem('habitFlywheel_showStats', JSON.stringify(showStats));
  }, [showStats]);

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
