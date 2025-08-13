import { create } from 'zustand';
import { adminApi, appointmentsApi, patientsApi, doctorsApi } from '../lib/api';
import type { Patient, Doctor, AppointmentWithDetails, PatientWithAppointment } from '../lib/api';
import { convertPatientToLegacy, type PatientLegacy } from '../lib/types';
import { showToast } from '../lib/toast';

interface ApiState {
  // Data
  patients: Patient[];
  doctors: Doctor[];
  appointments: AppointmentWithDetails[];
  unassignedPatients: Patient[];
  assignedPatients: PatientWithAppointment[];
  
  // Loading states
  isLoading: boolean;
  patientsLoading: boolean;
  doctorsLoading: boolean;
  appointmentsLoading: boolean;
  
  // Actions
  loadDashboard: (date?: string) => Promise<void>;
  loadPatients: () => Promise<void>;
  loadDoctors: () => Promise<void>;
  loadAppointments: (date?: string) => Promise<void>;
  loadPatientQueue: () => Promise<void>;
  loadAssignedPatients: () => Promise<void>;
  
  // Patient actions
  createPatient: (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'serial_no'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  
  // Doctor actions
  getDoctorById: (id: string) => Promise<Doctor>;
  createDoctor: (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => Promise<Doctor>;
  updateDoctor: (id: string, updates: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  
  // Appointment actions
  assignPatient: (patientId: string, doctorId: string, timeKey: string) => Promise<void>;
  updatePatientAssignment: (patientId: string, doctorId: string, timeKey: string) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: any) => Promise<void>;
  rescheduleAppointment: (appointmentId: string, newDateTime: string, newEndTime?: string) => Promise<void>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
  
  // Legacy compatibility methods
  getLegacyPatients: () => PatientLegacy[];
  getLegacyAssignedPatients: () => PatientLegacy[];
}

export const useApiStore = create<ApiState>((set, get) => ({
  // Initial state
  patients: [],
  doctors: [],
  appointments: [],
  unassignedPatients: [],
  assignedPatients: [],
  isLoading: false,
  patientsLoading: false,
  doctorsLoading: false,
  appointmentsLoading: false,

  // Load dashboard data
  loadDashboard: async (date?: string) => {
    set({ isLoading: true });
    try {
      const dashboard = await adminApi.getDashboard(date);
      set({
        patients: dashboard.patients,
        doctors: dashboard.doctors,
        appointments: dashboard.appointments,
        unassignedPatients: dashboard.unassignedPatients,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      showToast('Failed to load dashboard data', 'error');
      set({ isLoading: false });
    }
  },

  // Load patients
  loadPatients: async () => {
    set({ patientsLoading: true });
    try {
      const patients = await patientsApi.getAll();
      set({ patients, patientsLoading: false });
    } catch (error) {
      console.error('Failed to load patients:', error);
      showToast('Failed to load patients', 'error');
      set({ patientsLoading: false });
    }
  },

  // Load doctors
  loadDoctors: async () => {
    set({ doctorsLoading: true });
    try {
      const doctors = await doctorsApi.getAll();
      set({ doctors, doctorsLoading: false });
    } catch (error) {
      console.error('Failed to load doctors:', error);
      showToast('Failed to load doctors', 'error');
      set({ doctorsLoading: false });
    }
  },

  // Load appointments
  loadAppointments: async (date?: string) => {
    set({ appointmentsLoading: true });
    try {
      const appointments = date 
        ? await appointmentsApi.getByDate(date)
        : await appointmentsApi.getAll();
      set({ appointments, appointmentsLoading: false });
    } catch (error) {
      console.error('Failed to load appointments:', error);
      showToast('Failed to load appointments', 'error');
      set({ appointmentsLoading: false });
    }
  },

  // Load patient queue
  loadPatientQueue: async () => {
    try {
      const unassignedPatients = await patientsApi.getUnassigned();
      set({ unassignedPatients });
    } catch (error) {
      console.error('Failed to load patient queue:', error);
      showToast('Failed to load patient queue', 'error');
    }
  },

  // Load assigned patients
  loadAssignedPatients: async () => {
    try {
      const assignedPatients = await adminApi.getAssignedPatients();
      set({ assignedPatients });
    } catch (error) {
      console.error('Failed to load assigned patients:', error);
      showToast('Failed to load assigned patients', 'error');
    }
  },

  // Create patient
  createPatient: async (patientData) => {
    try {
      const newPatient = await patientsApi.create(patientData);
      set(state => ({
        patients: [...state.patients, newPatient]
      }));
      showToast('Patient created successfully');
    } catch (error) {
      console.error('Failed to create patient:', error);
      showToast('Failed to create patient', 'error');
    }
  },

  // Update patient
  updatePatient: async (id, updates) => {
    try {
      const updatedPatient = await patientsApi.update(id, updates);
      set(state => ({
        patients: state.patients.map(p => p.id === id ? updatedPatient : p)
      }));
      showToast('Patient updated successfully');
    } catch (error) {
      console.error('Failed to update patient:', error);
      showToast('Failed to update patient', 'error');
    }
  },

  // Delete patient
  deletePatient: async (id) => {
    try {
      await patientsApi.delete(id);
      set(state => ({
        patients: state.patients.filter(p => p.id !== id),
        unassignedPatients: state.unassignedPatients.filter(p => p.id !== id)
      }));
      showToast('Patient deleted successfully');
    } catch (error) {
      console.error('Failed to delete patient:', error);
      showToast('Failed to delete patient', 'error');
    }
  },

  // Get doctor by ID
  getDoctorById: async (id) => {
    try {
      const doctor = await doctorsApi.getById(id);
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      return doctor;
    } catch (error) {
      console.error('Failed to get doctor:', error);
      showToast('Failed to get doctor details', 'error');
      throw error;
    }
  },

  // Create doctor
  createDoctor: async (doctorData) => {
    try {
      const newDoctor = await doctorsApi.create(doctorData);
      set(state => ({
        doctors: [...state.doctors, newDoctor]
      }));
      showToast('Doctor created successfully');
      return newDoctor;
    } catch (error) {
      console.error('Failed to create doctor:', error);
      showToast('Failed to create doctor', 'error');
      throw error;
    }
  },

  // Update doctor
  updateDoctor: async (id, updates) => {
    try {
      const updatedDoctor = await doctorsApi.update(id, updates);
      set(state => ({
        doctors: state.doctors.map(d => d.id === id ? updatedDoctor : d)
      }));
      showToast('Doctor updated successfully');
    } catch (error) {
      console.error('Failed to update doctor:', error);
      showToast('Failed to update doctor', 'error');
    }
  },
  
  // Delete doctor
  deleteDoctor: async (id) => {
    try {
      await doctorsApi.delete(id);
      set(state => ({
        doctors: state.doctors.filter(d => d.id !== id)
      }));
      showToast('Doctor deleted successfully');
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      showToast('Failed to delete doctor', 'error');
    }
  },

  // Assign patient to doctor
  assignPatient: async (patientId, doctorId, timeKey) => {
    try {
      // Convert timeKey to full datetime
      const today = new Date();
      const [hours, minutes] = timeKey.split(':').map(Number);
      const appointmentDateTime = new Date(today);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      // Calculate end time (default 60 minutes)
      const endTime = new Date(appointmentDateTime);
      endTime.setMinutes(endTime.getMinutes() + 60);

      await appointmentsApi.assignPatient(
        patientId,
        doctorId,
        appointmentDateTime.toISOString(),
        endTime.toISOString()
      );

      // Refresh data
      await Promise.all([
        get().loadPatientQueue(),
        get().loadAssignedPatients(),
        get().loadAppointments()
      ]);

      showToast('Patient assigned successfully');
    } catch (error) {
      console.error('Failed to assign patient:', error);
      showToast('Failed to assign patient', 'error');
    }
  },

  // Update patient assignment
  updatePatientAssignment: async (patientId, doctorId, timeKey) => {
    try {
      // Find existing appointment for this patient
      const { appointments } = get();
      const existingAppointment = appointments.find(apt => apt.patient_id === patientId);
      
      if (!existingAppointment) {
        // Create new assignment
        await get().assignPatient(patientId, doctorId, timeKey);
        return;
      }

      // Update existing appointment
      const [hours, minutes] = timeKey.split(':').map(Number);
      const appointmentDateTime = new Date();
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(appointmentDateTime);
      endTime.setMinutes(endTime.getMinutes() + 60);

      await appointmentsApi.update(existingAppointment.id, {
        doctor_id: doctorId,
        appointment_date_time: appointmentDateTime.toISOString(),
        end_time: endTime.toISOString()
      });

      // Refresh data
      await get().loadAppointments();
      showToast('Assignment updated successfully');
    } catch (error) {
      console.error('Failed to update assignment:', error);
      showToast('Failed to update assignment', 'error');
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      await appointmentsApi.updateStatus(appointmentId, status);
      await get().loadAppointments();
      showToast('Appointment status updated');
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      showToast('Failed to update appointment status', 'error');
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId, newDateTime, newEndTime) => {
    try {
      await appointmentsApi.reschedule(appointmentId, newDateTime, newEndTime);
      await get().loadAppointments();
      showToast('Appointment rescheduled successfully');
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      showToast('Failed to reschedule appointment', 'error');
    }
  },

  // Delete appointment
  deleteAppointment: async (appointmentId) => {
    try {
      await appointmentsApi.delete(appointmentId);
      await get().loadAppointments();
      await get().loadPatientQueue();
      showToast('Appointment deleted successfully');
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      showToast('Failed to delete appointment', 'error');
    }
  },

  // Legacy compatibility methods
  getLegacyPatients: () => {
    const { unassignedPatients } = get();
    console.log('Converting unassigned patients:', unassignedPatients.length);
    return unassignedPatients.map(patient => convertPatientToLegacy(patient));
  },

  getLegacyAssignedPatients: () => {
    const { assignedPatients } = get();
    console.log('Converting assigned patients:', assignedPatients.length);
    return assignedPatients.map(patientWithAppointment => {
      const appointment = (patientWithAppointment as any).appointment;
      const doctor = (patientWithAppointment as any).assignedDoctor;
      return convertPatientToLegacy(patientWithAppointment as any, appointment, doctor as any);
    });
  }
}));
