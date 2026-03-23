// packages/medical-logic/triage.ts

export type TriagePriority = 'RED' | 'AMBER' | 'GREEN';

export interface MedicalCase {
  id: string;
  patientId: string;
  timestamp: string;
  priority: TriagePriority;
  
  // The "Explainable AI" section
  aiDiagnosis: string;
  confidenceScore: number; // 0 to 1
  evidenceSummary: string[]; // Key symptoms found
  
  // Status for the Human-in-the-Loop
  status: 'PENDING_REVIEW' | 'VALIDATED' | 'ESCALATED';
  validatedBy?: string; // Doctor's ID
}
