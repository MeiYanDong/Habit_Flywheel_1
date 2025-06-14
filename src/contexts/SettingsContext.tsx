
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  notifications: boolean;
  darkMode: boolean;
  showProgress: boolean;
  showStats: boolean;
  energyAnimations: boolean;
  compactMode: boolean;
  updateSetting: (key: string, value: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  notifications: true,
  darkMode: false,
  showProgress: true,
  showStats: true,
  energyAnimations: true,
  compactMode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  // 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('habitFlywheel_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, []);

  // 保存设置
  useEffect(() => {
    localStorage.setItem('habitFlywheel_settings', JSON.stringify(settings));
    
    // 应用深色模式
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const value: SettingsContextType = {
    ...settings,
    updateSetting,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
