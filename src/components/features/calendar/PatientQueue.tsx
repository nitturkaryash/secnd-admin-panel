/**
 * @file A virtualized list of patient cards using @dnd-kit.
 */
import { useQueueStore } from '../../../store/useQueueStore';
import { DraggablePatientCard } from './DraggablePatientCard';
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

  /* stylelint-disable */
  const rowRenderer = ({ index, key, style }: any) => (
    <div key={key} style={style}>
      <DraggablePatientCard patient={patients[index]} />
    </div>
  );
  /* stylelint-enable */

  return (
    <div className="h-full">
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
    </div>
  );
}
