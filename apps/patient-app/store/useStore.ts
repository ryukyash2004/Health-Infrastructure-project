import { create } from 'zustand';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface UIState {
  isLeftMenuOpen: boolean;
  isMedicalFormOpen: boolean;
  isSosOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  toggleLeftMenu: () => void;
  toggleMedicalForm: () => void;
  toggleSos: () => void;
  closeAll: () => void;
  
  sendMessage: (text: string) => Promise<void>;
  submitMedicalProfile: (data: any) => Promise<void>;
}

export const useStore = create<UIState>((set, get) => ({
  isLeftMenuOpen: false,
  isMedicalFormOpen: false,
  isSosOpen: false,
  messages: [],
  isLoading: false,

  toggleLeftMenu: () => set((state) => ({ isLeftMenuOpen: !state.isLeftMenuOpen })),
  toggleMedicalForm: () => set((state) => ({ isMedicalFormOpen: !state.isMedicalFormOpen })),
  toggleSos: () => set((state) => ({ isSosOpen: !state.isSosOpen })),
  closeAll: () => set({ isLeftMenuOpen: false, isMedicalFormOpen: false, isSosOpen: false }),

  sendMessage: async (text: string) => {
    if (!text.trim()) return;

    // Append user message
    const userMessage: Message = { role: 'user', content: text };
    set((state) => ({ 
      messages: [...state.messages, userMessage],
      isLoading: true 
    }));

    try {
      const response = await fetch('http://localhost:8000/api/v1/triage/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Type': 'patient',
          'X-User-ID': 'user_123' // Mock ID
        },
        body: JSON.stringify({
          patient_name: 'Guest Patient', // Default or from profile
          symptoms: text
        }),
      });

      if (!response.ok) throw new Error('Failed to get response from Meditron');

      const data = await response.json();
      
      const aiMessage: Message = { 
        role: 'ai', 
        content: data.assessment 
      };

      set((state) => ({ 
        messages: [...state.messages, aiMessage],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      };
      set((state) => ({ 
        messages: [...state.messages, errorMessage],
        isLoading: false 
      }));
    }
  },

  submitMedicalProfile: async (data: any) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/patients/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: data.patientName || 'Guest Patient',
          baseline_history: data.medicalHistory || 'None',
          lethal_allergies: data.allergies || 'None'
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      set({ isMedicalFormOpen: false });
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error submitting profile:', error);
    }
  },
}));
