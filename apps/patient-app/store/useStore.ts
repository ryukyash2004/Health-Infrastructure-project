import { create } from 'zustand';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface StructuredProfile {
  patient_name: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  contact: string | null;
  skipped_fields: string[];
  conditions: {
    hypertension: boolean;
    diabetes: boolean;
    asthma: boolean;
    thyroid: boolean;
  };
  other_history: string | null;
  sleep_cycle: string | null;
  bad_habits: {
    smoking: boolean;
    alcohol: boolean;
  };
  bowel_movement: string | null;
  allergies: {
    drug: boolean;
    food: boolean;
    environment: boolean;
  };
  allergy_reaction: string | null;
  vaccinations: {
    covid19: boolean;
    tetanus: boolean;
    hepatitisB: boolean;
  };
}

interface UIState {
  isLeftMenuOpen: boolean;
  isMedicalFormOpen: boolean;
  isSosOpen: boolean;
  isIntakeComplete: boolean;
  patientHistory: string;
  structuredProfile: StructuredProfile | null;
  messages: Message[];
  isLoading: boolean;
  caseId: number | null;
  error: { type: 'NETWORK' | 'AI' | 'TIMEOUT' | 'UNKNOWN', message: string } | null;
  toggleLeftMenu: () => void;
  toggleMedicalForm: () => void;
  toggleSos: () => void;
  setIntakeComplete: (complete: boolean) => void;
  setPatientHistory: (history: string) => void;
  setStructuredProfile: (profile: StructuredProfile) => void;
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
    if (match) initialCaseId = match[2];
  }

  return {
    isLeftMenuOpen: false,
    isMedicalFormOpen: false,
    isSosOpen: false,
    isIntakeComplete: false,
    patientHistory: '',
    structuredProfile: null,
    messages: [],
    isLoading: false,
    caseId: initialCaseId,
    error: null,

    toggleLeftMenu: () => set((state) => ({ isLeftMenuOpen: !state.isLeftMenuOpen })),
    toggleMedicalForm: () => set((state) => ({ isMedicalFormOpen: !state.isMedicalFormOpen })),
    toggleSos: () => set((state) => ({ isSosOpen: !state.isSosOpen })),
    setIntakeComplete: (complete) => set({ isIntakeComplete: complete }),
    setPatientHistory: (history) => set({ patientHistory: history }),
    setStructuredProfile: (profile) => set({ structuredProfile: profile }),
    closeAll: () => set({ isLeftMenuOpen: false, isMedicalFormOpen: false, isSosOpen: false }),

    sendMessage: async (text: string) => {
      if (!text.trim()) return;

      const { patientHistory, structuredProfile, caseId } = get();

      // Append user message
      const userMessage: Message = { role: 'user', content: text };
      set((state) => ({ 
        messages: [...state.messages, userMessage],
        isLoading: true,
        error: null
      }));

      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      try {
        const controller = new AbortController();
        const timeoutError = new DOMException(
          'Request timeout: triage service took longer than 15 seconds.',
          'AbortError'
        );
        timeoutId = setTimeout(() => controller.abort(timeoutError), 15000);

        const sessionToken = typeof document !== 'undefined'
          ? document.cookie.match(new RegExp('(^| )session_token=([^;]+)'))?.[2] || ''
          : '';

        const response = await fetch('http://localhost:8000/api/v1/triage/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Type': 'patient',
            'X-User-ID': 'user_123',
            'X-Session-Token': sessionToken
          },
          body: JSON.stringify({
            patient_id: caseId,
            patient_name: structuredProfile?.patient_name || 'Patient', 
            symptoms: text,
            patient_history: patientHistory || "No history provided.",
            skipped_fields: structuredProfile?.skipped_fields ?? [],
            age: structuredProfile?.age ?? null,
            gender: structuredProfile?.gender ?? null,
            blood_group: structuredProfile?.blood_group ?? null,
            contact: structuredProfile?.contact ?? null,
            conditions: structuredProfile?.conditions ?? null,
            other_history: structuredProfile?.other_history ?? null,
            sleep_cycle: structuredProfile?.sleep_cycle ?? null,
            bad_habits: structuredProfile?.bad_habits ?? null,
            bowel_movement: structuredProfile?.bowel_movement ?? null,
            allergies: structuredProfile?.allergies ?? null,
            allergy_reaction: structuredProfile?.allergy_reaction ?? null,
            vaccinations: structuredProfile?.vaccinations ?? null
          }),
          signal: controller.signal
        });

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

        // Save caseId and sessionToken to cookie
        if (data.patient_id) {
          document.cookie = `case_id=${data.patient_id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        }
        if (data.session_token) {
          document.cookie = `session_token=${data.session_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        }

        set((state) => ({ 
          messages: [...state.messages, aiMessage],
          isLoading: false,
          caseId: data.patient_id
        }));
      } catch (err: any) {
        console.error('Error sending message:', err);
        
        let errorObj = { type: 'UNKNOWN' as const, message: 'An unexpected error occurred.' };
        
        if (err?.name === 'AbortError') {
          errorObj = { type: 'TIMEOUT', message: 'Request Timeout: The server is taking too long to respond.' };
        } else if (err?.type === 'AI') {
          errorObj = err;
        } else if (err?.message === 'Failed to fetch') {
          errorObj = { type: 'NETWORK', message: 'Server Offline: Cannot connect to the Aegis backend.' };
        }

        set({ 
          isLoading: false,
          error: errorObj
        });
      } finally {
        // Always clear the timer so a completed request cannot be aborted later.
        if (timeoutId) clearTimeout(timeoutId);
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
            patient_name: data.patient_name,
            baseline_history: data.baseline_history,
            lethal_allergies: data.lethal_allergies,
            skipped_fields: data.skipped_fields
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
