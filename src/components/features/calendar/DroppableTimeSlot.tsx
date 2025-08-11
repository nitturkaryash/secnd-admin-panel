/**
 * @file A droppable time slot component for the calendar grid.
 */
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Patient } from '../../../lib/mockPatients';
import { DraggablePatientCard } from './DraggablePatientCard';

interface DroppableTimeSlotProps {
  doctorId: string;
  timeKey: string;
  patients: Patient[];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onPatientClick?: (patient: Patient) => void;
}

export const DroppableTimeSlot: React.FC<DroppableTimeSlotProps> = ({
  doctorId,
  timeKey,
  patients,
  className = '',
  style,
  children,
  onPatientClick,
}) => {

  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${doctorId}-${timeKey}`,
    data: {
      doctorId,
      timeKey,
      accepts: ['patient'],
    },
  });

  const baseStyle: React.CSSProperties = {
    minHeight: '60px',
    transition: 'all 0.2s ease',
    ...style,
  };

  const dropStyle: React.CSSProperties = isOver
    ? {
        ...baseStyle,
        backgroundColor: '#E6F0FD',
        borderColor: '#2766E1',
        borderWidth: '2px',
        borderStyle: 'dashed',
      }
    : baseStyle;

  return (
    <div
      ref={setNodeRef}
      className={`relative ${className}`}
      style={dropStyle}
    >
      {/* Render assigned patients */}
      {patients.map((patient) => {
        console.log('🎪 DroppableTimeSlot rendering patient:', patient.name, 'onPatientClick available:', !!onPatientClick);
        return (
          <div key={patient.id} className="mb-1">
            <DraggablePatientCard 
              patient={patient} 
              onClick={onPatientClick} 
            />
          </div>
        );
      })}
      
      {/* Drop zone indicator when dragging over */}
      {isOver && patients.length === 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center text-sm font-medium rounded-[18px] border-2 border-dashed"
          style={{
            color: '#2766E1',
            borderColor: '#2766E1',
            backgroundColor: 'rgba(39, 102, 225, 0.05)',
          }}
        >
          Drop patient here
        </div>
      )}
      
      {children}
    </div>
  );
};