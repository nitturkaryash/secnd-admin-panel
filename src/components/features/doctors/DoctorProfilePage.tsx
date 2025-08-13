import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { useApiStore } from '../../../store/useApiStore';
import { Doctor } from '../../../lib/api';
import { showToast } from '../../../lib/toast';
import DoctorFormModal from './DoctorFormModal';

const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDoctorById } = useApiStore();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadDoctor(id);
    }
  }, [id]);

  const loadDoctor = async (doctorId: string) => {
    setIsLoading(true);
    try {
      const doctorData = await getDoctorById(doctorId);
      setDoctor(doctorData);
    } catch (error) {
      console.error('Failed to load doctor:', error);
      showToast('Failed to load doctor profile', 'error');
      navigate('/doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDoctor = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveDoctor = async () => {
    setIsEditModalOpen(false);
    if (id) {
      await loadDoctor(id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: colors.background.app
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #E6F0FD',
          borderTop: '5px solid #2766E1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: colors.background.app,
        padding: spacing.lg
      }}>
        <h2 style={{
          fontSize: typography.fontSize.xl,
          color: colors.text.primary,
          marginBottom: spacing.md
        }}>
          Doctor not found
        </h2>
        <button
          onClick={() => navigate('/doctors')}
          style={{
            background: colors.primary.gradient,
            color: colors.text.inverse,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.sm} ${spacing.lg}`,
            fontSize: typography.fontSize.md,
            cursor: 'pointer'
          }}
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  const sectionStyles = {
    background: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border.card}`
  };

  const sectionTitleStyles = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: 0,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottom: `1px solid ${colors.border.card}`
  };

  const infoLabelStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.text.inactive,
    marginBottom: spacing.xs
  };

  const infoValueStyles = {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.md
  };

  return (
    <div style={{
      padding: spacing.lg,
      background: colors.background.app,
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg
        }}>
          <button
            onClick={() => navigate('/doctors')}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border.input}`,
              borderRadius: borderRadius.md,
              padding: `${spacing.xs} ${spacing.md}`,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              cursor: 'pointer',
              color: colors.text.body
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to Doctors
          </button>

          <button
            onClick={handleEditDoctor}
            style={{
              background: colors.primary.gradient,
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.md,
              padding: `${spacing.sm} ${spacing.lg}`,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
            Edit Profile
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: spacing.xl,
          alignItems: 'start'
        }}>
          {/* Left Column - Profile Summary */}
          <div>
            <div style={{
              ...sectionStyles,
              textAlign: 'center',
              padding: `${spacing.xl} ${spacing.lg}`
            }}>
              {doctor.profile_image_url || doctor.avatar ? (
                <img
                  src={doctor.profile_image_url || ''}
                  alt={doctor.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `3px solid ${colors.primary.light}`,
                    margin: `0 auto ${spacing.md}`
                  }}
                />
              ) : (
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: colors.primary.gradient,
                  color: colors.text.inverse,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: typography.fontWeight.bold,
                  margin: `0 auto ${spacing.md}`
                }}>
                  {getInitials(doctor.name)}
                </div>
              )}

              <h1 style={{
                fontSize: typography.fontSize.xxl,
                fontWeight: typography.fontWeight.bold,
                margin: `0 0 ${spacing.xs}`,
                color: colors.text.primary
              }}>
                {doctor.name}
              </h1>

              <div style={{
                fontSize: typography.fontSize.lg,
                color: colors.primary.main,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.md
              }}>
                {doctor.specialty}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                marginBottom: spacing.md
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: doctor.is_available ? '#47CA84' : colors.text.inactive
                }} />
                <span style={{
                  fontSize: typography.fontSize.sm,
                  color: doctor.is_available ? '#47CA84' : colors.text.inactive,
                  fontWeight: typography.fontWeight.medium
                }}>
                  {doctor.is_available ? 'Available for Appointments' : 'Currently Unavailable'}
                </span>
              </div>

              {(doctor.email || doctor.phone) && (
                <div style={{
                  borderTop: `1px solid ${colors.border.card}`,
                  paddingTop: spacing.md,
                  marginTop: spacing.md
                }}>
                  {doctor.email && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                      marginBottom: spacing.sm,
                      justifyContent: 'center'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.text.inactive} viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                      </svg>
                      <span style={{
                        fontSize: typography.fontSize.md,
                        color: colors.text.body
                      }}>
                        {doctor.email}
                      </span>
                    </div>
                  )}
                  
                  {doctor.phone && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                      justifyContent: 'center'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.text.inactive} viewBox="0 0 16 16">
                        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                      </svg>
                      <span style={{
                        fontSize: typography.fontSize.md,
                        color: colors.text.body
                      }}>
                        {doctor.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div>
            {/* Bio Section */}
            {doctor.bio && (
              <div style={sectionStyles}>
                <h2 style={sectionTitleStyles}>About</h2>
                <p style={{
                  fontSize: typography.fontSize.md,
                  color: colors.text.body,
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {doctor.bio}
                </p>
              </div>
            )}

            {/* Education Section */}
            {doctor.education && doctor.education.length > 0 && (
              <div style={sectionStyles}>
                <h2 style={sectionTitleStyles}>Education</h2>
                <ul style={{
                  listStyleType: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {doctor.education.map((edu, index) => (
                    <li key={index} style={{
                      padding: `${spacing.sm} 0`,
                      borderBottom: index < doctor.education.length - 1 ? `1px solid ${colors.border.card}` : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: spacing.md
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: colors.background.icon,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill={colors.primary.main} viewBox="0 0 16 16">
                          <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
                          <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: typography.fontSize.md,
                        color: colors.text.body
                      }}>
                        {edu}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience Section */}
            {doctor.experience && doctor.experience.length > 0 && (
              <div style={sectionStyles}>
                <h2 style={sectionTitleStyles}>Experience</h2>
                <ul style={{
                  listStyleType: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {doctor.experience.map((exp, index) => (
                    <li key={index} style={{
                      padding: `${spacing.sm} 0`,
                      borderBottom: index < doctor.experience.length - 1 ? `1px solid ${colors.border.card}` : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: spacing.md
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: colors.background.icon,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill={colors.primary.main} viewBox="0 0 16 16">
                          <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z"/>
                          <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z"/>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: typography.fontSize.md,
                        color: colors.text.body
                      }}>
                        {exp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Certifications Section */}
            {doctor.certifications && doctor.certifications.length > 0 && (
              <div style={sectionStyles}>
                <h2 style={sectionTitleStyles}>Certifications</h2>
                <ul style={{
                  listStyleType: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing.sm
                }}>
                  {doctor.certifications.map((cert, index) => (
                    <li key={index} style={{
                      background: colors.background.icon,
                      borderRadius: borderRadius.md,
                      padding: `${spacing.xs} ${spacing.md}`,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.body,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill={colors.primary.main} viewBox="0 0 16 16">
                        <path d="M2.5 0A2.5 2.5 0 0 0 0 2.5v11A2.5 2.5 0 0 0 2.5 16h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 13.5 0h-11zm4.7 1.5l.9 3.8 1-.1-.9-3.7h-1zm-.6 5.9v.9h1v-.9h-1zm2.5-2.5l1.2.5.5-.7-1.6-.6-.1.8zm-5 2.5v.9h1v-.9h-1zm-2.4-2.4l.5.7 1.2-.5-.1-.8-1.6.6z"/>
                      </svg>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <DoctorFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveDoctor}
        doctor={doctor}
      />
    </div>
  );
};

export default DoctorProfilePage;
