import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
  showTimestamps: boolean;
  
  // Actions
  setLanguage: (language: string) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setAutoScroll: (autoScroll: boolean) => void;
  setShowTimestamps: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en-US',
      fontSize: 'large',
      autoScroll: true,
      showTimestamps: true,

      setLanguage: (language: string) => set({ language }),
      setFontSize: (size: 'small' | 'medium' | 'large') => set({ fontSize: size }),
      setAutoScroll: (autoScroll: boolean) => set({ autoScroll }),
      setShowTimestamps: (show: boolean) => set({ showTimestamps: show })
    }),
    {
      name: 'settings-store'
    }
  )
);