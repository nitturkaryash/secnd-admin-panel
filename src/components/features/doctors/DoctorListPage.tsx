import React, { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';
import { useApiStore } from '../../../store/useApiStore';
import { Doctor } from '../../../lib/api';
import { showToast } from '../../../lib/toast';
import DoctorCard from './DoctorCard';
import DoctorFormModal from './DoctorFormModal';

const DoctorListPage: React.FC = () => {
  const { doctors, loadDoctors } = useApiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    setIsLoading(true);
    try {
      await loadDoctors();
    } catch (error) {
      console.error('Failed to load doctors:', error);
      showToast('Failed to load doctors', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleSaveDoctor = async () => {
    setIsModalOpen(false);
    await loadDoctorData();
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      padding: spacing.lg,
      background: colors.background.app,
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xl
        }}>
          <h1 style={{
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0
          }}>
            Doctor Management
          </h1>

          <button
            onClick={handleAddDoctor}
            style={{
              background: colors.primary.gradient,
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.lg,
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
              <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/>
            </svg>
            Add New Doctor
          </button>
        </div>

        <div style={{
          background: colors.background.card,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            gap: spacing.md,
            marginBottom: spacing.lg
          }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search doctors by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border.input}`,
                  fontSize: typography.fontSize.md,
                  background: colors.background.input
                }}
              />
            </div>
            <button
              onClick={loadDoctorData}
              style={{
                background: colors.background.input,
                border: `1px solid ${colors.border.input}`,
                borderRadius: borderRadius.md,
                padding: `${spacing.sm} ${spacing.md}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: spacing.xl
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #E6F0FD',
                borderTop: '4px solid #2766E1',
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
          ) : (
            <>
              {filteredDoctors.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: `${spacing.xl} 0`,
                  color: colors.text.inactive
                }}>
                  {searchQuery ? 'No doctors match your search criteria' : 'No doctors found. Add your first doctor!'}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: spacing.lg
                }}>
                  {filteredDoctors.map(doctor => (
                    <DoctorCard 
                      key={doctor.id} 
                      doctor={doctor} 
                      onEdit={() => handleEditDoctor(doctor)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDoctor}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorListPage;
