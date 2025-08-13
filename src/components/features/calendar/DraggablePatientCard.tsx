import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { PatientCard } from './PatientCard';
import { PatientLegacy } from '../../../lib/types';

interface DraggablePatientCardProps {
  patient: PatientLegacy;
  onClick?: (patient: PatientLegacy) => void;
}

export const DraggablePatientCard: React.FC<DraggablePatientCardProps> = ({ patient, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `patient-${patient.id}`,
    data: { patient },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  // Simple click handler that works with drag
  const handleClick = (e: React.MouseEvent) => {
    // Don't handle clicks while dragging
    if (isDragging) return;
    
    console.log('🎯 Card/Button clicked for patient:', patient.name);
    if (onClick) {
      onClick(patient);
    }
  };

  console.log('🎯 DraggablePatientCard rendering:', patient.name, 'onClick available:', !!onClick);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      {/* Patient Card - clickable when not dragging */}
      <div 
        className={`${isDragging ? 'cursor-grabbing' : 'cursor-pointer'} transition-all`}
        onClick={handleClick}
        title={isDragging ? 'Dragging...' : 'Click to edit appointment'}
      >
        <PatientCard patient={patient} isDragging={isDragging} />
      </div>
      
      {/* Drag Handle - invisible overlay for dragging */}
      <div 
        {...listeners}
        {...attributes}
        className="absolute inset-0 cursor-grab active:cursor-grabbing opacity-0"
        style={{ 
          pointerEvents: 'auto',
          zIndex: 10
        }}
        title="Drag to reschedule"
      />
      
      {/* Edit button - redundant but visible indicator */}
      {onClick && (
        <button
          onClick={handleClick}
          className="absolute top-1 right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-90 hover:opacity-100 transition-all duration-200 shadow-lg"
          style={{ 
            fontSize: '12px',
            zIndex: 20
          }}
          title="Edit appointment"
        >
          ✏️
        </button>
      )}
      
      {/* Debug indicator for cards without onClick */}
      {!onClick && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center" style={{ zIndex: 20 }}>
          !
        </div>
      )}
    </div>
  );
};
