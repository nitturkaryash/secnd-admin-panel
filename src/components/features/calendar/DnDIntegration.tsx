/**
 * @file Integration component to connect PatientQueue with Calendar DnD
 */
import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { PatientQueue } from './PatientQueue';
import { PatientCard } from './PatientCard';
import { useQueueStore } from '../../../store/useQueueStore';
import { Patient } from '../../../lib/mockPatients';

interface DnDIntegrationProps {
  children: React.ReactNode;
}

export const DnDIntegration: React.FC<DnDIntegrationProps> = ({ children }) => {
  const { patients, assignedPatients, assignPatient, updatePatientAssignment } = useQueueStore();
  const [activePatient, setActivePatient] = React.useState<Patient | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const patientId = active.id.toString().replace('patient-', '');
    
    // Find patient in either unassigned or assigned lists
    const patient = patients.find(p => p.id === patientId) || 
                   assignedPatients.find(p => p.id === patientId);
    
    if (patient) {
      setActivePatient(patient);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePatient(null);

    if (!over) return;

    const patientId = active.id.toString().replace('patient-', '');
    const dropZoneId = over.id.toString();

    if (dropZoneId.startsWith('slot-')) {
      const [, doctorId, timeKey] = dropZoneId.split('-');
      
      // Check if patient is already assigned
      const isAlreadyAssigned = assignedPatients.some(p => p.id === patientId);
      
      if (isAlreadyAssigned) {
        // Update existing assignment
        updatePatientAssignment(patientId, doctorId, timeKey);
      } else {
        // New assignment from queue
        assignPatient(patientId, doctorId, timeKey);
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
      
      {/* Global Drag Overlay */}
      <DragOverlay>
        {activePatient ? (
          <div style={{ transform: 'rotate(5deg)' }}>
            <PatientCard patient={activePatient} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};