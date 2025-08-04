import React, { useState } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Button } from '../../ui';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: number;
  type: string;
  description?: string;
  guests?: string[];
}

interface EditScheduleModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave
}) => {
  const [editedEvent, setEditedEvent] = useState<CalendarEvent | null>(event);

  if (!isOpen || !event) return null;

  const modalOverlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyles = {
    background: colors.background.card,
    borderRadius: borderRadius.lg,
    boxShadow: colors.shadow.hover,
    width: '400px',
    maxHeight: '80vh',
    overflow: 'auto'
  };

  const headerStyles = {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.border.card}`
  };

  const bodyStyles = {
    padding: spacing.lg
  };

  const footerStyles = {
    padding: spacing.lg,
    borderTop: `1px solid ${colors.border.card}`,
    display: 'flex',
    gap: spacing.md,
    justifyContent: 'flex-end'
  };

  const labelStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    display: 'block'
  };

  const inputStyles = {
    width: '100%',
    background: colors.background.input,
    border: `1px solid ${colors.border.input}`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.md,
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out',
    fontFamily: 'inherit'
  };

  const textareaStyles = {
    ...inputStyles,
    minHeight: '80px',
    resize: 'vertical' as const
  };

  const chipStyles = {
    background: colors.secondary.light,
    color: colors.secondary.main,
    border: 'none',
    borderRadius: borderRadius.lg,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    margin: `0 ${spacing.xs} ${spacing.xs} 0`,
    transition: 'all 0.2s ease-in-out'
  };

  const avatarStyles = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: colors.primary.gradient,
    color: colors.text.inverse,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    margin: `0 ${spacing.xs} ${spacing.xs} 0`
  };

  const tagStyles = {
    background: colors.calendar.checkHealth,
    border: '2px solid #8C74FA',
    borderRadius: borderRadius.md,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    display: 'inline-block',
    marginBottom: spacing.md
  };

  const timeOptions = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ];

  const guestAvatars = ['JD', 'MS', 'AK', 'SW'];

  const handleSave = () => {
    if (editedEvent) {
      onSave(editedEvent);
      onClose();
    }
  };

  return (
    <div style={modalOverlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <h3 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0
          }}>
            Edit Schedule
          </h3>
        </div>

        <div style={bodyStyles}>
          <div style={tagStyles}>
            {event.title}
          </div>

          <label style={labelStyles}>
            Event Title
          </label>
          <input
            type="text"
            value={editedEvent?.title || ''}
            onChange={(e) => setEditedEvent(prev => 
              prev ? { ...prev, title: e.target.value } : null
            )}
            style={inputStyles}
            placeholder="Enter event title"
          />

          <label style={labelStyles}>
            Description
          </label>
          <textarea
            value={editedEvent?.description || ''}
            onChange={(e) => setEditedEvent(prev => 
              prev ? { ...prev, description: e.target.value } : null
            )}
            style={textareaStyles}
            placeholder="Add description..."
          />

          <label style={labelStyles}>
            Time Range
          </label>
          <div style={{ marginBottom: spacing.lg }}>
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => setEditedEvent(prev => 
                  prev ? { ...prev, time } : null
                )}
                style={{
                  ...chipStyles,
                  background: editedEvent?.time === time 
                    ? colors.primary.gradient 
                    : colors.secondary.light,
                  color: editedEvent?.time === time 
                    ? colors.text.inverse 
                    : colors.secondary.main
                }}
              >
                {time}
              </button>
            ))}
          </div>

          <label style={labelStyles}>
            Guests
          </label>
          <div style={{ marginBottom: spacing.lg }}>
            {guestAvatars.map((avatar) => (
              <div key={avatar} style={avatarStyles}>
                {avatar}
              </div>
            ))}
          </div>
        </div>

        <div style={footerStyles}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal; 