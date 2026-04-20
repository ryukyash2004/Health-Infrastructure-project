import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  phone: string;
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  guestId: string;
  isAuthModalOpen: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setGuestId: (id: string) => void;
  toggleAuthModal: (open?: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      guestId: '',
      isAuthModalOpen: false,

      login: (user) => set({ isAuthenticated: true, user, isAuthModalOpen: false }),
      logout: () => set({ isAuthenticated: false, user: null }),
      
      setGuestId: (id) => set({ guestId: id }),
      
      toggleAuthModal: (open) => 
        set((state) => ({ 
          isAuthModalOpen: open !== undefined ? open : !state.isAuthModalOpen 
        })),
    }),
    {
      name: 'aegis-auth-storage',
      // Only persist these keys
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user, 
        guestId: state.guestId 
      }),
    }
  )
);

// Initialize Guest ID if it doesn't exist
if (typeof window !== 'undefined') {
  const state = useAuthStore.getState();
  if (!state.guestId) {
    const newGuestId = uuidv4();
    state.setGuestId(newGuestId);
  }
}
