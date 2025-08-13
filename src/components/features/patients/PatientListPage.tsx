import React, { useEffect, useState } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Card } from '../../ui';
import { useQueueStore } from '../../../store/useQueueStore';
import { useApiStore } from '../../../store/useApiStore';
import type { AppointmentStatus, PatientLegacy } from '../../../lib/types';

interface PatientListPageProps {
  onBackToDashboard?: () => void;
}

const PatientListPage: React.FC<PatientListPageProps> = ({ onBackToDashboard }) => {
  const { patients, refreshData, isLoading } = useQueueStore();
  const { doctors } = useApiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AppointmentStatus>('all');

  
  console.log('PatientListPage render - patients:', patients.length, 'doctors:', doctors.length);

  // Load doctors and patients on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const apiStore = useApiStore.getState();
        await apiStore.loadDoctors();
        await apiStore.loadPatientQueue();
        await apiStore.loadAssignedPatients();
        await refreshData();
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [refreshData]);

  const tableHeaderStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    padding: `${spacing.sm} ${spacing.md}`,
    textAlign: 'left' as const,
    borderBottom: `2px solid ${colors.border.card}`
  };

  const tableCellStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.text.body,
    padding: `${spacing.sm} ${spacing.md}`,
    borderBottom: `1px solid ${colors.border.card}`
  };

  const selectStyles = {
    fontSize: typography.fontSize.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.input}`,
    background: colors.background.input,
    color: colors.text.primary,
    cursor: 'pointer'
  };

  const getStatusChipStyles = (status: AppointmentStatus) => {
    const statusColors: Record<AppointmentStatus, { background: string; color: string }> = {
      pending: { background: '#FFF3E0', color: '#FF9800' },
      confirmed: { background: '#E8F0FF', color: '#2767E1' },
      Booked: { background: '#E8F0FF', color: '#2767E1' },
      'Checked-in': { background: '#FFF3E0', color: '#FF9800' },
      completed: { background: '#E8F5E9', color: '#4CAF50' },
      cancelled: { background: '#FFEBEE', color: '#F44336' }
    };
    return {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      padding: `${spacing.xs} ${spacing.sm}`,
      borderRadius: borderRadius.md,
      ...statusColors[status]
    };
  };

  const actionButtonStyles = {
    fontSize: typography.fontSize.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and search patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.serialNo?.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDoctorChange = async (patientId: string, doctorId: string) => {
    if (!doctorId) return; // ignore placeholder option
    
    console.log('Assigning doctor', doctorId, 'to patient', patientId);
    
    try {
      const apiStore = useApiStore.getState();
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        console.error('Patient not found:', patientId);
        return;
      }

      // Calculate a default time slot (next available hour)
      const now = new Date();
      const timeKey = `${(now.getHours() + 1).toString().padStart(2, '0')}:00`;
      console.log('Using time key:', timeKey);

      // If an appointment already exists for this patient, update it instead of creating a new one
      const existingAppointment = apiStore.appointments.find(apt => apt.patient_id === patientId);
      if (existingAppointment) {
        console.log('Updating existing appointment');
        await apiStore.updatePatientAssignment(patientId, doctorId, timeKey);
      } else {
        console.log('Creating new appointment');
        await apiStore.assignPatient(patientId, doctorId, timeKey);
      }

      await refreshData();
      console.log('Doctor assignment completed successfully');
    } catch (error) {
      console.error('Failed to assign doctor:', error);
    }
  };

  const handleStatusChange = async (patientId: string, status: AppointmentStatus) => {
    console.log('Updating status for patient', patientId, 'to', status);
    
    try {
      const apiStore = useApiStore.getState();
      const { appointments } = apiStore;
      const appointment = appointments.find(apt => apt.patient_id === patientId);
      
      if (appointment) {
        console.log('Found appointment:', appointment.id);
        await apiStore.updateAppointmentStatus(appointment.id, status);
        await refreshData();
        console.log('Status update completed successfully');
      } else {
        console.log('No appointment found for patient:', patientId);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleEditPatient = (patientId: string) => {
    // TODO: Implement edit modal/form
    console.log(`Editing patient ${patientId}`);
    alert('Edit functionality not yet implemented');
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      console.log('Deleting patient:', patientId);
      try {
        await useApiStore.getState().deletePatient(patientId);
        await refreshData();
        console.log('Patient deleted successfully');
      } catch (error) {
        console.error('Failed to delete patient:', error);
      }
    }
  };

  const handleReschedulePatient = (patientId: string) => {
    // TODO: Implement reschedule modal
    console.log(`Rescheduling patient ${patientId}`);
    alert('Reschedule functionality not yet implemented');
  };

  return (
    <div style={{ padding: spacing.lg }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.lg }}>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.primary.main,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              marginRight: spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs
            }}
          >
            ← Back to Dashboard
          </button>
        )}
        <h1 style={{
          fontSize: typography.fontSize.xxxl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0
        }}>
          Patient Queue
        </h1>
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        gap: spacing.md,
        marginBottom: spacing.lg,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search patients by name, symptoms, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.sm,
              border: `1px solid ${colors.border.input}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.md,
              color: colors.text.primary,
              background: colors.background.input
            }}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | AppointmentStatus)}
          style={{
            ...selectStyles,
            minWidth: '150px'
          }}
        >
          <option value="all">All Statuses</option>
          <option value="Booked">Booked</option>
          <option value="Checked-in">Checked-in</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.inactive,
          whiteSpace: 'nowrap'
        }}>
          {filteredPatients.length} of {patients.length} patients
        </div>
      </div>
      
      <Card padding="lg">
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xl,
            color: colors.text.inactive
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #E6F0FD',
              borderTop: '3px solid #2766E1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: spacing.sm
            }} />
            Loading patients...
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyles}>Serial No.</th>
                  <th style={tableHeaderStyles}>Patient Name</th>
                  <th style={tableHeaderStyles}>Age</th>
                  <th style={tableHeaderStyles}>Gender</th>
                  <th style={tableHeaderStyles}>Assigned Doctor</th>
                  <th style={tableHeaderStyles}>Appointment Date & Time</th>
                  <th style={tableHeaderStyles}>Status</th>
                  <th style={tableHeaderStyles}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td style={tableCellStyles}>{patient.serialNo}</td>
                    <td style={tableCellStyles}>{patient.name}</td>
                    <td style={tableCellStyles}>{patient.age} yrs</td>
                    <td style={tableCellStyles}>{patient.gender || '—'}</td>
                    <td style={tableCellStyles}>
                      <select
                        value={patient.assignedDoctor || ''}
                        onChange={(e) => handleDoctorChange(patient.id, e.target.value)}
                        style={selectStyles}
                        aria-label={`Assign doctor for ${patient.name}`}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tableCellStyles}>{formatDateTime(patient.appointmentDateTime)}</td>
                    <td style={tableCellStyles}>
                      <select
                        value={patient.status}
                        onChange={(e) => handleStatusChange(patient.id, e.target.value as AppointmentStatus)}
                        style={{
                          ...selectStyles,
                          ...getStatusChipStyles(patient.status),
                          border: 'none',
                          background: 'transparent'
                        }}
                        aria-label={`Change status for ${patient.name}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="Booked">Booked</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={tableCellStyles}>
                      <div style={{ display: 'flex', gap: spacing.xs }}>
                        <button 
                          onClick={() => handleEditPatient(patient.id)}
                          style={actionButtonStyles}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleReschedulePatient(patient.id)}
                          style={{...actionButtonStyles, color: '#FF9800'}}
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient.id)}
                          style={{...actionButtonStyles, color: '#F44336'}}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: spacing.xl,
            color: colors.text.inactive,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing.md
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill={colors.text.inactive} viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
            </svg>
            <div style={{ fontSize: typography.fontSize.md }}>
              {searchTerm || filterStatus !== 'all' 
                ? `No patients match your search criteria` 
                : 'No patients found'
              }
            </div>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                style={{
                  background: colors.primary.main,
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  padding: `${spacing.sm} ${spacing.md}`,
                  fontSize: typography.fontSize.sm,
                  cursor: 'pointer'
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientListPage;