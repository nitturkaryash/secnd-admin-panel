
/**
 * @file Zustand store for managing the patient queue.
 */
import { create } from 'zustand';
import { mockPatients, Patient } from '../lib/mockPatients';
import { showToast } from '../lib/toast';

interface QueueState {
  patients: Patient[];
  assignedPatients: Patient[];
  assignPatient: (patientId: string, doctorId: string, timeKey: string) => void;
  unassignPatient: (patientId: string) => void;
  updatePatientAssignment: (patientId: string, doctorId: string, timeKey: string) => void;
  updatePatient: (updatedPatient: Patient) => void;
}

export const useQueueStore = create<QueueState>((set, get) => {
  const initialPatients = mockPatients.filter(p => !p.assignedDoctor || p.status === 'Cancelled');
  const initialAssignedPatients = mockPatients.filter(p => p.assignedDoctor && p.status !== 'Cancelled');
  
  // Store initialized with patients
  
  return {
    patients: initialPatients,
    assignedPatients: initialAssignedPatients,
    
    assignPatient: (patientId: string, doctorId: string, timeKey: string) => {
      const state = get();
      const patient = state.patients.find(p => p.id === patientId);
      
      if (patient) {
        // Helpers
        const toMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
        const minutesToTime = (min: number) => {
          const h = Math.floor(min / 60) % 24; const m = min % 60; return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };
        const timeKeyFromISO = (iso: string) => { const d = new Date(iso); return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`; };
        const defaultDuration = 60;

        const durationMin = patient.endTime ? (toMinutes(patient.endTime) - toMinutes(timeKeyFromISO(patient.appointmentDateTime))) : defaultDuration;

        // Overlap prevention: compute proposed range and ensure it does not intersect existing appointments for this doctor
        const newStartMin = toMinutes(timeKey);
        const newEndMin = newStartMin + Math.max(15, durationMin);
        const hasOverlap = state.assignedPatients.some(p => {
          if (p.assignedDoctor !== doctorId) return false;
          if (p.id === patientId) return false;
          const pStart = toMinutes(timeKeyFromISO(p.appointmentDateTime));
          const pEnd = p.endTime ? toMinutes(p.endTime) : pStart + defaultDuration;
          return newStartMin < pEnd && newEndMin > pStart; // overlap if ranges intersect
        });
        if (hasOverlap) {
          showToast('This time overlaps an existing appointment for the doctor.', 'error');
          return; // do not assign
        }

        const [hours, minutes] = timeKey.split(':').map(Number);
        const appointmentDate = new Date();
        appointmentDate.setHours(hours, minutes, 0, 0);
        const endTime = minutesToTime(toMinutes(timeKey) + Math.max(15, durationMin));
        
        const updatedPatient = {
          ...patient,
          assignedDoctor: doctorId,
          appointmentDateTime: appointmentDate.toISOString(),
          status: 'Booked' as const,
          endTime,
        };

        set(state => ({
          patients: state.patients.filter(p => p.id !== patientId),
          assignedPatients: [...state.assignedPatients, updatedPatient],
        }));
      }
    },
    
    unassignPatient: (patientId: string) => {
      const state = get();
      const patient = state.assignedPatients.find(p => p.id === patientId);
      
      if (patient) {
        const unassignedPatient = {
          ...patient,
          assignedDoctor: '',
          status: 'Booked' as const,
        };

        set(state => ({
          assignedPatients: state.assignedPatients.filter(p => p.id !== patientId),
          patients: [...state.patients, unassignedPatient],
        }));
      }
    },
    
    updatePatientAssignment: (patientId: string, doctorId: string, timeKey: string) => {
      const state = get();
      const patient = state.assignedPatients.find(p => p.id === patientId);
      
      if (patient) {
        // Helpers
        const toMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
        const minutesToTime = (min: number) => {
          const h = Math.floor(min / 60) % 24; const m = min % 60; return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };
        const timeKeyFromISO = (iso: string) => { const d = new Date(iso); return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`; };

        const prevStart = timeKeyFromISO(patient.appointmentDateTime);
        const durationMin = patient.endTime ? (toMinutes(patient.endTime) - toMinutes(prevStart)) : 60;

        // Overlap prevention for reassign
        const newStartMin = toMinutes(timeKey);
        const newEndMin = newStartMin + Math.max(15, durationMin);
        const hasOverlap = state.assignedPatients.some(p => {
          if (p.assignedDoctor !== doctorId) return false;
          if (p.id === patientId) return false;
          const pStart = toMinutes(timeKeyFromISO(p.appointmentDateTime));
          const pEnd = p.endTime ? toMinutes(p.endTime) : pStart + 60;
          return newStartMin < pEnd && newEndMin > pStart;
        });
        if (hasOverlap) {
          showToast('This time overlaps an existing appointment for the doctor.', 'error');
          return; // reject move
        }

        const [hours, minutes] = timeKey.split(':').map(Number);
        const appointmentDate = new Date();
        appointmentDate.setHours(hours, minutes, 0, 0);
        const endTime = minutesToTime(toMinutes(timeKey) + Math.max(15, durationMin));
        
        const updatedPatient = {
          ...patient,
          assignedDoctor: doctorId,
          appointmentDateTime: appointmentDate.toISOString(),
          endTime,
        };

        set(state => ({
          assignedPatients: state.assignedPatients.map(p => 
            p.id === patientId ? updatedPatient : p
          ),
        }));
      }
    },

    updatePatient: (updatedPatient: Patient) => {
      set(state => ({
        assignedPatients: state.assignedPatients.map(p => 
          p.id === updatedPatient.id ? updatedPatient : p
        ),
        patients: state.patients.map(p => 
          p.id === updatedPatient.id ? updatedPatient : p
        ),
      }));
    },
  };
});
