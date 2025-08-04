import React from 'react';
import { colors, spacing } from '../../../styles/theme';

interface HeaderProps {
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onNotificationClick,
  onProfileClick
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