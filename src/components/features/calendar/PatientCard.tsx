
/**
 * @file A patient card component following the design system.
 */
import React from 'react';
import { PatientLegacy } from '../../../lib/types';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';

interface PatientCardProps {
  patient: PatientLegacy;
  isDragging?: boolean;
  onClick?: (patient: PatientLegacy) => void;
}

const priorityColors = {
  Low: { background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '#93c5fd' },
  Medium: { background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '#fbbf24' },
  High: { background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '#fca5a5' },
};

export function PatientCard({ patient, isDragging = false, onClick }: PatientCardProps) {
  const handleCardClick = () => {
    if (onClick && !isDragging) {
      console.log('PatientCard clicked:', patient.name);
      onClick(patient);
    }
  };

  const priorityStyle = priorityColors[patient.priority];
  const requestedTime = new Date(patient.requestedTime || patient.appointmentDateTime);

  return (
    <div
      style={{
        background: colors.background.card,
        border: `1px solid ${colors.border.card}`,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        boxShadow: isDragging 
          ? '0 8px 25px rgba(0, 0, 0, 0.15)' 
          : '0 2px 8px rgba(0, 0, 0, 0.05)',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        opacity: isDragging ? 0.9 : 1,
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.xs }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          marginRight: spacing.sm,
          flexShrink: 0,
          border: `2px solid ${colors.border.card}`
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
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold
            }}>
              {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: typography.fontSize.md,
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
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: '2px'
          }}>
            <span>{patient.age} yrs</span>
            <span>•</span>
            <span>{patient.gender}</span>
            <span>•</span>
            <span>#{patient.serialNo}</span>
          </div>
        </div>
        
        <div style={{
          background: priorityStyle.background,
          color: priorityStyle.color,
          border: `1px solid ${priorityStyle.border}`,
          borderRadius: borderRadius.sm,
          padding: `${spacing.xs} ${spacing.sm}`,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          flexShrink: 0
        }}>
          {patient.priority}
        </div>
      </div>
      
      <div style={{
        fontSize: typography.fontSize.xs,
        color: colors.text.inactive,
        marginBottom: spacing.xs
      }}>
        Requested: {requestedTime.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}
      </div>
      
      {patient.symptoms && (
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.body,
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {patient.symptoms}
        </div>
      )}
    </div>
  );
}
