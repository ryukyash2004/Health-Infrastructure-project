import { create } from 'zustand';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface UIState {
  isLeftMenuOpen: boolean;
  isMedicalFormOpen: boolean;
  isSosOpen: boolean;
  isIntakeComplete: boolean;
  patientHistory: string;
  messages: Message[];
  isLoading: boolean;
  caseId: number | null;
  error: { type: 'NETWORK' | 'AI' | 'TIMEOUT' | 'UNKNOWN', message: string } | null;
  toggleLeftMenu: () => void;
  toggleMedicalForm: () => void;
  toggleSos: () => void;
  setIntakeComplete: (complete: boolean) => void;
  setPatientHistory: (history: string) => void;
  closeAll: () => void;
  
  sendMessage: (text: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  submitMedicalProfile: (data: any) => Promise<void>;
}

export const useStore = create<UIState>((set, get) => {
  // Try to load case_id from cookie on initialization
  let initialCaseId = null;
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )case_id=([^;]+)'));
    if (match) initialCaseId = parseInt(match[2]);
  }

  return {
    isLeftMenuOpen: false,
    isMedicalFormOpen: false,
    isSosOpen: false,
    isIntakeComplete: false,
    patientHistory: '',
    messages: [],
    isLoading: false,
    caseId: initialCaseId,
    error: null,

    toggleLeftMenu: () => set((state) => ({ isLeftMenuOpen: !state.isLeftMenuOpen })),
    toggleMedicalForm: () => set((state) => ({ isMedicalFormOpen: !state.isMedicalFormOpen })),
    toggleSos: () => set((state) => ({ isSosOpen: !state.isSosOpen })),
    setIntakeComplete: (complete) => set({ isIntakeComplete: complete }),
    setPatientHistory: (history) => set({ patientHistory: history }),
    closeAll: () => set({ isLeftMenuOpen: false, isMedicalFormOpen: false, isSosOpen: false }),

    sendMessage: async (text: string) => {
      if (!text.trim()) return;

      const { patientHistory } = get();

      // Append user message
      const userMessage: Message = { role: 'user', content: text };
      set((state) => ({ 
        messages: [...state.messages, userMessage],
        isLoading: true,
        error: null
      }));

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch('http://localhost:8000/api/v1/triage/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Type': 'patient',
            'X-User-ID': 'user_123'
          },
          body: JSON.stringify({
            patient_name: 'Patient', 
            symptoms: text,
            patient_history: patientHistory || "No history provided."
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 503 || errorData.detail?.error === 'AI_ENGINE_OFFLINE') {
            throw { type: 'AI', message: 'AI Engine Offline: The medical reasoning service is temporarily down.' };
          }
          throw { type: 'UNKNOWN', message: `Server Error (${response.status}): Please try again.` };
        }

        const data = await response.json();
        
        const aiMessage: Message = { 
          role: 'ai', 
          content: data.assessment 
        };

        // Save caseId to cookie
        if (data.patient_id) {
          document.cookie = `case_id=${data.patient_id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        }

        set((state) => ({ 
          messages: [...state.messages, aiMessage],
          isLoading: false,
          caseId: data.patient_id
        }));
      } catch (err: any) {
        console.error('Error sending message:', err);
        
        let errorObj = { type: 'UNKNOWN' as const, message: 'An unexpected error occurred.' };
        
        if (err.name === 'AbortError') {
          errorObj = { type: 'TIMEOUT', message: 'Request Timeout: The server is taking too long to respond.' };
        } else if (err.type === 'AI') {
          errorObj = err;
        } else if (err.message === 'Failed to fetch') {
          errorObj = { type: 'NETWORK', message: 'Server Offline: Cannot connect to the Aegis backend.' };
        }

        set({ 
          isLoading: false,
          error: errorObj
        });
      }
    },

    retryLastMessage: async () => {
      const { messages } = get();
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        // Remove the last user message before retrying to avoid duplicates in the UI
        set(state => ({
          messages: state.messages.slice(0, -1)
        }));
        await get().sendMessage(lastUserMessage.content);
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
  };
});
