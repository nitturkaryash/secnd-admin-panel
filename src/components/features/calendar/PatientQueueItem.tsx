import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Patient } from '../../../types';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';

interface PatientQueueItemProps {
  patient: Patient;
}

const PatientQueueItem: React.FC<PatientQueueItemProps> = ({ patient }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: patient.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    background: colors.background.card,
    border: `1px solid ${colors.border.card}`,
    borderRadius: borderRadius.md,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.background.icon;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.background.card;
      }}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: colors.primary.main,
        marginRight: spacing.md,
      }} />
      <div style={{
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        flex: 1,
      }}>
        {patient.name}
      </div>
      <div style={{
        fontSize: typography.fontSize.sm,
        color: colors.text.inactive,
        fontWeight: typography.fontWeight.medium,
      }}>
        {patient.age} yrs
      </div>
    </div>
  );
};

export default PatientQueueItem;
