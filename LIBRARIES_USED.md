# Libraries Used in SECND Admin Panel

This document provides a comprehensive overview of all libraries, frameworks, and tools used in the SECND Admin Panel project.

## 🎨 UI Component Libraries

### Drag and Drop Libraries

#### 1. **@dnd-kit** (MIT License)
- **Package**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Version**: 6.3.1, 10.0.0, 3.2.2
- **Usage**: Modern, accessible drag and drop library for React
- **Components Used**:
  - `DndContext` - Main drag and drop context
  - `useDraggable` - Hook for draggable elements
  - `useDroppable` - Hook for droppable areas
  - `useSortable` - Hook for sortable lists
  - `DragOverlay` - Visual feedback during drag operations
  - `CSS` utilities for transform calculations

#### 2. **react-beautiful-dnd** (Apache 2.0 License)
- **Package**: `react-beautiful-dnd`
- **Version**: 13.1.1
- **Usage**: Beautiful and accessible drag and drop for lists
- **Components Used**:
  - `DragDropContext` - Main drag and drop context
  - `Droppable` - Droppable area component
  - `DropResult` - Type for drop event results

#### 3. **dragula** (MIT License)
- **Package**: `dragula`, `react-dragula`
- **Version**: 3.7.3, 1.1.17
- **Usage**: Drag and drop library with React wrapper
- **Note**: Appears to be included but may not be actively used

### Animation Libraries

#### 4. **framer-motion** (MIT License)
- **Package**: `framer-motion`
- **Version**: 12.23.11
- **Usage**: Production-ready motion library for React
- **Components Used**:
  - `motion` - Animated components
  - Used in `AnimatedNeumorphicButton` for button animations

### Icon Libraries

#### 5. **react-icons** (MIT License)
- **Package**: `react-icons`
- **Version**: 5.5.0
- **Usage**: Popular icon library with multiple icon sets
- **Icon Sets Used**:
  - `FiSend`, `FiHeart`, `FiStar`, `FiUser` from Feather Icons

### Date/Calendar Libraries

#### 6. **react-day-picker** (MIT License)
- **Package**: `react-day-picker`
- **Version**: 9.8.1
- **Usage**: Flexible date picker component
- **Components Used**:
  - `DayPicker` - Date picker component in `HeaderDatePicker`

### Virtualization Libraries

#### 7. **react-virtualized** (MIT License)
- **Package**: `react-virtualized`
- **Version**: 9.22.6
- **Usage**: Efficient rendering of large lists and tabular data
- **Components Used**:
  - `AutoSizer` - Automatically sizes components
  - `List` - Virtualized list component in `PatientQueue`

### Toast/Notification Libraries

#### 8. **react-hot-toast** (MIT License)
- **Package**: `react-hot-toast`
- **Version**: 2.5.2
- **Usage**: Lightweight toast notification library
- **Usage**: Custom wrapper in `src/lib/toast.ts` for success/error notifications

## 🛠️ Core Framework & Build Tools

### React Ecosystem
- **React**: 18.2.0 - UI library
- **React DOM**: 18.2.0 - React rendering for web
- **TypeScript**: 5.0.2 - Type-safe JavaScript

### Build Tools
- **Vite**: 4.4.5 - Fast build tool and dev server
- **@vitejs/plugin-react**: 4.0.3 - React plugin for Vite

### Styling
- **Tailwind CSS**: 3.4.0 - Utility-first CSS framework
- **PostCSS**: 8.5.6 - CSS processing tool
- **Autoprefixer**: 10.4.21 - CSS vendor prefixing

## 📊 State Management

### 9. **Zustand** (MIT License)
- **Package**: `zustand`
- **Version**: 5.0.7
- **Usage**: Lightweight state management library
- **Stores Used**:
  - `useQueueStore` - Patient queue state management
  - `useScheduleStore` - Schedule/appointment state management

## 🧪 Testing & Development

### Testing
- **Cypress**: 14.5.3 - End-to-end testing framework

### Development Tools
- **ESLint**: 8.45.0 - JavaScript/TypeScript linting
- **@typescript-eslint/eslint-plugin**: 6.0.0 - TypeScript ESLint rules
- **@typescript-eslint/parser**: 6.0.0 - TypeScript parser for ESLint
- **eslint-plugin-react-hooks**: 4.6.0 - React Hooks linting rules
- **eslint-plugin-react-refresh**: 0.4.3 - React Fast Refresh linting

## 🎲 Data & Utilities

### 10. **@faker-js/faker** (MIT License)
- **Package**: `@faker-js/faker`
- **Version**: 9.9.0
- **Usage**: Generate fake data for development and testing
- **Usage**: Mock patient data generation

## 📦 Type Definitions

All TypeScript type definitions are included as dev dependencies:
- `@types/react`: 18.2.15
- `@types/react-dom`: 18.2.7
- `@types/react-beautiful-dnd`: 13.1.8
- `@types/react-virtualized`: 9.22.2
- `@types/dragula`: 3.7.5

## 🎯 Key Features Implemented

### Drag and Drop Functionality
- **Multiple DnD Libraries**: The project uses both `@dnd-kit` and `react-beautiful-dnd` for different use cases
- **Patient Queue Management**: Sortable patient lists with drag and drop
- **Calendar Integration**: Drag patients to time slots in the calendar
- **Visual Feedback**: Drag overlays and animations during operations

### UI/UX Enhancements
- **Smooth Animations**: Framer Motion for button and component animations
- **Responsive Design**: Tailwind CSS for utility-first styling
- **Icon System**: React Icons for consistent iconography
- **Toast Notifications**: User feedback for actions

### Performance Optimizations
- **Virtualization**: React Virtualized for large patient lists
- **State Management**: Zustand for efficient state updates
- **Build Optimization**: Vite for fast development and builds

## 📄 License Summary

All libraries used in this project are open source with permissive licenses:
- **MIT License**: Most libraries (dnd-kit, framer-motion, react-icons, etc.)
- **Apache 2.0**: react-beautiful-dnd

## 🔧 Installation

To install all dependencies:

```bash
npm install
# or
bun install
```

## 🚀 Development

Start the development server:

```bash
bun run start
```

## 📝 Notes

- The project uses multiple drag and drop libraries for different use cases
- Custom design system implemented with Tailwind CSS
- TypeScript for type safety throughout the application
- Comprehensive testing setup with Cypress
- Modern build tooling with Vite for optimal performance
