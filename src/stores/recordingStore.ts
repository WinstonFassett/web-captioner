import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecordingState {
  isListening: boolean;
  isRestarting: boolean;
  hasUserInitiatedRecording: boolean;
  error: string | null;
  isSupported: boolean;
  
  // Actions
  setListening: (listening: boolean) => void;
  setRestarting: (restarting: boolean) => void;
  setUserInitiated: (initiated: boolean) => void;
  setError: (error: string | null) => void;
  setSupported: (supported: boolean) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set) => ({
      isListening: false,
      isRestarting: false,
      hasUserInitiatedRecording: true, // Default to true as requested
      error: null,
      isSupported: true,

      setListening: (listening: boolean) => set({ isListening: listening }),
      setRestarting: (restarting: boolean) => set({ isRestarting: restarting }),
      setUserInitiated: (initiated: boolean) => set({ hasUserInitiatedRecording: initiated }),
      setError: (error: string | null) => set({ error }),
      setSupported: (supported: boolean) => set({ isSupported: supported }),
      
      reset: () => set({
        isListening: false,
        isRestarting: false,
        error: null
      })
    }),
    {
      name: 'recording-store',
      partialize: (state) => ({
        hasUserInitiatedRecording: state.hasUserInitiatedRecording
      })
    }
  )
);