import { useState, useEffect } from 'react';

export interface GuestPin {
  id: string;
  pin: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  isActive: boolean;
}

const GUEST_PINS_STORAGE_KEY = 'bibliosystem_guest_pins';

function generateRandomPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateId(): string {
  return `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function loadPins(): GuestPin[] {
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

function savePins(pins: GuestPin[]) {
  try {
    localStorage.setItem(GUEST_PINS_STORAGE_KEY, JSON.stringify(pins));
  } catch (e) {
    console.error('Failed to save guest pins:', e);
  }
}

export function useGuestPins() {
  const [pins, setPins] = useState<GuestPin[]>(loadPins);

  useEffect(() => {
    savePins(pins);
  }, [pins]);

  const generateGuestPin = (): GuestPin => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const newPin: GuestPin = {
      id: generateId(),
      pin: generateRandomPin(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      isActive: true,
    };

    setPins(prev => [...prev, newPin]);
    return newPin;
  };

  const validateGuestPin = (inputPin: string): { valid: boolean; pinId?: string } => {
    const now = new Date();
    
    const matchingPin = pins.find(p => 
      p.pin === inputPin && 
      p.isActive && 
      p.usedAt === null && 
      new Date(p.expiresAt) > now
    );

    if (matchingPin) {
      // Mark as used (single-use)
      setPins(prev => prev.map(p => 
        p.id === matchingPin.id 
          ? { ...p, usedAt: now.toISOString(), isActive: false }
          : p
      ));
      return { valid: true, pinId: matchingPin.id };
    }

    return { valid: false };
  };

  const revokePin = (pinId: string) => {
    setPins(prev => prev.map(p => 
      p.id === pinId ? { ...p, isActive: false } : p
    ));
  };

  const deletePin = (pinId: string) => {
    setPins(prev => prev.filter(p => p.id !== pinId));
  };

  const getActivePins = (): GuestPin[] => {
    const now = new Date();
    return pins.filter(p => 
      p.isActive && 
      p.usedAt === null && 
      new Date(p.expiresAt) > now
    );
  };

  const getAllPins = (): GuestPin[] => {
    return pins;
  };

  const cleanExpiredPins = () => {
    const now = new Date();
    setPins(prev => prev.filter(p => 
      new Date(p.expiresAt) > now || p.usedAt !== null
    ));
  };

  return {
    pins,
    generateGuestPin,
    validateGuestPin,
    revokePin,
    deletePin,
    getActivePins,
    getAllPins,
    cleanExpiredPins,
  };
}
