import React, { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { useApiStore } from '../../../store/useApiStore';
import { Doctor } from '../../../lib/api';
import { showToast } from '../../../lib/toast';

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  doctor: Doctor | null;
}

interface FormData {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  is_available: boolean;
  profile_image_url: string;
  education: string[];
  experience: string[];
  certifications: string[];
}

interface FormErrors {
  name?: string;
  specialty?: string;
  email?: string;
  phone?: string;
}

const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  doctor
}) => {
  const { createDoctor, updateDoctor } = useApiStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEducation, setCurrentEducation] = useState('');
  const [currentExperience, setCurrentExperience] = useState('');
  const [currentCertification, setCurrentCertification] = useState('');

  const initialFormData: FormData = {
    name: '',
    specialty: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    is_available: true,
    profile_image_url: '',
    education: [],
    experience: [],
    certifications: []
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (doctor) {
      const d: any = doctor as any;
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        email: d.email || '',
        phone: d.phone || '',
        bio: d.bio || '',
        avatar: doctor.avatar || '',
        is_available: doctor.is_available !== false, // default to true if undefined
        profile_image_url: d.profile_image_url || '',
        education: d.education || [],
        experience: d.experience || [],
        certifications: d.certifications || []
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [doctor, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.specialty.trim()) {
      newErrors.specialty = 'Specialty is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddEducation = () => {
    if (currentEducation.trim()) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, currentEducation.trim()]
      }));
      setCurrentEducation('');
    }
  };

  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperience = () => {
    if (currentExperience.trim()) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, currentExperience.trim()]
      }));
      setCurrentExperience('');
    }
  };

  const handleRemoveExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddCertification = () => {
    if (currentCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, currentCertification.trim()]
      }));
      setCurrentCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (doctor) {
        await updateDoctor(doctor.id, formData);
        showToast('Doctor updated successfully');
      } else {
        await createDoctor(formData);
        showToast('Doctor created successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save doctor:', error);
      showToast('Failed to save doctor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const overlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(2px)',
    padding: spacing.lg
  };

  const modalStyles = {
    background: colors.background.card,
    borderRadius: borderRadius.lg,
    width: '900px',
    maxWidth: '98%',
    maxHeight: '88vh',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden'
  };

  const headerStyles = {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.border.card}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky' as const,
    top: 0,
    background: colors.background.card,
    zIndex: 5
  };

  const bodyStyles = {
    padding: spacing.lg,
    overflowY: 'auto' as const,
    maxHeight: '64vh'
  };

  const footerStyles = {
    padding: spacing.lg,
    borderTop: `1px solid ${colors.border.card}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.md,
    position: 'sticky' as const,
    bottom: 0,
    background: colors.background.card,
    zIndex: 5
  };

  const formGroupStyles = {
    marginBottom: spacing.md
  };

  const labelStyles = {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary
  };

  const inputStyles = {
    width: '100%',
    padding: spacing.sm,
    border: `1px solid ${colors.border.input}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    background: colors.background.input
  };

  const errorStyles = {
    color: '#f44336',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs
  };

  const chipStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    background: colors.background.icon,
    borderRadius: borderRadius.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    margin: `0 ${spacing.xs} ${spacing.xs} 0`,
    fontSize: typography.fontSize.sm
  };

  // Live preview helpers
  const initials = (formData.name || 'Dr').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={e => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            margin: 0
          }}>
            {doctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: colors.text.inactive,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={bodyStyles}>
            {/* Live Profile Preview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 1fr',
              gap: spacing.lg,
              alignItems: 'center',
              border: `1px solid ${colors.border.card}`,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.lg,
              background: colors.background.card
            }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: colors.primary.gradient,
                color: colors.text.inverse,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                overflow: 'hidden'
              }}>
                {formData.profile_image_url ? (
                  <img src={formData.profile_image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.xs
                }}>{formData.name || 'Doctor Name'}</div>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.primary.main
                }}>{formData.specialty || 'Specialty'}</div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: spacing.md
              }}>
                <div style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.inactive
                }}>Email
                  <div style={{ color: colors.text.body, fontSize: typography.fontSize.sm }}>{formData.email || '-'}</div>
                </div>
                <div style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.inactive
                }}>Phone
                  <div style={{ color: colors.text.body, fontSize: typography.fontSize.sm }}>{formData.phone || '-'}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              {/* Basic Information */}
              <div style={formGroupStyles}>
                <label htmlFor="name" style={labelStyles}>
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyles,
                    borderColor: errors.name ? '#f44336' : colors.border.input
                  }}
                  required
                />
                {errors.name && <div style={errorStyles}>{errors.name}</div>}
              </div>

              <div style={formGroupStyles}>
                <label htmlFor="specialty" style={labelStyles}>
                  Specialty *
                </label>
                <input
                  id="specialty"
                  name="specialty"
                  type="text"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyles,
                    borderColor: errors.specialty ? '#f44336' : colors.border.input
                  }}
                  required
                />
                {errors.specialty && <div style={errorStyles}>{errors.specialty}</div>}
              </div>

              <div style={formGroupStyles}>
                <label htmlFor="email" style={labelStyles}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyles,
                    borderColor: errors.email ? '#f44336' : colors.border.input
                  }}
                />
                {errors.email && <div style={errorStyles}>{errors.email}</div>}
              </div>

              <div style={formGroupStyles}>
                <label htmlFor="phone" style={labelStyles}>
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyles,
                    borderColor: errors.phone ? '#f44336' : colors.border.input
                  }}
                />
                {errors.phone && <div style={errorStyles}>{errors.phone}</div>}
              </div>
            </div>

            <div style={formGroupStyles}>
              <label htmlFor="bio" style={labelStyles}>
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                style={{
                  ...inputStyles,
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div style={formGroupStyles}>
                <label htmlFor="avatar" style={labelStyles}>
                  Avatar Text (Initials)
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="text"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  style={inputStyles}
                  maxLength={4}
                />
              </div>

              <div style={formGroupStyles}>
                <label htmlFor="profile_image_url" style={labelStyles}>
                  Profile Image URL
                </label>
                <input
                  id="profile_image_url"
                  name="profile_image_url"
                  type="text"
                  value={formData.profile_image_url}
                  onChange={handleInputChange}
                  style={inputStyles}
                />
              </div>
            </div>

            <div style={formGroupStyles}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm
              }}>
                <input
                  id="is_available"
                  name="is_available"
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="is_available" style={{
                  fontSize: typography.fontSize.md,
                  color: colors.text.primary,
                  cursor: 'pointer'
                }}>
                  Available for Appointments
                </label>
              </div>
            </div>

            {/* Education Section */}
            <div style={{ ...formGroupStyles, marginTop: spacing.lg }}>
              <h3 style={{
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm
              }}>
                Education
              </h3>
              
              <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.sm }}>
                <input
                  type="text"
                  value={currentEducation}
                  onChange={(e) => setCurrentEducation(e.target.value)}
                  placeholder="Add education (e.g., MD from Harvard Medical School, 2010)"
                  style={{
                    ...inputStyles,
                    flex: 1
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddEducation}
                  style={{
                    background: colors.primary.main,
                    color: colors.text.inverse,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    padding: `0 ${spacing.md}`,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div>
                {formData.education.map((edu, index) => (
                  <div key={index} style={chipStyles}>
                    {edu}
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: spacing.xs,
                        color: colors.text.inactive,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Section */}
            <div style={formGroupStyles}>
              <h3 style={{
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm
              }}>
                Experience
              </h3>
              
              <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.sm }}>
                <input
                  type="text"
                  value={currentExperience}
                  onChange={(e) => setCurrentExperience(e.target.value)}
                  placeholder="Add experience (e.g., Chief Surgeon at Mayo Clinic, 2015-2020)"
                  style={{
                    ...inputStyles,
                    flex: 1
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddExperience}
                  style={{
                    background: colors.primary.main,
                    color: colors.text.inverse,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    padding: `0 ${spacing.md}`,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div>
                {formData.experience.map((exp, index) => (
                  <div key={index} style={chipStyles}>
                    {exp}
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: spacing.xs,
                        color: colors.text.inactive,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Section */}
            <div style={formGroupStyles}>
              <h3 style={{
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm
              }}>
                Certifications
              </h3>
              
              <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.sm }}>
                <input
                  type="text"
                  value={currentCertification}
                  onChange={(e) => setCurrentCertification(e.target.value)}
                  placeholder="Add certification (e.g., Board Certified in Cardiology)"
                  style={{
                    ...inputStyles,
                    flex: 1
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCertification}
                  style={{
                    background: colors.primary.main,
                    color: colors.text.inverse,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    padding: `0 ${spacing.md}`,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div>
                {formData.certifications.map((cert, index) => (
                  <div key={index} style={chipStyles}>
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: spacing.xs,
                        color: colors.text.inactive,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={footerStyles}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: colors.background.input,
                border: `1px solid ${colors.border.input}`,
                borderRadius: borderRadius.md,
                padding: `${spacing.sm} ${spacing.lg}`,
                fontSize: typography.fontSize.md,
                color: colors.text.body,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: colors.primary.gradient,
                color: colors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.md,
                padding: `${spacing.sm} ${spacing.lg}`,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.medium,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Saving...' : doctor ? 'Update Doctor' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorFormModal;
