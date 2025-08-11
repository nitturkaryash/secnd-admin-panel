import React, { useState } from 'react';
import Header from './components/layout/header/Header';
import Sidebar from './components/features/calendar/CalendarSidebar';
import Calendar from './components/features/calendar/WeekCalendar';
import PatientListPage from './components/features/patients/PatientListPage';

import { colors, spacing, borderRadius, typography } from './styles/theme';
import './index.css';

type View = 'dashboard' | 'patients';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarStyles = {
    width: isSidebarCollapsed ? '0px' : '300px',
    overflow: 'hidden',
    transition: 'width 0.3s ease-in-out',
    flexShrink: 0
  };

  const mainContentStyles = {
    flex: 1,
    transition: 'margin-left 0.3s ease-in-out',
    marginLeft: isSidebarCollapsed ? '0px' : '0px'
  };

  const renderContent = () => {
    if (currentView === 'patients') {
      return <PatientListPage onBackToDashboard={() => setCurrentView('dashboard')} />;
    }
    
    return (
      <div 
        className="content-responsive"
        style={{ 
          display: 'flex', 
          flex: 1, 
          padding: spacing.lg,
          position: 'relative'
        }}
      >
        <div style={sidebarStyles}>
          <Sidebar 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onPatientQueueClick={() => {
              console.log('Patient Queue clicked - navigating to patients view');
              setCurrentView('patients');
            }}
          />
        </div>
        
        <div style={mainContentStyles}>
          <Calendar 
            selectedWeek={selectedDate}
            onEventClick={handleEventClick}
            sidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column', 
        height: '100vh',
        backgroundColor: 'var(--app-background)'
      }}>
        <Header 
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default App;