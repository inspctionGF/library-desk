import { useState, useCallback } from 'react';

const GUIDE_STORAGE_KEY = 'bibliosystem_guides_seen';

interface GuideState {
  [guideId: string]: boolean;
}

export function useGuideState() {
  const [guidesState, setGuidesState] = useState<GuideState>(() => {
    try {
      const stored = localStorage.getItem(GUIDE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const hasSeenGuide = useCallback((guideId: string): boolean => {
    return guidesState[guideId] === true;
  }, [guidesState]);

  const markGuideSeen = useCallback((guideId: string) => {
    setGuidesState(prev => {
      const updated = { ...prev, [guideId]: true };
      localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetGuide = useCallback((guideId: string) => {
    setGuidesState(prev => {
      const updated = { ...prev };
      delete updated[guideId];
      localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetAllGuides = useCallback(() => {
    localStorage.removeItem(GUIDE_STORAGE_KEY);
    setGuidesState({});
  }, []);

  return {
    hasSeenGuide,
    markGuideSeen,
    resetGuide,
    resetAllGuides,
  };
}
