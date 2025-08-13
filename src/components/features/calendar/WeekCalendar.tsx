import React, { useState, useMemo, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { useQueueStore } from '../../../store/useQueueStore';
import { useApiStore } from '../../../store/useApiStore';
import { appointmentsApi } from '../../../lib/api';
import { PatientLegacy } from '../../../lib/types';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import AppointmentEditDrawer from './AppointmentEditDrawer';
import NewAppointmentModal from './NewAppointmentModal';
import { SpanningAppointmentCard } from './SpanningAppointmentCard';

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
  sidebarHidden?: boolean;
  onToggleSidebar?: () => void;
  onToggleSidebarVisibility?: () => void;
  onWeekChange?: (newDate: Date) => void;
}



const WeekCalendar: React.FC<WeekCalendarProps> = ({ 
  selectedWeek: _selectedWeek = new Date(), 
  onEventClick: _onEventClick,
  sidebarCollapsed = false,
  sidebarHidden = false,
  onToggleSidebar,
  onToggleSidebarVisibility,
  onWeekChange
}) => {
  const { patients, assignedPatients, assignPatient, updatePatientAssignment, updatePatient } = useQueueStore();
  

  const [selectedAppointment, setSelectedAppointment] = useState<PatientLegacy | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientLegacy | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  // Highlighting removed - appointments now span visually
  const [visibleSlots, setVisibleSlots] = useState(56); // Start with 56 slots (8 AM to 10 PM, can extend to 11 PM)
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [activePatient, setActivePatient] = useState<PatientLegacy | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ doctorIndex: number; doctorId: string; timeKey: string; spanSlots: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Log when component mounts and appointments change
  useEffect(() => {
    console.log('WeekCalendar mounted or appointments changed');
    console.log('Assigned patients:', assignedPatients.length);
    assignedPatients.forEach(patient => {
      console.log(`Patient: ${patient.name}, Doctor: ${patient.assignedDoctor}, Time: ${patient.appointmentDateTime}`);
    });
  }, [assignedPatients]);

  // Get doctors from API store
  const { doctors: apiDoctors } = useApiStore();
  
  // Map API doctors to the format expected by the component
  const doctors: Doctor[] = useMemo(() => {
    return apiDoctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      avatar: doctor.avatar || doctor.name.split(' ').map(n => n[0]).join('')
    }));
  }, [apiDoctors]);

  // Measured grid metrics for precise snapping
  const [gridMetrics, setGridMetrics] = useState<{
    timeColWidth: number;
    headerHeight: number;
    slotHeight: number;
    doctorColWidth: number;
  }>({ timeColWidth: 0, headerHeight: 0, slotHeight: 60, doctorColWidth: 0 });

  useLayoutEffect(() => {
    const tableEl = tableRef.current;
    if (!tableEl) return;

    const measure = () => {
      const thead = tableEl.querySelector('thead') as HTMLElement | null;
      const timeTh = tableEl.querySelector('thead th:first-child') as HTMLElement | null;
      const firstBodyCell = tableEl.querySelector('tbody tr:first-child td:nth-child(2)') as HTMLElement | null;

      const tableRect = tableEl.getBoundingClientRect();
      const timeColWidth = timeTh ? timeTh.getBoundingClientRect().width : 72;
      const headerHeight = thead ? thead.getBoundingClientRect().height : 40;
      const slotHeight = firstBodyCell ? firstBodyCell.getBoundingClientRect().height : 60;
      const numDoctorCols = Math.max(1, doctors.length);
      const doctorColsTotalWidth = tableRect.width - timeColWidth;
      const doctorColWidth = doctorColsTotalWidth / numDoctorCols;

      setGridMetrics({ timeColWidth, headerHeight, slotHeight, doctorColWidth });
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(tableEl);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [doctors.length]);

  // Helper moved below after extendedTimeSlots is initialized

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


  
  // Helper: compute span info for a patient (depends on extendedTimeSlots)
  const computeSpanForPatient = useCallback((p: PatientLegacy) => {
    const appointmentTime = new Date(p.appointmentDateTime);
    const startHour = appointmentTime.getHours();
    const startMinute = Math.floor(appointmentTime.getMinutes() / 15) * 15;
    const startTimeKey = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    let spanSlots = 1;
    if (p.endTime) {
      const delta = toMinutes(p.endTime) - toMinutes(startTimeKey);
      spanSlots = Math.max(1, Math.ceil(delta / 15));
    }
    const startSlotIndex = extendedTimeSlots.findIndex(s => s.key === startTimeKey);
    return { startTimeKey, spanSlots, startSlotIndex };
  }, [extendedTimeSlots]);

  // Process appointments for spanning display
  const appointmentsWithSpans = useMemo(() => {
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTimeKey = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const getSlotIndex = (timeKey: string): number => {
      return extendedTimeSlots.findIndex(slot => slot.key === timeKey);
    };

    console.log('Processing assigned patients:', assignedPatients.length);
    
    return assignedPatients.map(patient => {
      console.log('Processing patient:', patient.name, 'Appointment time:', patient.appointmentDateTime);
      
      const appointmentTime = new Date(patient.appointmentDateTime);
      const startHour = appointmentTime.getHours();
      const startMinute = Math.floor(appointmentTime.getMinutes() / 15) * 15;
      const startTimeKey = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      
      // Calculate end time
      let endTimeKey = startTimeKey;
      let spanSlots = 1; // Default to 1 slot if no endTime
      
      if (patient.endTime) {
        const startMinutes = timeToMinutes(startTimeKey);
        const endMinutes = timeToMinutes(patient.endTime);
        spanSlots = Math.max(1, Math.ceil((endMinutes - startMinutes) / 15));
        endTimeKey = minutesToTimeKey(startMinutes + (spanSlots - 1) * 15);
      }

      const startSlotIndex = getSlotIndex(startTimeKey);
      
      console.log(`Patient ${patient.name} - Time: ${startTimeKey}, Slot index: ${startSlotIndex}, Visible: ${startSlotIndex >= 0}`);
      
      return {
        ...patient,
        startTimeKey,
        endTimeKey,
        spanSlots,
        startSlotIndex,
        isVisible: startSlotIndex >= 0 && startSlotIndex < extendedTimeSlots.length
      };
    });
  }, [assignedPatients, extendedTimeSlots]);

  // Group appointments by doctor for rendering
  const appointmentsByDoctor = useMemo(() => {
    const grouped: { [key: string]: typeof appointmentsWithSpans } = {};
    
    doctors.forEach(doctor => {
      grouped[doctor.id] = appointmentsWithSpans.filter(
        apt => {
          // Debug the appointment data
          console.log(`Appointment: ${apt.name}, Doctor ID: ${apt.assignedDoctor}, Doctor: ${doctor.id}, isVisible: ${apt.isVisible}`);
          
          // Check if the doctor ID matches - convert to string for safe comparison
          // This is critical because the IDs might be UUIDs from the database
          const doctorMatches = String(apt.assignedDoctor) === String(doctor.id);
          
          return doctorMatches && apt.isVisible;
        }
      );
    });
    
    // Log the grouped appointments for debugging
    Object.keys(grouped).forEach(doctorId => {
      console.log(`Doctor ${doctorId} has ${grouped[doctorId].length} appointments`);
    });
    
    return grouped;
  }, [appointmentsWithSpans, doctors]);



  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: `0 ${spacing.lg}`,
    transition: 'padding 0.3s ease-in-out'
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
    margin: 0
  };

  const timeColumnStyles = {
    ...stickyHeaderStyles,
    background: colors.background.card,
    minWidth: '56px',
    maxWidth: '72px',
    width: '56px',
    fontWeight: typography.fontWeight.medium,
    left: 0,
    zIndex: 30,
                      textAlign: 'center' as const,
                  padding: spacing.xs,
                  fontSize: typography.fontSize.xs,
    verticalAlign: 'middle' as const,
    borderRight: `1px solid ${colors.border.card}`
  };

  const gridCellStyles = {
    padding: spacing.xs,
    minHeight: '40px',
    verticalAlign: 'top' as const,
    background: colors.background.card,
    position: 'relative' as const,
    borderBottom: `1px solid ${colors.border.card}`,
    borderRight: `1px solid ${colors.border.card}`,
    textAlign: 'center' as const,
    margin: 0
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

  const handleEditAppointment = (patient: PatientLegacy) => {
    setEditingPatient(patient);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingPatient(null);
  };

  const handleAppointmentSave = (updatedPatient: PatientLegacy) => {
    // Update the patient in the store
    updatePatient(updatedPatient);
    setIsDrawerOpen(false);
    setEditingPatient(null);
  };
  
  const handleCreateAppointment = async (patientId: string, doctorId: string, dateTime: string, endTime: string) => {
    try {
      console.log('Creating appointment with full dateTime:', dateTime);
      
      // Create a custom implementation that directly uses the appointmentsApi
      const date = new Date(dateTime);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      // Create end time by cloning the date and setting the end time hours/minutes
      const endDateTime = new Date(date);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      console.log('Start time:', date.toISOString());
      console.log('End time:', endDateTime.toISOString());
      
      // Directly use the appointments API to create the appointment
      await appointmentsApi.assignPatient(
        patientId,
        doctorId,
        date.toISOString(),
        endDateTime.toISOString()
      );
      
      // Refresh all data to update the calendar
      await Promise.all([
        useApiStore.getState().loadAppointments(),
        useApiStore.getState().loadPatientQueue(),
        useApiStore.getState().loadAssignedPatients(),
        useQueueStore.getState().refreshData()
      ]);
      
      console.log('New appointment created successfully and data refreshed');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();
    
    let patientId = '';
    if (activeId.startsWith('spanning-patient-')) {
      patientId = activeId.replace('spanning-patient-', '');
    } else if (activeId.startsWith('patient-')) {
      patientId = activeId.replace('patient-', '');
    }
    
    // Find patient in either unassigned or assigned lists
    const patient = patients.find(p => p.id === patientId) || 
                   assignedPatients.find(p => p.id === patientId);
    
    if (patient) {
      setActivePatient(patient);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over) {
      setDragOverTarget(null);
      return;
    }
    const activeId = active.id.toString();
    let patientId = '';
    if (activeId.startsWith('spanning-patient-')) patientId = activeId.replace('spanning-patient-', '');
    else if (activeId.startsWith('patient-')) patientId = activeId.replace('patient-', '');

    const draggingPatient = patients.find(p => p.id === patientId) || assignedPatients.find(p => p.id === patientId);
    if (!draggingPatient) return;

    if (over && typeof over.id === 'string' && over.id.toString().startsWith('slot-')) {
      const [, doctorId, timeKey] = over.id.toString().split('-');
      const doctorIndex = doctors.findIndex(d => d.id === doctorId);
      const { spanSlots } = computeSpanForPatient(draggingPatient);
      setDragOverTarget({ doctorIndex, doctorId, timeKey, spanSlots });
    } else {
      setDragOverTarget(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePatient(null);
    setDragOverTarget(null);

    if (!over) return;

    const activeId = active.id.toString();
    let patientId = '';
    
    if (activeId.startsWith('spanning-patient-')) {
      patientId = activeId.replace('spanning-patient-', '');
    } else if (activeId.startsWith('patient-')) {
      patientId = activeId.replace('patient-', '');
    }

    const dropZoneId = over.id.toString();

    if (dropZoneId.startsWith('slot-')) {
      const [, doctorId, timeKey] = dropZoneId.split('-');
      
      // Check if patient is already assigned
      const isAlreadyAssigned = assignedPatients.some(p => p.id === patientId);
      
      if (isAlreadyAssigned) {
        // Update existing assignment
        updatePatientAssignment(patientId, doctorId, timeKey);
      } else {
        // New assignment from queue
        assignPatient(patientId, doctorId, timeKey);
      }
    }
  };

  // No longer need highlighting - appointments will be rendered as spanning cards

  const renderGridCell = (doctorId: string, timeSlot: any, isLastRow: boolean = false, isLastColumn: boolean = false, isFirstColumn: boolean = false) => {
    let cellStyle;
    if (isLastRow && isLastColumn) {
      cellStyle = lastRowLastColumnCellStyles;
    } else if (isLastRow) {
      cellStyle = lastRowCellStyles;
    } else if (isLastColumn) {
      cellStyle = lastColumnCellStyles;
    } else if (isFirstColumn) {
      cellStyle = {
        ...gridCellStyles,
        borderLeft: 'none'
      };
    } else {
      cellStyle = gridCellStyles;
    }
    
    return (
      <td key={`${doctorId}-${timeSlot.key}`} style={{ ...cellStyle, padding: 0, position: 'relative' }}>
        <DroppableTimeSlot
          doctorId={doctorId}
          timeKey={timeSlot.key}
          patients={[]} // No patients rendered here anymore
          className="h-full"
          style={{ 
            minHeight: '60px',
            padding: 0
          }}
          onPatientClick={() => {}} // No click handling needed
        />
      </td>
    );
  };

  // Render spanning appointments over the grid
  const renderSpanningAppointments = () => {
    const slotHeight = gridMetrics.slotHeight || 60; // Height of each time slot in pixels
    
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {/* Drop target highlight matching span */}
        {dragOverTarget && (
          (() => {
            const timeCol = gridMetrics.timeColWidth || 72;
            const headerH = gridMetrics.headerHeight || 40;
            const doctorColWidth = gridMetrics.doctorColWidth || 100;
            const left = timeCol + dragOverTarget.doctorIndex * doctorColWidth;
            const topIndex = extendedTimeSlots.findIndex(s => s.key === dragOverTarget.timeKey);
            const top = headerH + Math.max(0, topIndex) * slotHeight;
            const height = dragOverTarget.spanSlots * slotHeight;
            return (
              <div
                key="drop-target-highlight"
                className="absolute rounded-[18px] border border-blue-400"
                style={{ left: `${left}px`, top: `${top}px`, width: `${doctorColWidth}px`, height: `${height}px`, background: 'rgba(59,130,246,0.10)', boxShadow: 'inset 0 0 0 2px rgba(59,130,246,0.35)' }}
              />
            );
          })()
        )}
        {doctors.map((doctor, doctorIndex) => {
          const doctorAppointments = appointmentsByDoctor[doctor.id] || [];
          
          return doctorAppointments.map((appointment) => {
            // Hide the original card while it's being dragged to avoid duplicate with DragOverlay
            if (activePatient && activePatient.id === appointment.id) {
              return null;
            }
            // Calculate position based on measured table layout
            const timeCol = gridMetrics.timeColWidth || 72;
            const headerH = gridMetrics.headerHeight || 40;
            const doctorColWidth = gridMetrics.doctorColWidth || 100;
            const leftOffset = timeCol + doctorIndex * doctorColWidth;
            const topOffset = appointment.startSlotIndex * slotHeight + headerH; // Align to exact row top
            
            return (
              <div
                key={`spanning-${appointment.id}`}
                className="absolute pointer-events-auto"
                style={{
                  left: `${leftOffset}px`,
                  top: `${topOffset}px`,
                  width: `${doctorColWidth}px`,
                  zIndex: 10
                }}
              >
                <SpanningAppointmentCard
                  patient={appointment}
                  slotHeight={slotHeight}
                  onClick={handleEditAppointment}
                />
              </div>
            );
          });
        })}
      </div>
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

  const handlePrevWeek = () => {
    if (onWeekChange) {
      const newDate = new Date(_selectedWeek);
      newDate.setDate(newDate.getDate() - 7);
      onWeekChange(newDate);
    }
  };

  const handleNextWeek = () => {
    if (onWeekChange) {
      const newDate = new Date(_selectedWeek);
      newDate.setDate(newDate.getDate() + 7);
      onWeekChange(newDate);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease-in-out'
      }}>
        <div style={headerStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {onToggleSidebarVisibility && (
            <button
              onClick={onToggleSidebarVisibility}
              style={{
                ...toggleButtonStyles,
                background: sidebarHidden ? colors.primary.main : colors.background.card,
                color: sidebarHidden ? colors.text.inverse : colors.primary.main,
                border: `1px solid ${sidebarHidden ? colors.primary.main : colors.border.card}`
              }}
              onMouseEnter={(e) => {
                if (!sidebarHidden) {
                  e.currentTarget.style.background = colors.background.icon;
                  e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(30, 51, 110, 0.07)';
                }
              }}
              onMouseLeave={(e) => {
                if (!sidebarHidden) {
                  e.currentTarget.style.background = colors.background.card;
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(30, 51, 110, 0.04)';
                }
              }}
              title={sidebarHidden ? 'Show Calendar Sidebar' : 'Hide Calendar Sidebar'}
            >
              📅
            </button>
          )}
          {onToggleSidebar && !sidebarHidden && (
            <button
              onClick={onToggleSidebar}
              style={toggleButtonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.background.icon;
                e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(30, 51, 110, 0.07)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.background.card;
                e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(30, 51, 110, 0.04)';
              }}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? '›' : '‹'}
            </button>
          )}
          <h1 style={titleStyles}>Appointment</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <button onClick={handlePrevWeek} style={filterButtonStyles}>‹</button>
            <span style={{ 
              fontSize: typography.fontSize.lg, 
              color: colors.text.primary,
              fontWeight: typography.fontWeight.medium,
              minWidth: '150px',
              textAlign: 'center'
            }}>
              {_selectedWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextWeek} style={filterButtonStyles}>›</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={filterButtonStyles}>None</button>
            <button style={filterButtonStyles}>Priority</button>
            <button style={filterButtonStyles}>Deadline</button>
          </div>
          
          <button 
            onClick={() => setIsNewAppointmentModalOpen(true)}
            style={{
              background: colors.primary.gradient,
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.lg,
              padding: `${spacing.sm} ${spacing.md}`,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Create New Appointment
          </button>
          

        </div>
      </div>
      
      <div style={{ 
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 0 // This is crucial for flex children to shrink properly
      }}>
        <div 
          ref={scrollContainerRef}
          style={{ 
            height: '100%',
            overflow: 'auto',
            position: 'relative',
            paddingBottom: spacing.lg,
            boxSizing: 'border-box'
          }}
        >
                      <table 
                        ref={tableRef}
                        className="calendar-table"
                        style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: sidebarHidden ? '900px' : '800px',
              background: colors.background.card,
              position: 'relative',
              tableLayout: 'fixed',
              borderSpacing: 0,
              marginBottom: spacing.lg
            }}>
                        <thead>
              <tr>
                <th style={timeColumnStyles}>
                  <div style={{ 
                    fontWeight: typography.fontWeight.medium,
                    fontSize: typography.fontSize.xs,
                    textAlign: 'center'
                  }}>
                    Time
                  </div>
                </th>
                {doctors.map((doctor, index) => {
                  const isLastColumn = index === doctors.length - 1;
                  const headerStyle = isLastColumn ? {
                    ...stickyHeaderStyles,
                    borderRight: 'none'
                  } : {
                    ...stickyHeaderStyles,
                    borderRight: `1px solid ${colors.border.card}`
                  };
                  
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
                  padding: spacing.xs
                } : timeColumnStyles;
                
                return (
                  <tr key={timeSlot.key}>
                    <td style={timeCellStyle}>
                      <div style={{
                        textAlign: 'center',
                        width: '100%'
                      }}>
                        {timeSlot.time}
                      </div>
                    </td>
                    {doctors.map((doctor, doctorIndex) => {
                      const isLastColumn = doctorIndex === doctors.length - 1;
                      const isFirstColumn = doctorIndex === 0;
                      return renderGridCell(doctor.id, timeSlot, isLastRow, isLastColumn, isFirstColumn);
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Spanning Appointments Overlay */}
          {renderSpanningAppointments()}
          
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

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null} zIndex={1000}>
        {activePatient ? (
          (() => {
            const { spanSlots } = computeSpanForPatient(activePatient);
            const ghostPatient: any = {
              ...activePatient,
              startTimeKey: '00:00',
              endTime: undefined,
              spanSlots,
              startSlotIndex: 0,
            };
            return (
              <SpanningAppointmentCard
                patient={ghostPatient}
                slotHeight={gridMetrics.slotHeight || 60}
                onClick={() => {}}
                position="static"
                widthPx={gridMetrics.doctorColWidth || undefined}
              />
            );
          })()
        ) : null}
      </DragOverlay>

      {/* Appointment Edit Drawer */}
      <AppointmentEditDrawer
        patient={editingPatient}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onSave={handleAppointmentSave}
      />
      
      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
        onSave={handleCreateAppointment}
      />

      </div>
    </DndContext>
  );
};

export default WeekCalendar; 