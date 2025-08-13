import React, { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Button } from '../../ui';
import { useApiStore } from '../../../store/useApiStore';
import { PatientLegacy } from '../../../lib/types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientId: string, doctorId: string, dateTime: string, endTime: string) => Promise<void>;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get doctors and patients from API store
  const { doctors, patients } = useApiStore();

  // Set default date to today when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setSelectedDate(today.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setSelectedStartTime('');
      setSelectedEndTime('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId || !selectedDoctorId || !selectedDate || !selectedStartTime || !selectedEndTime) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create appointment date time string
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedStartTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      console.log('Creating appointment with date/time:', appointmentDateTime.toISOString());
      console.log('End time:', selectedEndTime);
      
      await onSave(
        selectedPatientId,
        selectedDoctorId,
        appointmentDateTime.toISOString(),
        selectedEndTime
      );
      
      onClose();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal overlay styles
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
    backdropFilter: 'blur(2px)'
  };

  // Modal content styles
  const modalStyles: React.CSSProperties = {
    background: colors.background.card,
    borderRadius: borderRadius.lg,
    width: '600px',
    maxWidth: '95%',
    maxHeight: '88vh',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.border.card}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  // Body styles
  const bodyStyles: React.CSSProperties = {
    padding: spacing.lg,
    overflowY: 'auto',
    maxHeight: '60vh'
  };

  // Footer styles
  const footerStyles: React.CSSProperties = {
    padding: spacing.lg,
    borderTop: `1px solid ${colors.border.card}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.md
  };

  // Form field styles
  const formGroupStyles = {
    marginBottom: spacing.md
  };

  const labelStyles = {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary
  };

  const inputStyles = {
    width: '100%',
    padding: spacing.sm,
    border: `1px solid ${colors.border.input}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    background: colors.background.input
  };

  const selectStyles = {
    ...inputStyles,
    height: '40px'
  };

  // Time slots
  const startTimeSlots = [
    '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45',
    '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45',
    '17:00', '17:15', '17:30', '17:45',
    '18:00', '18:15', '18:30', '18:45',
    '19:00', '19:15', '19:30', '19:45',
    '20:00', '20:15', '20:30', '20:45',
    '21:00', '21:15', '21:30', '21:45'
  ];

  const endTimeSlots = [
    '08:15', '08:30', '08:45', '09:00',
    '09:15', '09:30', '09:45', '10:00',
    '10:15', '10:30', '10:45', '11:00',
    '11:15', '11:30', '11:45', '12:00',
    '12:15', '12:30', '12:45', '13:00',
    '13:15', '13:30', '13:45', '14:00',
    '14:15', '14:30', '14:45', '15:00',
    '15:15', '15:30', '15:45', '16:00',
    '16:15', '16:30', '16:45', '17:00',
    '17:15', '17:30', '17:45', '18:00',
    '18:15', '18:30', '18:45', '19:00',
    '19:15', '19:30', '19:45', '20:00',
    '20:15', '20:30', '20:45', '21:00',
    '21:15', '21:30', '21:45', '22:00'
  ];

  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Filter available times based on selection
  const getAvailableStartTimes = () => {
    if (!selectedEndTime) return startTimeSlots;
    const endMinutes = timeToMinutes(selectedEndTime);
    return startTimeSlots.filter(time => timeToMinutes(time) < endMinutes);
  };

  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return endTimeSlots;
    const startMinutes = timeToMinutes(selectedStartTime);
    return endTimeSlots.filter(time => timeToMinutes(time) > startMinutes);
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={e => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            margin: 0
          }}>
            Create New Appointment
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: colors.text.inactive,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={bodyStyles}>
            {/* Patient Selection */}
            <div style={formGroupStyles}>
              <label htmlFor="patient" style={labelStyles}>
                Patient *
              </label>
              <select
                id="patient"
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                style={selectStyles}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.age} yrs)
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Selection */}
            <div style={formGroupStyles}>
              <label htmlFor="doctor" style={labelStyles}>
                Doctor *
              </label>
              <select
                id="doctor"
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                style={selectStyles}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div style={formGroupStyles}>
              <label htmlFor="date" style={labelStyles}>
                Date *
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={inputStyles}
                required
              />
            </div>

            {/* Time Selection - Start and End */}
            <div style={{ display: 'flex', gap: spacing.md }}>
              <div style={{ ...formGroupStyles, flex: 1 }}>
                <label htmlFor="startTime" style={labelStyles}>
                  Start Time *
                </label>
                <select
                  id="startTime"
                  value={selectedStartTime}
                  onChange={e => {
                    setSelectedStartTime(e.target.value);
                    // Clear end time if it's now invalid
                    if (selectedEndTime && timeToMinutes(e.target.value) >= timeToMinutes(selectedEndTime)) {
                      setSelectedEndTime('');
                    }
                  }}
                  style={selectStyles}
                  required
                >
                  <option value="">Select</option>
                  {getAvailableStartTimes().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div style={{ ...formGroupStyles, flex: 1 }}>
                <label htmlFor="endTime" style={labelStyles}>
                  End Time *
                </label>
                <select
                  id="endTime"
                  value={selectedEndTime}
                  onChange={e => setSelectedEndTime(e.target.value)}
                  style={selectStyles}
                  required
                  disabled={!selectedStartTime}
                >
                  <option value="">Select</option>
                  {getAvailableEndTimes().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration Display */}
            {selectedStartTime && selectedEndTime && (
              <div style={{
                background: colors.background.icon,
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                marginTop: spacing.xs,
                fontSize: typography.fontSize.sm,
                color: colors.text.body,
                textAlign: 'center'
              }}>
                Duration: {Math.round((timeToMinutes(selectedEndTime) - timeToMinutes(selectedStartTime)) / 15) * 15} minutes
              </div>
            )}
          </div>

          <div style={footerStyles}>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting || !selectedPatientId || !selectedDoctorId || !selectedDate || !selectedStartTime || !selectedEndTime}
            >
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
