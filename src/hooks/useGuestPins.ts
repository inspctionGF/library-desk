import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/services/api';

export interface GuestPin {
  id: string;
  pin: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  isActive: boolean;
}

const GUEST_PINS_STORAGE_KEY = 'bibliosystem_guest_pins';
const API_MODE_KEY = 'bibliosystem_api_mode';

function generateRandomPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateId(): string {
  return `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function loadLocalPins(): GuestPin[] {
  try {
    const stored = localStorage.getItem(GUEST_PINS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load guest pins:', e);
  }
  return [];
}

function saveLocalPins(pins: GuestPin[]) {
  try {
    localStorage.setItem(GUEST_PINS_STORAGE_KEY, JSON.stringify(pins));
  } catch (e) {
    console.error('Failed to save guest pins:', e);
  }
}

export function useGuestPins() {
  const [pins, setPins] = useState<GuestPin[]>(loadLocalPins);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiMode] = useState(() => localStorage.getItem(API_MODE_KEY) === 'true');
  const loadedFromApi = useRef(false);

  const loadPinsFromApi = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiPins = await authApi.getGuestPins();
      
      // Mapper les PINs API vers le format local
      const mappedPins: GuestPin[] = apiPins.map((p: any) => ({
        id: p.id,
        pin: p.pin,
        createdAt: p.created_at || p.createdAt || new Date().toISOString(),
        expiresAt: p.expires_at || p.expiresAt,
        usedAt: p.used_at || p.usedAt || null,
        isActive: !p.used && new Date(p.expires_at || p.expiresAt) > new Date(),
      }));
      
      setPins(mappedPins);
    } catch (error) {
      console.error('Failed to load pins from API:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les PINs depuis l'API au montage
  useEffect(() => {
    if (isApiMode && !loadedFromApi.current) {
      loadedFromApi.current = true;
      loadPinsFromApi();
    }
  }, [isApiMode, loadPinsFromApi]);

  // Sauvegarder localement quand pins change (backup)
  useEffect(() => {
    saveLocalPins(pins);
  }, [pins]);

  const generateGuestPin = useCallback(async (): Promise<GuestPin> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    let newPin: GuestPin = {
      id: generateId(),
      pin: generateRandomPin(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      isActive: true,
    };

    if (isApiMode) {
      try {
        const result = await authApi.createGuestPin();
        newPin = {
          id: (result as any).id || newPin.id,
          pin: result.pin,
          createdAt: now.toISOString(),
          expiresAt: result.expiresAt,
          usedAt: null,
          isActive: true,
        };
      } catch (error) {
        console.error('Failed to create PIN via API:', error);
      }
    }

    setPins(prev => [...prev, newPin]);
    return newPin;
  }, [isApiMode]);

  const validateGuestPin = useCallback(async (inputPin: string): Promise<{ valid: boolean; pinId?: string }> => {
    // Essayer l'API d'abord si disponible
    if (isApiMode) {
      try {
        const result = await authApi.verifyGuest(inputPin);
        if (result.valid) {
          // Mettre à jour le state local
          setPins(prev => prev.map(p => 
            p.pin === inputPin 
              ? { ...p, usedAt: new Date().toISOString(), isActive: false }
              : p
          ));
          return { valid: true, pinId: (result as any).pinId };
        }
        return { valid: false };
      } catch (error) {
        console.error('Failed to validate PIN via API:', error);
        // Fallback sur validation locale
      }
    }

    // Validation locale (fallback)
    const now = new Date();
    const matchingPin = pins.find(p => 
      p.pin === inputPin && 
      p.isActive && 
      p.usedAt === null && 
      new Date(p.expiresAt) > now
    );

    if (matchingPin) {
      setPins(prev => prev.map(p => 
        p.id === matchingPin.id 
          ? { ...p, usedAt: now.toISOString(), isActive: false }
          : p
      ));
      return { valid: true, pinId: matchingPin.id };
    }

    return { valid: false };
  }, [isApiMode, pins]);

  const revokePin = useCallback((pinId: string) => {
    setPins(prev => prev.map(p => 
      p.id === pinId ? { ...p, isActive: false } : p
    ));
  }, []);

  const deletePin = useCallback(async (pinId: string) => {
    if (isApiMode) {
      try {
        await authApi.deleteGuestPin(pinId);
      } catch (error) {
        console.error('Failed to delete PIN via API:', error);
      }
    }
    setPins(prev => prev.filter(p => p.id !== pinId));
  }, [isApiMode]);

  const getActivePins = useCallback((): GuestPin[] => {
    const now = new Date();
    return pins.filter(p => 
      p.isActive && 
      p.usedAt === null && 
      new Date(p.expiresAt) > now
    );
  }, [pins]);

  const getAllPins = useCallback((): GuestPin[] => {
    return pins;
  }, [pins]);

  const cleanExpiredPins = useCallback(() => {
    const now = new Date();
    setPins(prev => prev.filter(p => 
      new Date(p.expiresAt) > now || p.usedAt !== null
    ));
  }, []);

  const refreshPins = useCallback(async () => {
    if (isApiMode) {
      await loadPinsFromApi();
    }
  }, [isApiMode, loadPinsFromApi]);

  return {
    pins,
    generateGuestPin,
    validateGuestPin,
    revokePin,
    deletePin,
    getActivePins,
    getAllPins,
    cleanExpiredPins,
    refreshPins,
    isLoading,
    isApiMode,
  };
}
