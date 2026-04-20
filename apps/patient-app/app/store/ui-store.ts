import { create } from 'zustand';

interface UIState {
  isLeftDrawerOpen: boolean;
  isRecordModalOpen: boolean;
  isSOSOpen: boolean;
  toggleLeftDrawer: (open?: boolean) => void;
  toggleRecordModal: (open?: boolean) => void;
  toggleSOS: (open?: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLeftDrawerOpen: false,
  isRecordModalOpen: false,
  isSOSOpen: false,
  toggleLeftDrawer: (open) => 
    set((state) => ({ 
      isLeftDrawerOpen: open !== undefined ? open : !state.isLeftDrawerOpen 
    })),
  toggleRecordModal: (open) => 
    set((state) => ({ 
      isRecordModalOpen: open !== undefined ? open : !state.isRecordModalOpen 
    })),
  toggleSOS: (open) => 
    set((state) => ({ 
      isSOSOpen: open !== undefined ? open : !state.isSOSOpen 
    })),
}));
