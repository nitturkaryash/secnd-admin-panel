import { supabase } from './supabase';
import type { Tables, TablesInsert, TablesUpdate } from './database.types';

// Type aliases for cleaner code
export type Doctor = Tables<'doctors'>;
export type Patient = Tables<'patients'>;
export type Appointment = Tables<'appointments'>;
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'Booked' | 'Checked-in';
export type Priority = 'Low' | 'Medium' | 'High';
export type Gender = 'Male' | 'Female' | 'Other';

// Enhanced types with joined data
export interface PatientWithAppointment extends Patient {
  appointment?: Appointment;
  assignedDoctor?: Doctor;
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor?: Doctor | null;
}

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};

// Doctors API
export const doctorsApi = {
  async getAll(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
    
    console.log('Loaded doctors:', data?.length || 0);
    return data || [];
  },

  async getById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(doctor: TablesInsert<'doctors'>): Promise<Doctor> {
    const { data, error } = await supabase
      .from('doctors')
      .insert(doctor)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'doctors'>): Promise<Doctor> {
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Patients API
export const patientsApi = {
  async getAll(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('serial_no');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(patient: TablesInsert<'patients'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'patients'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get patients without appointments (in queue)
  async getUnassigned(): Promise<Patient[]> {
    // Get all patients first
    const { data: allPatients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .order('serial_no');
    
    if (patientsError) {
      console.error('Error fetching all patients:', patientsError);
      throw patientsError;
    }
    
    // Get all appointments
    const { data: allAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('patient_id, doctor_id')
      .not('doctor_id', 'is', null);
    
    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }
    
    // Get patient IDs that have assigned doctors
    const assignedPatientIds = new Set(allAppointments?.map(apt => apt.patient_id) || []);
    
    // Filter patients who don't have assigned doctors
    const unassignedPatients = allPatients?.filter(patient => !assignedPatientIds.has(patient.id)) || [];
    
    console.log('Total patients:', allPatients?.length || 0);
    console.log('Assigned patients:', assignedPatientIds.size);
    console.log('Unassigned patients:', unassignedPatients.length);
    
    return unassignedPatients;
  }
};

// Appointments API
export const appointmentsApi = {
  async getAll(): Promise<AppointmentWithDetails[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .order('appointment_date_time');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<AppointmentWithDetails | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByDate(date: string): Promise<AppointmentWithDetails[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .gte('appointment_date_time', startDate.toISOString())
      .lte('appointment_date_time', endDate.toISOString())
      .order('appointment_date_time');
    
    if (error) throw error;
    return data || [];
  },

  async getByDoctor(doctorId: string): Promise<AppointmentWithDetails[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .eq('doctor_id', doctorId)
      .order('appointment_date_time');
    
    if (error) throw error;
    return data || [];
  },

  // Get appointments for a specific patient
  async getByPatient(patientId: string): Promise<AppointmentWithDetails[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date_time');
    
    if (error) throw error;
    return data || [];
  },

  async create(appointment: TablesInsert<'appointments'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'appointments'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Assign patient to doctor
  async assignPatient(
    patientId: string, 
    doctorId: string, 
    appointmentDateTime: string,
    endTime?: string
  ): Promise<Appointment> {
    // If there is an existing appointment for this patient without a doctor,
    // upgrade it instead of creating a duplicate. This keeps the queue clean.
    const existingForPatient = await this.getByPatient(patientId);
    const unassigned = existingForPatient.find(a => !a.doctor_id);

    if (unassigned) {
      return this.update(unassigned.id, {
        doctor_id: doctorId,
        appointment_date_time: appointmentDateTime,
        end_time: endTime,
        status: 'Booked',
        notes: 'Assigned via admin panel'
      });
    }

    const appointment: TablesInsert<'appointments'> = {
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_date_time: appointmentDateTime,
      end_time: endTime,
      status: 'Booked',
      notes: 'Assigned via admin panel'
    };

    return this.create(appointment);
  },

  // Update appointment status
  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const normalizeAppointmentStatus = (rawStatus: string): AppointmentStatus => {
      switch (rawStatus) {
        case 'Cancelled':
          return 'cancelled';
        case 'Completed':
          return 'completed';
        // Normalize potential variants of checked-in just in case
        case 'checked-in':
        case 'Checked-In':
        case 'checked-In':
          return 'Checked-in';
        default:
          return rawStatus as AppointmentStatus;
      }
    };
    const normalized = normalizeAppointmentStatus(status as unknown as string);
    return this.update(id, { status: normalized });
  },

  // Reschedule appointment
  async reschedule(
    id: string, 
    newDateTime: string, 
    newEndTime?: string
  ): Promise<Appointment> {
    return this.update(id, {
      appointment_date_time: newDateTime,
      end_time: newEndTime
    });
  }
};

// Combined API for complex operations
export const adminApi = {
  // Get dashboard data
  async getDashboard(date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const [doctors, patients, appointments, unassignedPatients] = await Promise.all([
      doctorsApi.getAll(),
      patientsApi.getAll(),
      appointmentsApi.getByDate(targetDate),
      patientsApi.getUnassigned()
    ]);

    return {
      doctors,
      patients,
      appointments,
      unassignedPatients,
      stats: {
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        todayAppointments: appointments.length,
        unassignedCount: unassignedPatients.length
      }
    };
  },

  // Get patient queue (patients without assignments)
  async getPatientQueue(): Promise<PatientWithAppointment[]> {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        appointments:appointments!left(
          id,
          appointment_date_time,
          status,
          doctor_id,
          doctor:doctors(*)
        )
      `)
      .order('serial_no');
    
    if (error) throw error;
    
    console.log('Raw patient queue data:', data?.length || 0);
    
    // Filter patients without active appointments or with pending appointments
    const filteredPatients = (data || []).filter((patient: any) => {
      const appts = patient.appointments as any[] | null | undefined;
      const hasUnassignedAppointment = !appts?.length || appts.some(apt => !apt.doctor_id);
      console.log(`Patient ${patient.name}: appointments=${appts?.length || 0}, unassigned=${hasUnassignedAppointment}`);
      return hasUnassignedAppointment;
    });
    
    console.log('Filtered patient queue:', filteredPatients.length);
    return filteredPatients;
  },

  // Get assigned patients with their appointments
  async getAssignedPatients(): Promise<PatientWithAppointment[]> {
    // Query from appointments to avoid complex foreign ordering/filtering
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .not('doctor_id', 'is', null)
      .order('appointment_date_time', { ascending: true });

    if (error) throw error;

    // Map to PatientWithAppointment shape
    return (data || []).map((apt: any) => {
      const patient = apt.patient as Patient;
      const doctor = apt.doctor as Doctor | undefined;
      return {
        ...patient,
        appointment: {
          id: apt.id,
          patient_id: apt.patient_id,
          doctor_id: apt.doctor_id,
          appointment_date_time: apt.appointment_date_time,
          end_time: apt.end_time,
          status: apt.status,
          notes: apt.notes,
          created_at: apt.created_at,
          updated_at: apt.updated_at
        } as Appointment,
        assignedDoctor: doctor
      } as PatientWithAppointment;
    });
  }
};

// Error handling wrapper
export const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
};
