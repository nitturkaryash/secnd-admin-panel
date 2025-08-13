/**
 * @file Updated Zustand store that bridges old interface with new Supabase API.
 */
import { create } from 'zustand';
import { useApiStore } from './useApiStore';
import type { PatientLegacy } from '../lib/types';
import { showToast } from '../lib/toast';

interface QueueState {
  patients: PatientLegacy[];
  assignedPatients: PatientLegacy[];
  assignPatient: (patientId: string, doctorId: string, timeKey: string) => void;
  unassignPatient: (patientId: string) => void;
  updatePatientAssignment: (patientId: string, doctorId: string, timeKey: string) => void;
  updatePatient: (updatedPatient: PatientLegacy) => void;
  // New methods for data loading
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

export const useQueueStore = create<QueueState>((set, get) => {
  return {
    patients: [],
    assignedPatients: [],
    isLoading: false,
    
    // Load initial data from API
    loadData: async () => {
      set({ isLoading: true });
      try {
        const apiStore = useApiStore.getState();
        await apiStore.loadPatientQueue();
        await apiStore.loadAssignedPatients();
        await apiStore.loadAppointments();
        
        const patients = apiStore.getLegacyPatients();
        const assignedPatients = apiStore.getLegacyAssignedPatients();
        
        console.log('Loaded patients:', patients.length);
        console.log('Loaded assigned patients:', assignedPatients.length);
        
        set({ 
          patients,
          assignedPatients,
          isLoading: false 
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('Failed to load patient data', 'error');
        set({ isLoading: false });
      }
    },

    // Refresh data
    refreshData: async () => {
      await get().loadData();
    },
    
    assignPatient: async (patientId: string, doctorId: string, timeKey: string) => {
      // Optimistic UI update
      const prevPatients = get().patients;
      set({
        patients: prevPatients.map(p => p.id === patientId ? { ...p, assignedDoctor: doctorId } : p)
      });
      try {
        const apiStore = useApiStore.getState();
        await apiStore.assignPatient(patientId, doctorId, timeKey);
        // Refresh local state (patient will likely move out of queue)
        await get().refreshData();
        showToast('Patient assigned successfully!');
      } catch (error) {
        // Revert on failure
        set({ patients: prevPatients });
        console.error('Failed to assign patient:', error);
        showToast('Failed to assign patient', 'error');
      }
    },

    unassignPatient: async (patientId: string) => {
      try {
        const apiStore = useApiStore.getState();
        const { appointments } = apiStore;
        
        // Find and delete the appointment for this patient
        const appointment = appointments.find(apt => apt.patient_id === patientId);
        if (appointment) {
          await apiStore.deleteAppointment(appointment.id);
          await get().refreshData();
          showToast('Patient unassigned successfully');
        }
      } catch (error) {
        console.error('Failed to unassign patient:', error);
        showToast('Failed to unassign patient', 'error');
      }
    },
    
    updatePatientAssignment: async (patientId: string, doctorId: string, timeKey: string) => {
      // Optimistic UI update
      const prevPatients = get().patients;
      set({
        patients: prevPatients.map(p => p.id === patientId ? { ...p, assignedDoctor: doctorId } : p)
      });
      try {
        const apiStore = useApiStore.getState();
        await apiStore.updatePatientAssignment(patientId, doctorId, timeKey);
        // Refresh local state
        await get().refreshData();
        showToast('Assignment updated successfully!');
      } catch (error) {
        set({ patients: prevPatients });
        console.error('Failed to update assignment:', error);
        showToast('Failed to update assignment', 'error');
      }
    },
    
    updatePatient: async (updatedPatient: PatientLegacy) => {
      try {
        const apiStore = useApiStore.getState();
        
        // Convert legacy patient back to database format
        const patientUpdates = {
          name: updatedPatient.name,
          age: updatedPatient.age,
          gender: updatedPatient.gender,
          avatar: updatedPatient.avatar,
          symptoms: updatedPatient.symptoms,
          priority: updatedPatient.priority
        };
        
        await apiStore.updatePatient(updatedPatient.id, patientUpdates);
        
        // Update local state
        set(state => ({
          patients: state.patients.map(p => 
            p.id === updatedPatient.id ? updatedPatient : p
          ),
          assignedPatients: state.assignedPatients.map(p => 
            p.id === updatedPatient.id ? updatedPatient : p
          )
        }));
        
        showToast('Patient updated successfully!');
      } catch (error) {
        console.error('Failed to update patient:', error);
        showToast('Failed to update patient', 'error');
      }
    }
  };
});