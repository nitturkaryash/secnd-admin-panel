
/**
 * @file Zustand store for managing the schedule.
 */
import { create } from 'zustand';

export interface Assignment {
  patientId: string;
  doctorId: string;
  slot: Date;
}

interface ScheduleState {
  assignments: Assignment[];
  addAssignment: (assignment: Assignment) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  assignments: [],
  addAssignment: (assignment) =>
    set((state) => ({ assignments: [...state.assignments, assignment] })),
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
