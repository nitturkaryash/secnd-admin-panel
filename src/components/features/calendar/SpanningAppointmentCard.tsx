import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Patient } from '../../../lib/mockPatients';

interface SpanningAppointmentCardProps {
  patient: Patient & {
    startTimeKey: string;
    endTimeKey: string;
    spanSlots: number;
    startSlotIndex: number;
  };
  slotHeight: number; // Height of each time slot in pixels
  onClick?: (patient: Patient) => void;
  position?: 'absolute' | 'static';
  widthPx?: number;
}

export const SpanningAppointmentCard: React.FC<SpanningAppointmentCardProps> = ({ 
  patient, 
  slotHeight,
  onClick,
  position = 'absolute',
  widthPx
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `spanning-patient-${patient.id}`,
    data: { patient },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    if (onClick) {
      onClick(patient);
    }
  };

  // Calculate card height based on span
  const cardHeight = patient.spanSlots * slotHeight;

  const wrapperClass = position === 'absolute'
    ? 'absolute inset-x-1 transition-all duration-200 hover:shadow-md'
    : 'relative w-full transition-all duration-200 hover:shadow-md';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        height: `${cardHeight}px`,
        width: widthPx ? `${widthPx}px` : undefined,
        background: '#FFFFFF',
        borderColor: '#E0E3EB',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '18px',
        padding: '16px',
        overflow: 'visible',
        boxShadow: isDragging
          ? '0px 6px 32px 0px rgba(41, 44, 61, 0.15), 0px 2px 8px 0px rgba(41, 44, 61, 0.20)'
          : '0px 4px 24px 0px rgba(41, 44, 61, 0.10), 0px 1.5px 4px 0px rgba(41, 44, 61, 0.15)',
      }}
      className={wrapperClass}
      title={`${patient.name} - ${patient.startTimeKey} to ${patient.endTime || 'End'}`}
    >
      {/* Drag handle - invisible overlay for dragging only */}
      <div
        {...listeners}
        {...attributes}
        className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ 
          zIndex: 1,
          borderRadius: '18px'
        }}
        title="Drag to reschedule"
      />
      
      {/* Clickable content area */}
      <div 
        onClick={handleClick}
        className="relative cursor-pointer"
        style={{ zIndex: 2 }}
      >
        {/* Main content - exactly matching original PatientCard layout */}
        <div className="flex items-center">
          <img 
            src={patient.avatar} 
            alt={patient.name} 
            className="w-10 h-10 rounded-full mr-3 flex-shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <p 
              className="font-semibold text-sm truncate"
              style={{ color: '#222C47' }}
            >
              {patient.name}
            </p>
            <p 
              className="text-xs truncate"
              style={{ color: '#5E6A81' }}
            >
              {patient.startTimeKey} - {patient.endTime || 'End'}
            </p>
          </div>
          <span
            className={`
              text-xs font-medium px-2 py-1 rounded-full border flex-shrink-0
              ${patient.priority === 'Low' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
              ${patient.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
              ${patient.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : ''}
            `}
          >
            {patient.priority}
          </span>
        </div>
        <p 
          className="text-xs mt-2 line-clamp-2"
          style={{ color: '#5E6A81' }}
        >
          {patient.symptoms}
        </p>
      </div>

      {/* Edit button overlay - highest z-index for reliable clicking */}
      {onClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClick(patient);
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
          style={{ 
            fontSize: '10px',
            zIndex: 100,
            fontWeight: 'bold',
            boxShadow: '0px 2px 8px 0px rgba(41, 44, 61, 0.12)'
          }}
          title="Edit appointment"
        >
          ✏️
        </button>
      )}
    </div>
  );
};
