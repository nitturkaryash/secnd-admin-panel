import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { useQueueStore } from '../../../store/useQueueStore';
import { Patient, AppointmentStatus } from '../../../lib/mockPatients';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: number; // in hours
  type: 'checkHealth' | 'checkUpKid' | 'heartCheckUp' | 'physicalControl' | 'bodyCondition' | 'checkTeeth' | 'checkUp';
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
}

interface WeekCalendarProps {
  selectedWeek?: Date;
  onEventClick: (event: CalendarEvent) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}



const WeekCalendar: React.FC<WeekCalendarProps> = ({ 
  selectedWeek: _selectedWeek = new Date(), 
  onEventClick: _onEventClick,
  sidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { patients } = useQueueStore();
  const [selectedAppointment, setSelectedAppointment] = useState<Patient | null>(null);
  const [visibleSlots, setVisibleSlots] = useState(56); // Start with 56 slots (8 AM to 10 PM, can extend to 11 PM)
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate the maximum number of slots (8 AM to 11 PM = 15 hours = 60 slots)
  const maxSlots = 60; // 15 hours * 4 slots per hour



  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && !hasReachedEnd) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      
      // Load more slots when user scrolls near the bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setVisibleSlots(prev => {
          const newSlots = prev + 28; // Add 7 more hours (28 slots)
          
          // Check if we've reached the maximum slots (11 PM)
          if (newSlots >= maxSlots) {
            setHasReachedEnd(true);
            return maxSlots;
          }
          
          return newSlots;
        });
      }
    }
  }, [hasReachedEnd, maxSlots]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const doctors: Doctor[] = [
    { id: '1', name: 'Dr. Ahmad Kamal', specialty: 'Cardiologist', avatar: 'AK' },
    { id: '2', name: 'Dr. Sarah Wilson', specialty: 'Pediatrician', avatar: 'SW' },
    { id: '3', name: 'Dr. Michael Chen', specialty: 'Dentist', avatar: 'MC' },
    { id: '4', name: 'Dr. Emily Rodriguez', specialty: 'Neurologist', avatar: 'ER' },
    { id: '5', name: 'Dr. James Thompson', specialty: 'Orthopedist', avatar: 'JT' }
  ];
  
  // Generate extended time slots for infinite scroll (limited to 11 PM)
  const generateExtendedTimeSlots = (count: number) => {
    const slots = [];
    const startHour = 8; // 8 AM
    const totalHours = Math.ceil(count / 4); // 4 slots per hour
    
    for (let hour = startHour; hour < startHour + totalHours && hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        
        const timeString = time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
        
        slots.push({
          time: timeString,
          hour: hour,
          minute: minute,
          key: `${hour}:${minute.toString().padStart(2, '0')}`,
          timestamp: time.getTime()
        });
      }
    }
    return slots.slice(0, count);
  };

  const extendedTimeSlots = useMemo(() => generateExtendedTimeSlots(visibleSlots), [visibleSlots]);

  // Group patients by doctor and time
  const patientsByDoctorAndTime = useMemo(() => {
    const grouped: { [key: string]: { [timeKey: string]: Patient[] } } = {};
    
    doctors.forEach(doctor => {
      grouped[doctor.id] = {};
      extendedTimeSlots.forEach(slot => {
        grouped[doctor.id][slot.key] = [];
      });
    });
    
    patients.forEach(patient => {
      const appointmentTime = new Date(patient.appointmentDateTime);
      const hour = appointmentTime.getHours();
      const minute = Math.floor(appointmentTime.getMinutes() / 15) * 15; // Round to nearest 15-minute slot
      const timeKey = `${hour}:${minute.toString().padStart(2, '0')}`;
      
      if (grouped[patient.assignedDoctor] && grouped[patient.assignedDoctor][timeKey]) {
        grouped[patient.assignedDoctor][timeKey].push(patient);
      }
    });
    
    return grouped;
  }, [patients, extendedTimeSlots, doctors]);



  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: `0 ${sidebarCollapsed ? spacing.xl : spacing.lg}`
  };

  const toggleButtonStyles = {
    background: colors.background.card,
    border: `1px solid ${colors.border.card}`,
    borderRadius: borderRadius.sm,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 rgba(30, 51, 110, 0.04)',
    transition: 'all 0.2s ease-in-out',
    color: colors.primary.main,
    fontSize: '16px',
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.sm
  };

  const titleStyles = {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    margin: 0
  };

  const stickyHeaderStyles = {
    background: colors.background.card,
    padding: `${spacing.md} ${spacing.sm}`,
    textAlign: 'center' as const,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    minWidth: '150px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: `1px solid ${colors.border.card}`,
    borderRight: `1px solid ${colors.border.card}`
  };

  const timeColumnStyles = {
    ...stickyHeaderStyles,
    background: colors.background.input,
    minWidth: '56px',
    maxWidth: '72px',
    width: '56px',
    fontWeight: typography.fontWeight.medium,
    left: 0,
    zIndex: 30,
    borderRight: `2px solid ${colors.border.card}`, // Thicker border for time column
    textAlign: 'left' as const,
    padding: `${spacing.md} ${spacing.xs}`,
    fontSize: typography.fontSize.xs
  };

  const gridCellStyles = {
    padding: spacing.xs,
    minHeight: '40px',
    verticalAlign: 'top' as const,
    background: colors.background.card,
    position: 'relative' as const,
    borderBottom: `1px solid ${colors.border.card}`,
    borderRight: `1px solid ${colors.border.card}`,
    textAlign: 'center' as const
  };

  const lastRowCellStyles = {
    ...gridCellStyles,
    borderBottom: `2px solid ${colors.border.card}` // Thicker border for last row
  };

  const lastColumnCellStyles = {
    ...gridCellStyles,
    borderRight: 'none' // Remove right border for last column
  };

  const lastRowLastColumnCellStyles = {
    ...lastRowCellStyles,
    borderRight: 'none' // Remove right border for last column in last row
  };

  const appointmentCardStyles = (status: AppointmentStatus) => {
    const statusColors = {
      Booked: { background: 'rgba(140, 116, 250, 0.06)', border: '1px solid rgba(140, 116, 250, 0.2)' },
      'Checked-in': { background: 'rgba(237, 199, 81, 0.08)', border: '1px solid rgba(237, 199, 81, 0.2)' },
      Completed: { background: 'rgba(71, 202, 132, 0.10)', border: '1px solid rgba(71, 202, 132, 0.2)' },
      Cancelled: { background: 'rgba(244, 67, 54, 0.06)', border: '1px solid rgba(244, 67, 54, 0.2)' }
    };
    
    return {
      background: statusColors[status].background,
      border: statusColors[status].border,
      borderRadius: borderRadius.sm,
      padding: '4px 8px', // Slightly more horizontal padding
      margin: '2px', // Slightly more margin for better spacing
      fontSize: '10px',
      color: colors.text.primary,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      maxWidth: 'calc(100% - 4px)', // Account for margins
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    };
  };



  const modalStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalContentStyles = {
    background: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
  };

  const filterButtonStyles = {
    background: colors.background.input,
    border: `1px solid ${colors.border.input}`,
    borderRadius: borderRadius.lg,
    padding: `${spacing.xs} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
    color: colors.text.body,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    marginLeft: spacing.sm
  };

  const handleAppointmentClick = (patient: Patient) => {
    setSelectedAppointment(patient);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  const renderAppointmentCard = (patient: Patient) => (
    <div
      key={patient.id}
      style={appointmentCardStyles(patient.status)}
      onClick={() => handleAppointmentClick(patient)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      title={`${patient.name} - ${patient.status}`}
    >
      <div style={{ fontWeight: typography.fontWeight.medium, marginBottom: '1px' }}>
        {patient.name}
      </div>
      <div style={{ fontSize: '8px', color: colors.text.body }}>
        {patient.age} yrs • {patient.status}
      </div>
    </div>
  );

  const renderGridCell = (doctorId: string, timeSlot: any, isLastRow: boolean = false, isLastColumn: boolean = false) => {
    const patientsForSlot = patientsByDoctorAndTime[doctorId]?.[timeSlot.key] || [];
    
    let cellStyle;
    if (isLastRow && isLastColumn) {
      cellStyle = lastRowLastColumnCellStyles;
    } else if (isLastRow) {
      cellStyle = lastRowCellStyles;
    } else if (isLastColumn) {
      cellStyle = lastColumnCellStyles;
    } else {
      cellStyle = gridCellStyles;
    }
    
    return (
      <td key={`${doctorId}-${timeSlot.key}`} style={cellStyle}>
        {patientsForSlot.map(patient => renderAppointmentCard(patient))}
      </td>
    );
  };



  // End of day message styles
  const endOfDayMessageStyles = {
    background: colors.background.input,
    border: `1px solid ${colors.border.card}`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    margin: `${spacing.md} ${spacing.lg}`,
    textAlign: 'center' as const,
    color: colors.text.body,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Appointment</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <span style={{ 
            fontSize: typography.fontSize.lg, 
            color: colors.text.primary,
            fontWeight: typography.fontWeight.medium 
          }}>
            August 2024
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={filterButtonStyles}>None</button>
            <button style={filterButtonStyles}>Priority</button>
            <button style={filterButtonStyles}>Deadline</button>
          </div>
          
          <button style={{
            background: colors.primary.gradient,
            color: colors.text.inverse,
            border: 'none',
            borderRadius: borderRadius.lg,
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}>
            Check new
          </button>
        </div>
      </div>
      
      <div style={{ 
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div 
          ref={scrollContainerRef}
          style={{ 
            height: '100%',
            overflow: 'auto',
            position: 'relative'
          }}
        >
                      <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '800px',
              background: colors.background.card,
              position: 'relative',
              tableLayout: 'fixed'
            }}>
                        <thead>
              <tr>
                <th style={timeColumnStyles}>
                  <div style={{ 
                    fontWeight: typography.fontWeight.medium,
                    fontSize: typography.fontSize.xs,
                    textAlign: 'left'
                  }}>
                    Time
                  </div>
                </th>
                {doctors.map((doctor, index) => {
                  const isLastColumn = index === doctors.length - 1;
                  const headerStyle = isLastColumn ? {
                    ...stickyHeaderStyles,
                    borderRight: 'none'
                  } : stickyHeaderStyles;
                  
                  return (
                    <th key={doctor.id} style={headerStyle}>
                      <div style={{ fontWeight: typography.fontWeight.semibold }}>
                        {doctor.name}
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.xs, 
                        color: colors.text.body,
                        fontWeight: typography.fontWeight.normal
                      }}>
                        {doctor.specialty}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {extendedTimeSlots.map((timeSlot, index) => {
                const isLastRow = index === extendedTimeSlots.length - 1;
                const timeCellStyle = isLastRow ? {
                  ...lastRowCellStyles,
                  ...timeColumnStyles,
                  textAlign: 'left' as const,
                  padding: `${spacing.xs} ${spacing.xs}`,
                  fontSize: typography.fontSize.xs,
                  minWidth: '56px',
                  maxWidth: '72px',
                  width: '56px'
                } : timeColumnStyles;
                
                return (
                  <tr key={timeSlot.key}>
                    <td style={timeCellStyle}>
                      {timeSlot.time}
                    </td>
                    {doctors.map((doctor, doctorIndex) => {
                      const isLastColumn = doctorIndex === doctors.length - 1;
                      return renderGridCell(doctor.id, timeSlot, isLastRow, isLastColumn);
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* End of Day Message */}
          {hasReachedEnd && (
            <div style={endOfDayMessageStyles}>
              End of day reached. No more appointments after 11:00 PM.
            </div>
          )}
          

        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div style={modalStyles} onClick={closeModal}>
          <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <h2 style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0
              }}>
                Appointment Details
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: typography.fontSize.lg,
                  cursor: 'pointer',
                  color: colors.text.inactive
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: spacing.md }}>
              <div style={{ marginBottom: spacing.sm }}>
                <strong>Patient:</strong> {selectedAppointment.name}
              </div>
              <div style={{ marginBottom: spacing.sm }}>
                <strong>Age:</strong> {selectedAppointment.age} years
              </div>
              <div style={{ marginBottom: spacing.sm }}>
                <strong>Gender:</strong> {selectedAppointment.gender || 'Not specified'}
              </div>
              <div style={{ marginBottom: spacing.sm }}>
                <strong>Appointment Time:</strong> {selectedAppointment.appointmentDateTime}
              </div>
              <div style={{ marginBottom: spacing.sm }}>
                <strong>Status:</strong> {selectedAppointment.status}
                          </div>
              <div style={{ marginBottom: spacing.sm }}>
                <strong>Assigned Doctor:</strong> {doctors.find(d => d.id === selectedAppointment.assignedDoctor)?.name}
                          </div>
                        </div>
            
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <button style={{
                background: colors.primary.gradient,
                color: colors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.sm,
                padding: `${spacing.sm} ${spacing.md}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer'
              }}>
                Edit Appointment
              </button>
              <button style={{
                background: colors.background.input,
                color: colors.text.primary,
                border: `1px solid ${colors.border.input}`,
                borderRadius: borderRadius.sm,
                padding: `${spacing.sm} ${spacing.md}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer'
              }}>
                Reschedule
              </button>
                      </div>
                  </div>
        </div>
      )}
    </div>
  );
};

export default WeekCalendar; 