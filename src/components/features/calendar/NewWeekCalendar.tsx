import React, { useState, useMemo, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import CustomAppointment from './CustomAppointment';
import '../../../styles/components/calendar.css';

interface DroppableCellProps {
  id: string;
  children: React.ReactNode;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const cellClasses = `droppable-cell ${isOver ? 'droppable-cell-over' : ''}`;

  return (
    <div ref={setNodeRef} className={cellClasses}>
      {children}
    </div>
  );
};

interface WeekCalendarProps {
  selectedWeek?: Date;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  appointments: any[];
  doctors: any[];
}

const NewWeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedWeek = new Date(),
  sidebarCollapsed = false,
  onToggleSidebar,
  appointments,
  doctors,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const days = useMemo(() => {
    const startOfWeek = new Date(selectedWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [selectedWeek]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 22; hour++) {
        slots.push({hour, minute: 0});
        slots.push({hour, minute: 15});
        slots.push({hour, minute: 30});
        slots.push({hour, minute: 45});
    }
    return slots;
  }, []);

  const getAppointmentsForSlot = (doctor: any, time: {hour: number, minute: number}) => {
    return appointments.filter(apt => {
      if (!apt.assignedDoctor || !apt.startDate) return false;
      const aptDate = new Date(apt.startDate);
      return apt.assignedDoctor === doctor.id &&
             aptDate.getHours() === time.hour &&
             aptDate.getMinutes() === time.minute;
    });
  };

  const headerClasses = `calendar-header ${
    sidebarCollapsed ? 'calendar-header-collapsed' : 'calendar-header-expanded'
  }`;

  /* stylelint-disable */
  const gridStyles: React.CSSProperties = {
    gridTemplateColumns: `60px repeat(${doctors.length}, 1fr)`,
  };
  /* stylelint-enable */

  const dayHeaderClasses = (isToday: boolean) =>
    `day-header ${isToday ? 'day-header-today' : 'day-header-normal'}`;

  /* stylelint-disable */
  const timeIndicatorStyle = (top: number): React.CSSProperties => ({
    top: `${top}px`,
  });
  /* stylelint-enable */

  return (
    <div className="new-week-calendar">
      <header className={headerClasses}>
        <div className="calendar-header-left">
          <button className="toggle-sidebar-button" onClick={onToggleSidebar}>
            {sidebarCollapsed ? '>' : '<'}
          </button>
          <h1 className="calendar-title">This Week</h1>
        </div>
        <div>
          <button className="filter-button">Day</button>
          <button className="filter-button">Week</button>
          <button className="filter-button">Month</button>
        </div>
      </header>
      <div className="calendar-grid" style={gridStyles}>
        <div className="time-label"></div>
        {doctors.map(doc => (
          <div key={doc.id} className={dayHeaderClasses(false)}>{doc.name}</div>
        ))}
        {timeSlots.map((time, index) => (
          <React.Fragment key={`${time.hour}-${time.minute}`}>
            <div className="time-label">
              {time.minute === 0 ? `${time.hour}:00` : ''}
            </div>
            {doctors.map(doctor => {
              const droppableId = `droppable-area_${doctor.id}_${time.hour}:${time.minute}`;
              const appointmentsInSlot = getAppointmentsForSlot(doctor, time);
              return (
                <DroppableCell key={doctor.id} id={droppableId}>
                  {appointmentsInSlot.map(apt => (
                    <CustomAppointment key={apt.id} appointment={apt} />
                  ))}
                </DroppableCell>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default NewWeekCalendar;
