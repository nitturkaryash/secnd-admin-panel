
/**
 * @file A patient card component following the design system.
 */
import { Patient } from '../../../lib/mockPatients';

interface PatientCardProps {
  patient: Patient;
  isDragging?: boolean;
  onClick?: (patient: Patient) => void;
}

const priorityColors = {
  Low: 'bg-blue-50 text-blue-700 border-blue-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
  High: 'bg-red-50 text-red-700 border-red-200',
};

export function PatientCard({ patient, isDragging = false, onClick }: PatientCardProps) {
  const handleCardClick = () => {
    if (onClick && !isDragging) {
      console.log('PatientCard clicked:', patient.name);
      onClick(patient);
    }
  };

  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-[18px] p-4 mb-2 transition-all duration-200
        ${isDragging 
          ? 'shadow-lg scale-105 opacity-90' 
          : 'shadow-sm hover:shadow-md'
        }
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
      `}
      style={{
        background: '#FFFFFF',
        borderColor: '#E0E3EB',
        boxShadow: isDragging 
          ? '0 6px 24px 0 rgba(30, 51, 110, 0.07)' 
          : '0 4px 16px 0 rgba(30, 51, 110, 0.04)',
      }}
      onClick={handleCardClick}
    >
      <div className="flex items-center">
        <img 
          src={patient.avatar} 
          alt={patient.name} 
          className="w-10 h-10 rounded-full mr-3 flex-shrink-0" 
        />
        <div className="flex-1 min-w-0">
          <p 
            className="font-semibold text-sm truncate"
            style={{ color: '#222C47' }}
          >
            {patient.name}
          </p>
          <p 
            className="text-xs truncate"
            style={{ color: '#5E6A81' }}
          >
            {new Date(patient.appointmentDateTime).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
        <span
          className={`
            text-xs font-medium px-2 py-1 rounded-full border flex-shrink-0
            ${priorityColors[patient.priority]}
          `}
        >
          {patient.priority}
        </span>
      </div>
      <p 
        className="text-xs mt-2 line-clamp-2"
        style={{ color: '#5E6A81' }}
      >
        {patient.symptoms}
      </p>
    </div>
  );
}
