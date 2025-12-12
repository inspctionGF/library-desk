import { useState, useEffect, useCallback, useRef } from 'react';
import { configApi } from '@/services/api';

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
  // Admin profile fields
  adminName: string;
  adminEmail: string;
  adminAvatar: string;
}

const CONFIG_STORAGE_KEY = 'bibliosystem_config';
const API_MODE_KEY = 'bibliosystem_api_mode';

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
  // Admin profile defaults
  adminName: 'Administrateur',
  adminEmail: '',
  adminAvatar: '',
};

function loadLocalConfig(): SystemConfig {
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

function saveLocalConfig(config: SystemConfig) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save system config:', e);
  }
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(loadLocalConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiMode] = useState(() => localStorage.getItem(API_MODE_KEY) === 'true');
  const loadedFromApi = useRef(false);

  const loadConfigFromApi = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiConfig = await configApi.get();
      
      // Mapper les champs API vers les champs locaux
      const mappedConfig: SystemConfig = {
        cdejNumber: apiConfig.cdejNumber || '',
        churchName: apiConfig.churchName || '',
        directorName: apiConfig.directorName || '',
        documentationManagerName: apiConfig.managerName || '',
        email: apiConfig.email || '',
        address: apiConfig.address || '',
        phone: apiConfig.phone || '',
        adminPin: '', // Ne jamais exposer le PIN
        isConfigured: apiConfig.onboardingComplete || !!apiConfig.cdejNumber,
        configuredAt: null,
        // Admin profile fields
        adminName: apiConfig.adminName || 'Administrateur',
        adminEmail: apiConfig.adminEmail || '',
        adminAvatar: apiConfig.adminAvatar || '',
      };
      
      setConfig(mappedConfig);
    } catch (error) {
      console.error('Failed to load config from API:', error);
      // Fallback sur la config locale
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger la configuration depuis l'API au montage
  useEffect(() => {
    if (isApiMode && !loadedFromApi.current) {
      loadedFromApi.current = true;
      loadConfigFromApi();
    }
  }, [isApiMode, loadConfigFromApi]);

  // Sauvegarder localement quand config change (backup)
  useEffect(() => {
    saveLocalConfig(config);
  }, [config]);

  const configureSystem = useCallback(async (configData: Omit<SystemConfig, 'isConfigured' | 'configuredAt'>) => {
    const newConfig: SystemConfig = {
      ...configData,
      isConfigured: true,
      configuredAt: new Date().toISOString(),
    };

    // Sauvegarder dans l'API si disponible
    if (isApiMode) {
      try {
        // Mapper les champs locaux vers les champs API
        await configApi.update({
          cdejNumber: configData.cdejNumber.replace('HA-', ''),
          churchName: configData.churchName,
          directorName: configData.directorName,
          managerName: configData.documentationManagerName,
          email: configData.email,
          address: configData.address,
          phone: configData.phone,
          adminPin: configData.adminPin,
          onboardingComplete: 'true',
          // Admin profile fields
          adminName: configData.adminName,
          adminEmail: configData.adminEmail,
          adminAvatar: configData.adminAvatar,
        });
      } catch (error) {
        console.error('Failed to save config to API:', error);
      }
    }

    setConfig(newConfig);
    return newConfig;
  }, [isApiMode]);

  const updateConfig = useCallback(async (updates: Partial<SystemConfig>) => {
    // Sauvegarder dans l'API si disponible
    if (isApiMode) {
      try {
        const apiUpdates: Record<string, unknown> = {};
        if (updates.cdejNumber !== undefined) apiUpdates.cdejNumber = updates.cdejNumber.replace('HA-', '');
        if (updates.churchName !== undefined) apiUpdates.churchName = updates.churchName;
        if (updates.directorName !== undefined) apiUpdates.directorName = updates.directorName;
        if (updates.documentationManagerName !== undefined) apiUpdates.managerName = updates.documentationManagerName;
        if (updates.email !== undefined) apiUpdates.email = updates.email;
        if (updates.address !== undefined) apiUpdates.address = updates.address;
        if (updates.phone !== undefined) apiUpdates.phone = updates.phone;
        // Admin profile fields
        if (updates.adminName !== undefined) apiUpdates.adminName = updates.adminName;
        if (updates.adminEmail !== undefined) apiUpdates.adminEmail = updates.adminEmail;
        if (updates.adminAvatar !== undefined) apiUpdates.adminAvatar = updates.adminAvatar;
        
        if (Object.keys(apiUpdates).length > 0) {
          await configApi.update(apiUpdates);
        }
      } catch (error) {
        console.error('Failed to update config in API:', error);
      }
    }

    setConfig(prev => ({ ...prev, ...updates }));
  }, [isApiMode]);

  const resetConfig = useCallback(async () => {
    if (isApiMode) {
      try {
        await configApi.reset();
      } catch (error) {
        console.error('Failed to reset config in API:', error);
      }
    }
    
    setConfig(defaultConfig);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  }, [isApiMode]);

  const refreshConfig = useCallback(async () => {
    if (isApiMode) {
      await loadConfigFromApi();
    }
  }, [isApiMode, loadConfigFromApi]);

  return {
    config,
    configureSystem,
    updateConfig,
    resetConfig,
    refreshConfig,
    isConfigured: config.isConfigured,
    isLoading,
    isApiMode,
  };
}
