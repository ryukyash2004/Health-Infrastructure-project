import { create } from 'zustand';

interface UIState {
  isLeftMenuOpen: boolean;
  isMedicalFormOpen: boolean;
  isSosOpen: boolean;
  toggleLeftMenu: () => void;
  toggleMedicalForm: () => void;
  toggleSos: () => void;
  closeAll: () => void;
}

export const useStore = create<UIState>((set) => ({
  isLeftMenuOpen: false,
  isMedicalFormOpen: false,
  isSosOpen: false,
  toggleLeftMenu: () => set((state) => ({ isLeftMenuOpen: !state.isLeftMenuOpen })),
  toggleMedicalForm: () => set((state) => ({ isMedicalFormOpen: !state.isMedicalFormOpen })),
  toggleSos: () => set((state) => ({ isSosOpen: !state.isSosOpen })),
  closeAll: () => set({ isLeftMenuOpen: false, isMedicalFormOpen: false, isSosOpen: false }),
}));
