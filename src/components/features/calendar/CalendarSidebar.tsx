import React from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Card } from '../../ui';

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  time: string;
  avatar: string;
  isAvailable: boolean;
  patients: Patient[];
}

interface CalendarSidebarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onPatientQueueClick?: () => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ 
  selectedDate = new Date(), 
  onDateSelect,
  onPatientQueueClick
}) => {
  const today = selectedDate || new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Mock doctor data with patients
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Ahmad Kamal',
      specialty: 'Cardiologist',
      time: '10:00 - 11:00',
      avatar: 'AK',
      isAvailable: true,
      patients: [
        { id: '1', name: 'John Smith', age: 45, phone: '+1-555-0123' },
        { id: '2', name: 'Maria Garcia', age: 52, phone: '+1-555-0124' },
        { id: '3', name: 'Robert Johnson', age: 38, phone: '+1-555-0125' }
      ]
    },
    {
      id: '2',
      name: 'Dr. Sarah Wilson',
      specialty: 'Pediatrician',
      time: '14:00 - 15:00',
      avatar: 'SW',
      isAvailable: true,
      patients: [
        { id: '4', name: 'Emma Davis', age: 8, phone: '+1-555-0126' },
        { id: '5', name: 'Lucas Brown', age: 12, phone: '+1-555-0127' }
      ]
    },
    {
      id: '3',
      name: 'Dr. Michael Chen',
      specialty: 'Dentist',
      time: '16:00 - 17:00',
      avatar: 'MC',
      isAvailable: false,
      patients: []
    }
  ];

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const calendarHeaderStyles = {
    textAlign: 'center' as const,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md
  };

  const calendarGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: spacing.xs,
    marginBottom: spacing.lg
  };

  const dayStyles = (date: Date) => ({
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    border: 'none',
    background: isToday(date) ? colors.primary.main : 'transparent',
    color: isToday(date) 
      ? colors.text.inverse 
      : isCurrentMonth(date) 
        ? colors.text.primary 
        : colors.text.inactive,
    transition: 'all 0.2s ease-in-out'
  });

  const doctorItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      background: colors.background.icon
    }
  };

  const avatarStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: colors.primary.gradient,
    color: colors.text.inverse,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold
  };

  const statusDotStyles = (isAvailable: boolean) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: isAvailable ? '#47CA84' : colors.text.inactive,
    marginLeft: 'auto'
  });

  return (
    <div style={{ width: '300px', marginRight: spacing.lg, display: 'flex', flexDirection: 'column', gap: '50px' }}>
      <Card padding="lg">
        <h3 style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          marginBottom: spacing.lg,
          margin: 0
        }}>
          Appointment Calendar
        </h3>
        
        <div style={calendarHeaderStyles}>
          {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        
        <div style={calendarGridStyles}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} style={{
              textAlign: 'center',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.body,
              paddingBottom: spacing.xs
            }}>
              {day}
            </div>
          ))}
          
          {getDaysInMonth().map((date, index) => (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              style={dayStyles(date)}
            >
              {date.getDate()}
            </button>
          ))}
        </div>
      </Card>
      
      <Card padding="lg">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg
        }}>
          <h3 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0
          }}>
            Patient Queue
          </h3>
        </div>
        
        <div>
          {(() => {
            // Collect all patients from all doctors
            const allPatients = doctors.flatMap(doctor => doctor.patients);
            
            if (allPatients.length > 0) {
              return allPatients.map((patient) => (
                <div key={patient.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: spacing.sm,
                  marginBottom: spacing.sm,
                  background: colors.background.card,
                  border: `1px solid ${colors.border.card}`,
                  borderRadius: borderRadius.md,
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.background.icon;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.background.card;
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.primary.main,
                    marginRight: spacing.md
                  }} />
                  <div style={{
                    fontSize: typography.fontSize.md,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    flex: 1
                  }}>
                    {patient.name}
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.inactive,
                    fontWeight: typography.fontWeight.medium
                  }}>
                    {patient.age} yrs
                  </div>
                </div>
              ));
            } else {
              return (
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.inactive,
                  fontStyle: 'italic',
                  padding: spacing.md,
                  textAlign: 'center' as const,
                  background: colors.background.card,
                  border: `1px solid ${colors.border.card}`,
                  borderRadius: borderRadius.md
                }}>
                  No patients booked yet
                </div>
              );
            }
          })()}
        </div>
        
        <button 
          onClick={() => {
            console.log('See All button clicked');
            if (onPatientQueueClick) {
              onPatientQueueClick();
            }
          }}
          style={{
            width: '100%',
            background: colors.primary.gradient,
            color: colors.text.inverse,
            border: 'none',
            borderRadius: borderRadius.lg,
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            marginTop: spacing.md,
            transition: 'all 0.2s ease-in-out'
          }}
        >
          See All
        </button>
      </Card>
    </div>
  );
};

export default CalendarSidebar; 