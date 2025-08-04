
/**
 * @file A compact date-picker for the header.
 */
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useScheduleStore } from '../../../store/useScheduleStore';

export function HeaderDatePicker() {
  const { selectedDate, setSelectedDate } = useScheduleStore();

  return (
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={(date) => setSelectedDate(date || new Date())}
      className="text-sm"
    />
  );
}
