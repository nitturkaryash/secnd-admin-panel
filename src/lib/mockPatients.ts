
/**
 * @file This file contains mock data for patient appointments.
 */
import { faker } from '@faker-js/faker';

export type Priority = 'Low' | 'Medium' | 'High';
export type Gender = 'Male' | 'Female' | 'Other';
export type AppointmentStatus = 'Booked' | 'Checked-in' | 'Completed' | 'Cancelled';

export interface Patient {
  id: string;
  serialNo: number;
  name: string;
  age: number;
  gender: Gender | null;
  assignedDoctor: string;
  appointmentDateTime: string;
  status: AppointmentStatus;
  avatar: string;
  requestedTime: Date;
  symptoms: string;
  priority: Priority;
}

const doctors = [
  { id: '1', name: 'Dr. Ahmad Kamal' },
  { id: '2', name: 'Dr. Sarah Wilson' },
  { id: '3', name: 'Dr. Michael Chen' },
  { id: '4', name: 'Dr. Emily Rodriguez' },
  { id: '5', name: 'Dr. David Thompson' },
];

// Generate appointment times distributed across clinic hours (8 AM to 10 PM)
const generateAppointmentTime = (index: number): string => {
  // Distribute patients across the 14-hour day (8 AM to 10 PM)
  const clinicHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]; // 8 AM to 10 PM
  const hour = clinicHours[index % clinicHours.length];
  
  // Use 15-minute intervals (0, 15, 30, 45)
  const minutes = faker.helpers.arrayElement([0, 15, 30, 45]);
  
  const appointmentDate = new Date();
  appointmentDate.setHours(hour, minutes, 0, 0);
  
  return appointmentDate.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const createRandomPatient = (index: number): Patient => ({
  id: faker.string.uuid(),
  serialNo: index + 1,
  name: faker.person.fullName(),
  age: faker.number.int({ min: 1, max: 90 }),
  gender: faker.helpers.arrayElement(['Male', 'Female', 'Other', null]),
  assignedDoctor: faker.helpers.arrayElement(doctors).id,
  appointmentDateTime: generateAppointmentTime(index),
  status: faker.helpers.arrayElement(['Booked', 'Checked-in', 'Completed', 'Cancelled']),
  avatar: faker.image.avatar(),
  requestedTime: faker.date.future(),
  symptoms: faker.lorem.sentence(),
  priority: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
});

// Generate 15 patients to populate various time slots
export const mockPatients: Patient[] = Array.from({ length: 15 }, (_, index) => createRandomPatient(index));
