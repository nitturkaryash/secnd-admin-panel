
/**
 * @file A draggable patient card.
 */
import { Draggable } from 'react-beautiful-dnd';
import { Patient } from '../../../lib/mockPatients';

interface PatientCardProps {
  patient: Patient;
  index: number;
}

const priorityColors = {
  Low: 'bg-blue-200 text-blue-800',
  Medium: 'bg-yellow-200 text-yellow-800',
  High: 'bg-red-200 text-red-800',
};

export function PatientCard({ patient, index }: PatientCardProps) {
  return (
    <Draggable draggableId={patient.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-3 mb-2 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full mr-3" />
            <div>
              <p className="font-semibold">{patient.name}</p>
              <p className="text-xs text-gray-500">{patient.requestedTime.toLocaleString()}</p>
            </div>
            <span
              className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${priorityColors[patient.priority]}`}>
              {patient.priority}
            </span>
          </div>
          <p className="text-sm mt-2 text-gray-600">{patient.symptoms}</p>
        </div>
      )}
    </Draggable>
  );
}
