import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { PatientLegacy } from '../../../lib/types';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';

interface SpanningAppointmentCardProps {
  patient: PatientLegacy & {
    startTimeKey: string;
    endTimeKey: string;
    spanSlots: number;
    startSlotIndex: number;
  };
  slotHeight: number; // Height of each time slot in pixels
  onClick?: (patient: PatientLegacy) => void;
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

  const handleClick = () => {
    if (isDragging) return;
    if (onClick) {
      onClick(patient);
    }
  };

  // Calculate card height based on span
  const cardHeight = patient.spanSlots * slotHeight;
  
  // Status colors
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, { bg: string; border: string; text: string }> = {
      'Booked': { bg: 'rgba(140, 116, 250, 0.1)', border: '#8c74fa', text: '#5b21b6' },
      'Checked-in': { bg: 'rgba(237, 199, 81, 0.15)', border: '#edc751', text: '#92400e' },
      'Completed': { bg: 'rgba(71, 202, 132, 0.15)', border: '#47ca84', text: '#065f46' },
      'Cancelled': { bg: 'rgba(244, 67, 54, 0.1)', border: '#f44336', text: '#b91c1c' },
    };
    return statusColors[status] || statusColors['Booked'];
  };

  const statusStyle = getStatusColor(patient.status);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        height: `${cardHeight}px`,
        width: widthPx ? `${widthPx}px` : undefined,
        background: colors.background.card,
        border: `1px solid ${colors.border.card}`,
        borderLeft: `4px solid ${statusStyle.border}`,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        overflow: 'hidden',
        boxShadow: isDragging
          ? '0 8px 25px rgba(0, 0, 0, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        position: position,
        margin: position === 'absolute' ? spacing.xs : 0,
        transition: 'all 0.2s ease-in-out'
      }}
      title={`${patient.name} - ${patient.startTimeKey} to ${patient.endTime || 'End'}`}
    >
      {/* Drag handle - invisible overlay for dragging only */}
      <div
        {...listeners}
        {...attributes}
        style={{ 
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          borderRadius: borderRadius.lg,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        title="Drag to reschedule"
      />
      
      {/* Clickable content area */}
      <div 
        onClick={handleClick}
        style={{ 
          position: 'relative',
          zIndex: 2,
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with patient info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.xs }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            overflow: 'hidden',
            marginRight: spacing.sm,
            flexShrink: 0
          }}>
            {patient.avatar ? (
              <img 
                src={patient.avatar} 
                alt={patient.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: colors.primary.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.text.inverse,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold
              }}>
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {patient.name}
            </div>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.body,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {patient.startTimeKey} - {patient.endTime || 'End'}
            </div>
          </div>
          
          <div style={{
            background: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
            borderRadius: borderRadius.sm,
            padding: `2px ${spacing.xs}`,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
            flexShrink: 0
          }}>
            {patient.status}
          </div>
        </div>
        
        {/* Symptoms (if space allows) */}
        {cardHeight > 80 && patient.symptoms && (
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.body,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: Math.max(1, Math.floor((cardHeight - 60) / 16)),
            WebkitBoxOrient: 'vertical'
          }}>
            {patient.symptoms}
          </div>
        )}

        {/* Priority badge (if space allows) */}
        {cardHeight > 100 && (
          <div style={{
            marginTop: 'auto',
            paddingTop: spacing.xs
          }}>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.inactive,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs
            }}>
              <span>Priority:</span>
              <span style={{
                color: patient.priority === 'High' ? '#dc2626' : 
                      patient.priority === 'Medium' ? '#d97706' : '#2563eb',
                fontWeight: typography.fontWeight.medium
              }}>
                {patient.priority}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit button overlay */}
      {onClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClick(patient);
          }}
          style={{
            position: 'absolute',
            top: spacing.xs,
            right: spacing.xs,
            width: '24px',
            height: '24px',
            background: colors.primary.main,
            color: colors.text.inverse,
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            zIndex: 100,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
          title="Edit appointment"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>
        </button>
      )}
    </div>
  );
};
