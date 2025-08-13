import React from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { Doctor } from '../../../lib/api';

interface DoctorCardProps {
  doctor: Doctor;
  onEdit: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onEdit }) => {
  // Generate avatar initials if no avatar image
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getAvailabilityColor = (isAvailable: boolean | null | undefined) => {
    return isAvailable ? '#47CA84' : colors.text.inactive;
  };

  return (
    <div 
      style={{
        background: colors.background.card,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: `1px solid ${colors.border.card}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${spacing.lg} ${spacing.md}`,
        borderBottom: `1px solid ${colors.border.card}`,
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: spacing.sm,
          right: spacing.sm,
          display: 'flex',
          gap: spacing.xs
        }}>
          <button
            onClick={onEdit}
            style={{
              background: colors.background.icon,
              border: 'none',
              borderRadius: borderRadius.sm,
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Edit Doctor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
          </button>
        </div>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: `3px solid ${colors.primary.light}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {(doctor as any).profile_image_url || doctor.avatar ? (
            <img
              src={(doctor as any).profile_image_url || doctor.avatar || ''}
              alt={doctor.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: colors.primary.gradient,
              color: colors.text.inverse,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold
            }}>
              {getInitials(doctor.name)}
            </div>
          )}
        </div>

        <h3 style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          margin: `${spacing.md} 0 ${spacing.xs}`,
          color: colors.text.primary,
          textAlign: 'center'
        }}>
          {doctor.name}
        </h3>

        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.primary.main,
          fontWeight: typography.fontWeight.medium,
          marginBottom: spacing.xs,
          textAlign: 'center'
        }}>
          {doctor.specialty}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          fontSize: typography.fontSize.xs,
          color: colors.text.body
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getAvailabilityColor(doctor.is_available)
          }} />
          {doctor.is_available ? 'Available' : 'Unavailable'}
        </div>
      </div>

      <div style={{
        padding: spacing.md,
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {(doctor as any).bio && (
          <div style={{ marginBottom: spacing.md }}>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.inactive,
              marginBottom: spacing.xs
            }}>
              Bio
            </div>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.body,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4
            }}>
              {(doctor as any).bio}
            </p>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: spacing.xs,
          marginBottom: spacing.sm
        }}>
          {(doctor as any).email && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              padding: `${spacing.xs} 0`
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill={colors.text.inactive} viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
              </svg>
              <span style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.body,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {(doctor as any).email}
              </span>
            </div>
          )}

          {(doctor as any).phone && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              padding: `${spacing.xs} 0`
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill={colors.text.inactive} viewBox="0 0 16 16">
                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
              </svg>
              <span style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.body
              }}>
                {(doctor as any).phone}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{
        padding: spacing.md,
        borderTop: `1px solid ${colors.border.card}`,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={onEdit}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.primary.main}`,
            borderRadius: borderRadius.md,
            padding: `${spacing.xs} ${spacing.md}`,
            color: colors.primary.main,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
