import React, { useEffect, useState } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Card } from '../../ui';
import { useQueueStore } from '../../../store/useQueueStore';
import { useApiStore } from '../../../store/useApiStore';
import { DraggablePatientCard } from './DraggablePatientCard';
import { DndContext } from '@dnd-kit/core';

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
  const [viewedDate, setViewedDate] = useState(selectedDate);

  useEffect(() => {
    setViewedDate(selectedDate);
  }, [selectedDate]);

  // Sync viewedDate when selectedDate changes from external source
  useEffect(() => {
    if (selectedDate.getMonth() !== viewedDate.getMonth() || 
        selectedDate.getFullYear() !== viewedDate.getFullYear()) {
      setViewedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate, viewedDate]);
  
  const currentMonth = viewedDate.getMonth();
  const currentYear = viewedDate.getFullYear();

  const handlePrevMonth = () => {
    setViewedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get unassigned patients from the queue store
  const { patients: unassignedPatients, loadData, isLoading } = useQueueStore();
  useApiStore();

  // Load patient data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);
  
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

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const dayStyles = (date: Date) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    border: 'none',
    background: isSelected(date) ? colors.primary.main : 'transparent',
    color: isSelected(date) 
      ? colors.text.inverse 
      : isCurrentMonth(date) 
        ? colors.text.primary 
        : colors.text.inactive,
    transition: 'all 0.2s ease-in-out'
  });

  const calendarHeaderStyles = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    margin: 0
  };

  const calendarGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    marginBottom: spacing.lg,
    justifyItems: 'center',
    alignItems: 'center'
  };

  return (
    <DndContext>
      <div 
        className="sidebar-responsive"
        style={{ 
          width: '320px', 
          marginRight: spacing.lg, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: spacing.xl
        }}
      >
      <Card 
        padding="lg" 
        style={{ 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: borderRadius.xl
        }}
      >
        <div>
          <h3 style={{ ...calendarHeaderStyles, textAlign: 'center', marginBottom: spacing.md }}>
            Appointment Calendar
          </h3>
        
        <div style={{ ...calendarHeaderStyles, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
          <button 
            onClick={handlePrevMonth} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: colors.text.primary, padding: '0 5px' }}
            aria-label="Previous month"
          >
            ‹
          </button>
          <span style={{ fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.md }}>
            {viewedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={handleNextMonth} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: colors.text.primary, padding: '0 5px' }}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        
        <div style={{...calendarGridStyles, gap: '4px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} style={{
              textAlign: 'center',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.inactive,
              paddingBottom: spacing.sm
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
            ...calendarHeaderStyles,
            textAlign: 'left'
          }}>
            Patient Queue
          </h3>
        </div>
        
        <div>
          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing.xl
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid #E6F0FD',
                borderTop: '3px solid #2766E1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : unassignedPatients.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.sm
            }}>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.inactive,
                marginBottom: spacing.xs,
                padding: `0 ${spacing.sm}`
              }}>
                {unassignedPatients.length} patient{unassignedPatients.length !== 1 ? 's' : ''} waiting
              </div>
              {unassignedPatients.map((patient) => (
                <div key={patient.id}>
                  <DraggablePatientCard patient={patient} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.inactive,
              fontStyle: 'italic',
              padding: spacing.lg,
              textAlign: 'center' as const,
              background: colors.background.icon,
              border: `1px solid ${colors.border.card}`,
              borderRadius: borderRadius.md,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing.sm
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={colors.text.inactive} viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
              </svg>
              <div>No patients in queue</div>
              <div style={{ fontSize: typography.fontSize.xs }}>
                Patients will appear here when they check in
              </div>
            </div>
          )}
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
    </DndContext>
  );
};

export default CalendarSidebar; 