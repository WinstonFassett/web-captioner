import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Caption {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface CaptionState {
  captions: Caption[];
  currentCaption: string;
  editingId: string | null;
  editText: string;
  copyFeedback: string | null;
  
  // Actions
  addCaption: (text: string) => void;
  updateCaption: (id: string, text: string) => void;
  deleteCaption: (id: string) => void;
  clearCaptions: () => void;
  setCurrentCaption: (text: string) => void;
  startEditing: (caption: Caption) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  squashWithNext: (currentIndex: number) => void;
  setCopyFeedback: (message: string | null) => void;
  mergeCaption: (id: string, nextId: string) => void;
}

export const useCaptionStore = create<CaptionState>()(
  persist(
    (set, get) => ({
      captions: [],
      currentCaption: '',
      editingId: null,
      editText: '',
      copyFeedback: null,

      addCaption: (text: string) => {
        const newCaption: Caption = {
          id: Date.now().toString(),
          text: text.trim(),
          timestamp: new Date(),
          isFinal: true
        };
        
        set(state => ({
          captions: [...state.captions, newCaption],
          currentCaption: ''
        }));
      },

      updateCaption: (id: string, text: string) => {
        set(state => ({
          captions: state.captions.map(caption =>
            caption.id === id ? { ...caption, text: text.trim() } : caption
          )
        }));
      },

      deleteCaption: (id: string) => {
        set(state => ({
          captions: state.captions.filter(caption => caption.id !== id),
          editingId: state.editingId === id ? null : state.editingId
        }));
      },

      clearCaptions: () => {
        set({
          captions: [],
          currentCaption: '',
          editingId: null,
          editText: ''
        });
      },

      setCurrentCaption: (text: string) => {
        set({ currentCaption: text });
      },

      startEditing: (caption: Caption) => {
        set({
          editingId: caption.id,
          editText: caption.text
        });
      },

      saveEdit: () => {
        const { editingId, editText } = get();
        if (editingId && editText.trim()) {
          get().updateCaption(editingId, editText);
        }
        set({
          editingId: null,
          editText: ''
        });
      },

      cancelEdit: () => {
        set({
          editingId: null,
          editText: ''
        });
      },

      squashWithNext: (currentIndex: number) => {
        const { captions } = get();
        if (currentIndex < captions.length - 1) {
          const currentCaption = captions[currentIndex];
          const nextCaption = captions[currentIndex + 1];
          
          const mergedText = `${currentCaption.text} ${nextCaption.text}`.trim();
          
          set(state => ({
            captions: [
              ...state.captions.slice(0, currentIndex),
              { ...currentCaption, text: mergedText },
              ...state.captions.slice(currentIndex + 2)
            ]
          }));
        }
      },

      setCopyFeedback: (message: string | null) => {
        set({ copyFeedback: message });
        if (message) {
          setTimeout(() => set({ copyFeedback: null }), 2000);
        }
      },

      mergeCaption: (id: string, nextId: string) => {
        const { captions } = get();
        const currentIndex = captions.findIndex(c => c.id === id);
        const nextIndex = captions.findIndex(c => c.id === nextId);
        
        if (currentIndex !== -1 && nextIndex !== -1 && nextIndex === currentIndex + 1) {
          get().squashWithNext(currentIndex);
        }
      }
    }),
    {
      name: 'caption-store',
      partialize: (state) => ({
        captions: state.captions
      })
    }
  )
);