import React, { useState } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Card } from '../../ui';
import { useQueueStore } from '../../../store/useQueueStore';
import { Patient, Gender, AppointmentStatus } from '../../../lib/mockPatients';

interface Doctor {
  id: string;
  name: string;
}

const doctors: Doctor[] = [
  { id: '1', name: 'Dr. Ahmad Kamal' },
  { id: '2', name: 'Dr. Sarah Wilson' },
  { id: '3', name: 'Dr. Michael Chen' },
  { id: '4', name: 'Dr. Emily Rodriguez' },
  { id: '5', name: 'Dr. David Thompson' },
];

interface PatientListPageProps {
  onBackToDashboard?: () => void;
}

const PatientListPage: React.FC<PatientListPageProps> = ({ onBackToDashboard }) => {
  const { patients } = useQueueStore();
  const [editingPatient, setEditingPatient] = useState<string | null>(null);

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
    const statusColors = {
      Booked: { background: '#E8F0FF', color: '#2767E1' },
      'Checked-in': { background: '#FFF3E0', color: '#FF9800' },
      Completed: { background: '#E8F5E9', color: '#4CAF50' },
      Cancelled: { background: '#FFEBEE', color: '#F44336' }
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

  const handleDoctorChange = (patientId: string, doctorId: string) => {
    // TODO: Implement actual data update
    console.log(`Updating patient ${patientId} to doctor ${doctorId}`);
  };

  const handleStatusChange = (patientId: string, status: AppointmentStatus) => {
    // TODO: Implement actual data update
    console.log(`Updating patient ${patientId} status to ${status}`);
  };

  const handleEditPatient = (patientId: string) => {
    setEditingPatient(patientId);
    // TODO: Implement edit functionality
    console.log(`Editing patient ${patientId}`);
  };

  const handleDeletePatient = (patientId: string) => {
    // TODO: Implement delete functionality
    console.log(`Deleting patient ${patientId}`);
  };

  const handleReschedulePatient = (patientId: string) => {
    // TODO: Implement reschedule functionality
    console.log(`Rescheduling patient ${patientId}`);
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
      
      <Card padding="lg">
        {patients.length > 0 ? (
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
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td style={tableCellStyles}>{patient.serialNo}</td>
                    <td style={tableCellStyles}>{patient.name}</td>
                    <td style={tableCellStyles}>{patient.age} yrs</td>
                    <td style={tableCellStyles}>{patient.gender || '—'}</td>
                    <td style={tableCellStyles}>
                      <select
                        value={patient.assignedDoctor}
                        onChange={(e) => handleDoctorChange(patient.id, e.target.value)}
                        style={selectStyles}
                        aria-label={`Assign doctor for ${patient.name}`}
                      >
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tableCellStyles}>{patient.appointmentDateTime}</td>
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
                        <option value="Booked">Booked</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
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
          <div style={{ textAlign: 'center', padding: spacing.lg, color: colors.text.inactive }}>
            No patients booked yet.
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientListPage;