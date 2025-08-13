import React from 'react';
import { colors, spacing, borderRadius, typography } from '../../../styles/theme';

interface HeaderProps {
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  onNotificationClick,
  onProfileClick,
  currentView,
  onNavigate
}) => {
  const headerStyles = {
    background: colors.background.card,
    borderBottom: `1px solid ${colors.border.card}`,
    padding: `${spacing.md} ${spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100
  };

  const logoStyles = {
    color: colors.text.primary,
    fontSize: '20px',
    fontWeight: 700,
    margin: 0
  };

  const iconStyles = {
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    color: colors.icon.default,
    transition: 'color 0.2s ease-in-out'
  };

  return (
    <header style={headerStyles} className="nav-bar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={logoStyles}>Secnd Admin Panel</h1>
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: spacing.md,
        marginLeft: spacing.xl
      }}>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            background: currentView === 'dashboard' ? colors.primary.light : 'transparent',
            color: currentView === 'dashboard' ? colors.primary.main : colors.text.body,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSize.md,
            fontWeight: currentView === 'dashboard' ? typography.fontWeight.semibold : typography.fontWeight.normal,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
            <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z"/>
          </svg>
          Dashboard
        </button>
        
        <button
          onClick={() => onNavigate('patients')}
          style={{
            background: currentView === 'patients' ? colors.primary.light : 'transparent',
            color: currentView === 'patients' ? colors.primary.main : colors.text.body,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSize.md,
            fontWeight: currentView === 'patients' ? typography.fontWeight.semibold : typography.fontWeight.normal,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
          </svg>
          Patients
        </button>
        
        <button
          onClick={() => onNavigate('doctors')}
          style={{
            background: currentView === 'doctors' ? colors.primary.light : 'transparent',
            color: currentView === 'doctors' ? colors.primary.main : colors.text.body,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.fontSize.md,
            fontWeight: currentView === 'doctors' ? typography.fontWeight.semibold : typography.fontWeight.normal,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
          </svg>
          Doctors
        </button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <button
          onClick={onNotificationClick}
          aria-label="Notifications"
          title="Notifications"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: spacing.xs,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg
            style={iconStyles}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>
        
        <button
          onClick={onProfileClick}
          aria-label="User Profile"
          title="User Profile"
          style={{
            background: 'none',
            border: `2px solid ${colors.border.profile}`,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.icon.default
          }}
        >
          <svg
            style={{ width: '20px', height: '20px' }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;