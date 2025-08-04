
/**
 * @file A virtualized list of patient cards.
 */
import { useQueueStore } from '../../../store/useQueueStore';
import { PatientCard } from './PatientCard';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import { AutoSizer, List } from 'react-virtualized';

export function PatientQueue() {
  const { patients } = useQueueStore();

  if (patients.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">All set! No patients waiting.</p>
      </div>
    );
  }

  const rowRenderer = ({ index, key, style }: any) => (
    <div key={key} style={style}>
      <PatientCard patient={patients[index]} index={index} />
    </div>
  );

  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="patient-queue">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="h-full">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  rowCount={patients.length}
                  rowHeight={120}
                  rowRenderer={rowRenderer}
                />
              )}
            </AutoSizer>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
