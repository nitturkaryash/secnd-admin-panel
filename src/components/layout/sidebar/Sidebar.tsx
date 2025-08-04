
/**
 * @file The main sidebar component.
 */
import { PatientQueue } from '../../features/calendar/PatientQueue';

export function Sidebar() {
  return (
    <aside className="w-80 bg-gray-50 p-4 border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Patient Appointments</h2>
      <PatientQueue />
    </aside>
  );
}
