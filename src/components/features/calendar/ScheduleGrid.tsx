
/**
 * @file The main schedule grid component.
 */
import { Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useQueueStore } from '../../../store/useQueueStore';
import { useScheduleStore } from '../../../store/useScheduleStore';
import { showToast } from '../../../lib/toast';

export function ScheduleGrid() {
  const { assignPatient } = useQueueStore();
  const { addAssignment } = useScheduleStore();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const doctorId = destination.droppableId;
      const slot = new Date(); // Replace with actual slot time
      assignPatient(draggableId, doctorId, slot).then(() => {
        addAssignment({ patientId: draggableId, doctorId, slot });
        showToast('Assigned!');
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <main className="flex-1 p-4">
        <Droppable droppableId="doctor-1">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="h-full bg-gray-100 rounded-lg p-4"
            >
              <h3 className="font-semibold mb-2">Doctor 1</h3>
              {/* Render assigned patients here */}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </main>
    </DragDropContext>
  );
}
