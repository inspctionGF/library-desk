import { useState, useEffect } from 'react';

export interface SystemConfig {
  cdejNumber: string;
  churchName: string;
  directorName: string;
  documentationManagerName: string;
  email: string;
  address: string;
  phone: string;
  adminPin: string;
  isConfigured: boolean;
  configuredAt: string | null;
}

const CONFIG_STORAGE_KEY = 'bibliosystem_config';

const defaultConfig: SystemConfig = {
  cdejNumber: '',
  churchName: '',
  directorName: '',
  documentationManagerName: '',
  email: '',
  address: '',
  phone: '',
  adminPin: '',
  isConfigured: false,
  configuredAt: null,
};

function loadConfig(): SystemConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load system config:', e);
  }
  return defaultConfig;
}

function saveConfig(config: SystemConfig) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save system config:', e);
  }
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(loadConfig);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const configureSystem = (configData: Omit<SystemConfig, 'isConfigured' | 'configuredAt'>) => {
    const newConfig: SystemConfig = {
      ...configData,
      isConfigured: true,
      configuredAt: new Date().toISOString(),
    };
    setConfig(newConfig);
    return newConfig;
  };

  const updateConfig = (updates: Partial<SystemConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  };

  return {
    config,
    configureSystem,
    updateConfig,
    resetConfig,
    isConfigured: config.isConfigured,
  };
}
