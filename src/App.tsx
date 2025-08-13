import React, { useState, useEffect } from 'react';
import Header from './components/layout/header/Header';
import Sidebar from './components/features/calendar/CalendarSidebar';
import Calendar from './components/features/calendar/WeekCalendar';
import PatientListPage from './components/features/patients/PatientListPage';
import { DoctorListPage } from './components/features/doctors';
import { useApiStore } from './store/useApiStore';
import { useQueueStore } from './store/useQueueStore';
import { testConnection } from './lib/api';

import { colors, spacing, typography } from './styles/theme';
import './index.css';

type View = 'dashboard' | 'patients' | 'doctors';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  
  // Store hooks
  const { loadDashboard, isLoading } = useApiStore();
  const { loadData } = useQueueStore();

  // Load data on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Test database connection first
        const isConnected = await testConnection();
        if (!isConnected) {
          console.error('Database connection failed');
          return;
        }
        
        await loadDashboard();
        await loadData();
        console.log('App initialization complete');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadDashboard, loadData]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleWeekChange = (newDate: Date) => {
    setSelectedDate(newDate);
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

  const toggleSidebarVisibility = () => {
    setSidebarHidden(!sidebarHidden);
  };

  const sidebarStyles = {
    width: sidebarHidden ? '0px' : isSidebarCollapsed ? '60px' : '320px',
    overflow: 'hidden',
    transition: 'width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
    flexShrink: 0,
    opacity: sidebarHidden ? 0 : 1,
    transform: sidebarHidden ? 'translateX(-100%)' : 'translateX(0)',
    position: 'relative' as const
  };

  const mainContentStyles = {
    flex: 1,
    transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
    width: sidebarHidden ? '100%' : 'auto',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const
  };

  const appContainerBaseStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'var(--app-background)'
  };

  const renderContent = () => {
    if (currentView === 'patients') {
      return <PatientListPage onBackToDashboard={() => setCurrentView('dashboard')} />;
    }
    
    if (currentView === 'doctors') {
      return <DoctorListPage />;
    }
    
    return (
              <div 
        className="content-responsive"
        style={{ 
          display: 'flex', 
          flex: 1, 
          padding: sidebarHidden ? `${spacing.lg} ${spacing.lg} ${spacing.lg} ${spacing.xs}` : spacing.lg,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {!sidebarHidden && (
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
        )}
        
        <div style={mainContentStyles}>
          <Calendar 
            selectedWeek={selectedDate}
            onEventClick={handleEventClick}
            sidebarCollapsed={isSidebarCollapsed}
            sidebarHidden={sidebarHidden}
            onToggleSidebar={toggleSidebar}
            onToggleSidebarVisibility={toggleSidebarVisibility}
            onWeekChange={handleWeekChange}
          />
        </div>
      </div>
    );
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--app-background)',
        flexDirection: 'column',
        gap: spacing.md
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #E6F0FD',
          borderTop: '4px solid #2766E1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.primary,
          fontWeight: typography.fontWeight.medium
        }}>
          Loading Admin Panel...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        ...appContainerBaseStyles,
        height: currentView === 'dashboard' ? '100vh' : 'auto',
        minHeight: '100vh',
        overflowY: currentView === 'dashboard' ? 'hidden' as const : 'auto' as const
      }}>
        <Header 
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view as View)}
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default App;