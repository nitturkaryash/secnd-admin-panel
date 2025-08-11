import React, { useState, useMemo, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { useQueueStore } from '../../../store/useQueueStore';
import { Patient, AppointmentStatus } from '../../../lib/mockPatients';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { PatientCard } from './PatientCard';
import AppointmentEditDrawer from './AppointmentEditDrawer';
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
  onToggleSidebar?: () => void;
}



const WeekCalendar: React.FC<WeekCalendarProps> = ({ 
  selectedWeek: _selectedWeek = new Date(), 
  onEventClick: _onEventClick,
  sidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { patients, assignedPatients, assignPatient, updatePatientAssignment, updatePatient } = useQueueStore();
  

  const [selectedAppointment, setSelectedAppointment] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Highlighting removed - appointments now span visually
  const [visibleSlots, setVisibleSlots] = useState(56); // Start with 56 slots (8 AM to 10 PM, can extend to 11 PM)
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ doctorIndex: number; doctorId: string; timeKey: string; spanSlots: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Doctors (static) – declared before any hooks that depend on it
  const doctors: Doctor[] = [
    { id: '1', name: 'Dr. Ahmad Kamal', specialty: 'Cardiologist', avatar: 'AK' },
    { id: '2', name: 'Dr. Sarah Wilson', specialty: 'Pediatrician', avatar: 'SW' },
    { id: '3', name: 'Dr. Michael Chen', specialty: 'Dentist', avatar: 'MC' },
    { id: '4', name: 'Dr. Emily Rodriguez', specialty: 'Neurologist', avatar: 'ER' },
    { id: '5', name: 'Dr. James Thompson', specialty: 'Orthopedist', avatar: 'JT' }
  ];

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

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);



  
  
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
  const computeSpanForPatient = useCallback((p: Patient) => {
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

    return assignedPatients.map(patient => {
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
        apt => apt.assignedDoctor === doctor.id && apt.isVisible
      );
    });
    
    return grouped;
  }, [appointmentsWithSpans, doctors]);



  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: `0 ${sidebarCollapsed ? spacing.xxl : spacing.lg}`
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
      maxWidth: 'calc(100% - 8px)', // Account for margins (2px on each side)
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

  const handleEditAppointment = (patient: Patient) => {
    setEditingPatient(patient);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingPatient(null);
  };

  const handleAppointmentSave = (updatedPatient: Patient) => {
    // Update the patient in the store
    updatePatient(updatedPatient);
    setIsDrawerOpen(false);
    setEditingPatient(null);
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

  const renderAppointmentCard = (patient: Patient) => {
    return (
      <div key={patient.id} className="mb-1">
        <PatientCard patient={patient} />
      </div>
    );
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

  // Check if current time is within clinic hours (8 AM to 10 PM)
  const isCurrentTimeInRange = () => {
    const currentHour = currentTime.getHours();
    return currentHour >= 8 && currentHour < 22; // 8 AM to 10 PM
  };

  // Calculate the position of the "Now Line" based on current time
  const getCurrentTimePosition = () => {
    if (!isCurrentTimeInRange()) return -1;
    
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Calculate total minutes since 8 AM
    const totalMinutesSince8AM = (currentHour - 8) * 60 + currentMinute;
    
    // Calculate position as percentage of total day (8 AM to 10 PM = 14 hours = 840 minutes)
    const totalDayMinutes = 14 * 60; // 14 hours in minutes
    const position = (totalMinutesSince8AM / totalDayMinutes) * 100;
    
    return Math.max(0, Math.min(100, position));
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
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <div style={headerStyles}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onToggleSidebar && (
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
          
          {/* Debug: Test drawer button */}
          <button 
            onClick={() => {
              console.log('🧪 Test button clicked. Assigned patients:', assignedPatients.length);
              if (assignedPatients.length > 0) {
                const testPatient = assignedPatients[0];
                console.log('🧪 Testing with patient:', testPatient.name);
                handleEditAppointment(testPatient);
              } else {
                console.log('❌ No assigned patients found!');
                alert('No assigned patients found. Check console for details.');
              }
            }}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: borderRadius.lg,
              padding: `${spacing.sm} ${spacing.md}`,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              marginLeft: spacing.sm
            }}
          >
            🧪 Test Drawer
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
                      <table 
                        ref={tableRef}
                        className="calendar-table"
                        style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '800px',
              background: colors.background.card,
              position: 'relative',
              tableLayout: 'fixed',
              borderSpacing: 0
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
      

      </div>
    </DndContext>
  );
};

export default WeekCalendar; 