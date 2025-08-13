// Import types from API for compatibility with existing code
import type {
  Doctor,
  Patient,
  Appointment,
  AppointmentStatus,
  Priority,
  Gender,
  PatientWithAppointment,
  AppointmentWithDetails
} from './api';

// Re-export them
export type {
  Doctor,
  Patient,
  Appointment,
  AppointmentStatus,
  Priority,
  Gender,
  PatientWithAppointment,
  AppointmentWithDetails
};

// Legacy compatibility types
export type { Priority as Priority_, Gender as Gender_, AppointmentStatus as AppointmentStatus_ } from './mockPatients';

// Updated Patient interface that matches database structure
export interface PatientLegacy {
  id: string;
  serialNo: number;
  name: string;
  age: number | null;
  gender: Gender | null;
  assignedDoctor?: string; // doctor ID
  appointmentDateTime: string;
  endTime?: string;
  status: AppointmentStatus;
  avatar: string | null;
  requestedTime: Date;
  symptoms: string | null;
  priority: Priority;
}

// Convert database patient to legacy format for existing components
export function convertPatientToLegacy(
  patient: Patient, 
  appointment?: Appointment,
  doctor?: Doctor
): PatientLegacy {
  return {
    id: patient.id,
    serialNo: patient.serial_no,
    name: patient.name,
    age: patient.age,
    gender: patient.gender as Gender,
    assignedDoctor: appointment?.doctor_id || doctor?.id || undefined,
    appointmentDateTime: appointment?.appointment_date_time || new Date().toISOString(),
    endTime: appointment?.end_time ? new Date(appointment.end_time).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }) : undefined,
    status: (appointment?.status as AppointmentStatus) || 'pending',
    avatar: patient.avatar,
    requestedTime: patient.requested_time ? new Date(patient.requested_time) : new Date(),
    symptoms: patient.symptoms,
    priority: patient.priority as Priority || 'Medium'
  };
}

// Convert legacy patient to database format
export function convertLegacyToPatient(legacyPatient: PatientLegacy): {
  patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
  appointment?: Omit<Appointment, 'id' | 'patient_id' | 'created_at' | 'updated_at'>;
} {
  const patient = {
    serial_no: legacyPatient.serialNo,
    name: legacyPatient.name,
    age: legacyPatient.age,
    gender: legacyPatient.gender,
    avatar: legacyPatient.avatar,
    requested_time: legacyPatient.requestedTime.toISOString(),
    symptoms: legacyPatient.symptoms,
    priority: legacyPatient.priority
  };

  const appointment = legacyPatient.assignedDoctor ? {
    doctor_id: legacyPatient.assignedDoctor,
    appointment_date_time: legacyPatient.appointmentDateTime,
    end_time: legacyPatient.endTime ? 
      new Date(legacyPatient.appointmentDateTime.split('T')[0] + 'T' + legacyPatient.endTime + ':00').toISOString() : 
      null,
    status: legacyPatient.status,
    notes: null
  } : undefined;

  return { patient, appointment };
}
