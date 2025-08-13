import React, { useState, useEffect, useRef } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Button } from '../../ui';
import { PatientLegacy } from '../../../lib/types';

interface AppointmentEditDrawerProps {
  patient: PatientLegacy | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: PatientLegacy) => void;
}

const AppointmentEditDrawer: React.FC<AppointmentEditDrawerProps> = ({
  patient,
  isOpen,
  onClose,
  onSave
}) => {
  // Debug logging removed for production
  const [editedPatient, setEditedPatient] = useState<PatientLegacy | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patient) {
      setEditedPatient(patient);
      const appointmentDate = new Date(patient.appointmentDateTime);
      setSelectedDate(appointmentDate.toISOString().split('T')[0]);
      
      // Set start time from existing appointment
      const startTime = appointmentDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      setSelectedStartTime(startTime);
      
      // Set default end time (1 hour after start time)
      const endDate = new Date(appointmentDate);
      endDate.setHours(endDate.getHours() + 1);
      const endTime = endDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      setSelectedEndTime(endTime);
    }
  }, [patient]);

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the drawer after animation completes
      const focusTimer = setTimeout(() => {
        if (drawerRef.current) {
          drawerRef.current.focus();
        }
      }, 250); // Match animation duration
      
      return () => {
        clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (editedPatient && selectedDate && selectedStartTime && selectedEndTime) {
      const [hours, minutes] = selectedStartTime.split(':').map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, 0, 0);
      
      const updatedPatient: PatientLegacy = {
        ...editedPatient,
        appointmentDateTime: newDateTime.toISOString(),
        // Store end time as additional property (we'll extend the Patient type later)
        endTime: selectedEndTime
      };
      
      onSave(updatedPatient);
      onClose();
    }
  };

  // Drawer overlay styles
  const overlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden' as const,
    transition: 'opacity 0.2s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
    pointerEvents: isOpen ? 'auto' : 'none' as const,
    willChange: 'opacity',
    backfaceVisibility: 'hidden' as const
  };

  // Drawer container styles
  const drawerStyles = {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    height: '100vh',
    width: '400px',
    background: colors.background.card,
    boxShadow: '-4px 0 16px rgba(30, 51, 110, 0.1)',
    transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
    transition: 'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 10000,
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    perspective: '1000px'
  };

  // Header styles
  const headerStyles = {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.border.card}`,
    background: colors.background.card,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  // Body styles
  const bodyStyles = {
    flex: 1,
    padding: spacing.lg,
    overflowY: 'auto' as const,
    transform: 'translateZ(0)', // Force hardware acceleration
    willChange: 'scroll-position'
  };

  // Footer styles
  const footerStyles = {
    padding: spacing.lg,
    borderTop: `1px solid ${colors.border.card}`,
    background: colors.background.card,
    display: 'flex',
    gap: spacing.md,
    justifyContent: 'flex-end'
  };

  // Form field styles
  const labelStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    display: 'block'
  };

  const inputStyles = {
    width: '100%',
    background: colors.background.input,
    border: `1px solid ${colors.border.input}`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.md,
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const
  };

  // Patient info card styles
  const patientCardStyles = {
    background: colors.background.card,
    border: `1px solid ${colors.border.card}`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    boxShadow: colors.shadow.default
  };

  const avatarStyles = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    marginRight: spacing.md,
    objectFit: 'cover' as const
  };

  const priorityColors = {
    Low: { background: 'rgba(71, 202, 132, 0.10)', color: '#47CA84', border: '1px solid rgba(71, 202, 132, 0.3)' },
    Medium: { background: 'rgba(237, 199, 81, 0.08)', color: '#EDD751', border: '1px solid rgba(237, 199, 81, 0.3)' },
    High: { background: 'rgba(244, 67, 54, 0.06)', color: '#F44336', border: '1px solid rgba(244, 67, 54, 0.3)' },
  };

  const priorityBadgeStyles = (priority: 'Low' | 'Medium' | 'High') => ({
    ...priorityColors[priority],
    borderRadius: borderRadius.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    display: 'inline-block'
  });

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

  const timeSlotStyles = (isSelected: boolean) => ({
    background: isSelected ? colors.primary.gradient : colors.background.input,
    color: isSelected ? colors.text.inverse : colors.text.body,
    border: `1px solid ${isSelected ? 'transparent' : colors.border.input}`,
    borderRadius: borderRadius.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    margin: '2px',
    transition: 'all 0.2s ease-in-out',
    display: 'inline-block'
  });

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyles} onClick={onClose} />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        style={drawerStyles} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div style={headerStyles}>
          <h3 
            id="drawer-title"
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0
            }}
          >
            Edit Appointment
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: colors.text.inactive,
              padding: spacing.xs,
              borderRadius: borderRadius.sm,
              transition: 'color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.inactive;
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyles}>
          {editedPatient && (
            <>
              {/* Patient Info Card */}
              <div style={patientCardStyles}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.sm }}>
                  <img
                    src={editedPatient.avatar}
                    alt={editedPatient.name}
                    style={avatarStyles}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: typography.fontSize.md,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                      marginBottom: spacing.xs
                    }}>
                      {editedPatient.name}
                    </h4>
                    <p style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.body,
                      margin: 0,
                      marginBottom: spacing.xs
                    }}>
                      Age: {editedPatient.age} • {editedPatient.gender || 'Not specified'}
                    </p>
                    <div style={priorityBadgeStyles(editedPatient.priority)}>
                      {editedPatient.priority} Priority
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.body,
                  margin: 0
                }}>
                  <strong>Symptoms:</strong> {editedPatient.symptoms}
                </p>
              </div>

              {/* Date Picker */}
              <label style={labelStyles}>
                Appointment Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={inputStyles}
                title="Select appointment date"
                placeholder="Select appointment date"
              />

              {/* Start Time Picker */}
              <label style={labelStyles}>
                Start Time
              </label>
              <select
                value={selectedStartTime}
                onChange={(e) => {
                  setSelectedStartTime(e.target.value);
                  // Clear end time if it's now invalid
                  if (selectedEndTime && timeToMinutes(e.target.value) >= timeToMinutes(selectedEndTime)) {
                    setSelectedEndTime('');
                  }
                }}
                style={{
                  ...inputStyles,
                  cursor: 'pointer'
                }}
                title="Select start time"
              >
                <option value="">Select start time</option>
                {getAvailableStartTimes().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {/* End Time Picker */}
              <label style={labelStyles}>
                End Time
              </label>
              <select
                value={selectedEndTime}
                onChange={(e) => {
                  setSelectedEndTime(e.target.value);
                  // Clear start time if it's now invalid
                  if (selectedStartTime && timeToMinutes(selectedStartTime) >= timeToMinutes(e.target.value)) {
                    setSelectedStartTime('');
                  }
                }}
                style={{
                  ...inputStyles,
                  cursor: 'pointer'
                }}
                title="Select end time"
                disabled={!selectedStartTime}
              >
                <option value="">Select end time</option>
                {getAvailableEndTimes().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {/* Time Range Preview */}
              {selectedStartTime && selectedEndTime && (
                <div style={{
                  background: colors.background.card,
                  border: `1px solid ${colors.border.card}`,
                  borderRadius: borderRadius.md,
                  padding: spacing.sm,
                  marginBottom: spacing.md,
                  textAlign: 'center'
                }}>
                  <span style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.body,
                    fontWeight: typography.fontWeight.medium
                  }}>
                    Duration: {selectedStartTime} - {selectedEndTime} ({Math.round((timeToMinutes(selectedEndTime) - timeToMinutes(selectedStartTime)) / 15) * 15} minutes)
                  </span>
                </div>
              )}

              {/* Status */}
              <label style={labelStyles}>
                Status
              </label>
              <select
                value={editedPatient.status}
                onChange={(e) => setEditedPatient(prev => 
                  prev ? { ...prev, status: e.target.value as any } : null
                )}
                style={{
                  ...inputStyles,
                  cursor: 'pointer'
                }}
                title="Select appointment status"
              >
                <option value="Booked">Booked</option>
                <option value="Checked-in">Checked-in</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyles}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={!selectedDate || !selectedStartTime || !selectedEndTime}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};

export default AppointmentEditDrawer;
