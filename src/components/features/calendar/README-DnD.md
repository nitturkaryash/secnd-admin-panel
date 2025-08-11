# Drag-and-Drop Scheduling System

## Overview

This implementation provides a precision drag-and-drop scheduling system for the patient queue and appointment calendar using `@dnd-kit`, following the design system specifications strictly.

## Architecture

### Components

1. **PatientCard.tsx** - Base patient card component with design system styling
2. **DraggablePatientCard.tsx** - Wrapper that makes patient cards draggable
3. **DroppableTimeSlot.tsx** - Calendar time slot that accepts dropped patients
4. **WeekCalendar.tsx** - Main calendar grid with integrated DnD
5. **PatientQueue.tsx** - Patient queue with draggable cards

### State Management

- **useQueueStore.ts** - Zustand store managing patient assignments
  - `patients`: Unassigned patients in the queue
  - `assignedPatients`: Patients assigned to time slots
  - `assignPatient()`: Move patient from queue to calendar
  - `updatePatientAssignment()`: Move assigned patient to different slot
  - `unassignPatient()`: Move patient back to queue

## Usage

### Basic Drag and Drop

1. **From Queue to Calendar**: Drag patients from the sidebar queue to any time slot
2. **Between Time Slots**: Drag assigned patients between different time slots
3. **Visual Feedback**: 
   - Cards scale and show shadow when dragging
   - Drop zones highlight when hovering
   - Drag overlay shows rotated card

### Design System Compliance

All components strictly follow the design system:
- **Colors**: Uses exact hex values from design.json
- **Spacing**: Uses design system spacing tokens
- **Shadows**: Follows card shadow specifications
- **Border Radius**: 18px rounded corners as specified
- **Typography**: Consistent font weights and sizes

### Drop Zone Behavior

- **Empty Slots**: Show "Drop patient here" indicator
- **Occupied Slots**: Allow multiple patients per slot
- **Invalid Drops**: Automatically cancelled if dropped outside valid zones

## Technical Implementation

### DnD Context Structure

```tsx
<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
  {/* Calendar Grid */}
  <WeekCalendar />
  
  {/* Drag Overlay */}
  <DragOverlay>
    {activePatient && <PatientCard patient={activePatient} isDragging />}
  </DragOverlay>
</DndContext>
```

### ID Convention

- **Draggable IDs**: `patient-{patientId}`
- **Droppable IDs**: `slot-{doctorId}-{timeKey}`
- **Time Keys**: Format `HH:MM` (e.g., "09:15")

### State Updates

```tsx
// New assignment
assignPatient(patientId, doctorId, timeKey)

// Update existing assignment  
updatePatientAssignment(patientId, doctorId, timeKey)
```

## Extending the System

### Adding New Drop Zones

1. Create droppable component with unique ID
2. Handle drop in `handleDragEnd`
3. Update state accordingly

### Custom Drag Behavior

1. Extend `DraggablePatientCard` props
2. Modify drag overlay in `DragOverlay`
3. Add custom drag constraints if needed

### Validation Rules

Add validation in `handleDragEnd`:
```tsx
if (dropZoneId.startsWith('slot-')) {
  // Validate doctor availability
  // Check time conflicts
  // Verify patient eligibility
}
```

## Performance Considerations

- Uses React.useMemo for patient grouping
- Virtualized patient queue for large lists
- Efficient state updates with Zustand
- Minimal re-renders with proper key props

## Testing

The system can be tested by:
1. Starting the development server: `bun run start`
2. Navigate to the calendar view
3. Try dragging patients from queue to calendar slots
4. Verify state updates and visual feedback

## Design System Adherence

✅ **Card Styling**: White background, proper shadows, 18px border radius
✅ **Color Palette**: Uses exact design system colors
✅ **Typography**: Consistent font weights and sizes  
✅ **Spacing**: Uses design system spacing tokens
✅ **Hover Effects**: Proper shadow transitions
✅ **Interactive States**: Focus, active, and disabled states