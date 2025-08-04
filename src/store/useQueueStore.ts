
/**
 * @file Zustand store for managing the patient queue.
 */
import { create } from 'zustand';
import { mockPatients, Patient } from '../lib/mockPatients';

interface QueueState {
  patients: Patient[];
  assignPatient: (patientId: string, doctorId: string, slot: Date) => Promise<void>;
}

export const useQueueStore = create<QueueState>((set) => ({
  patients: mockPatients,
  assignPatient: async (patientId) => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      patients: state.patients.filter((p) => p.id !== patientId),
    }));
  },
}));
