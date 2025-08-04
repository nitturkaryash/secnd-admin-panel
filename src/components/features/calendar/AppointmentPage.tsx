import React, { useState } from 'react';
import { colors, spacing } from '../../../styles/theme';
import CalendarSidebar from './CalendarSidebar';
import WeekCalendar from './WeekCalendar';
import EditScheduleModal from './EditScheduleModal';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: number;
  type: string;
  description?: string;
  guests?: string[];
}

const AppointmentPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleEventSave = (event: CalendarEvent) => {
    // Handle event save logic here
    console.log('Saving event:', event);
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const pageStyles = {
    background: colors.background.app,
    minHeight: '100vh',
    padding: spacing.lg
  };

  const contentStyles = {
    display: 'flex',
    gap: spacing.lg,
    maxWidth: '1400px',
    margin: '0 auto'
  };

  return (
    <div style={pageStyles}>
      <div style={contentStyles}>
        <CalendarSidebar 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        
        <WeekCalendar 
          selectedWeek={selectedDate}
          onEventClick={handleEventClick}
        />
      </div>
      
      <EditScheduleModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleEventSave}
      />
    </div>
  );
};

export default AppointmentPage; 