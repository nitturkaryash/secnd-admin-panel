import React from 'react';
import { colors, borderRadius, spacing } from '../../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
  style = {}
}) => {
  const paddingStyles = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg
  };

  const baseStyles = {
    background: colors.background.card,
    border: `1px solid ${colors.border.card}`,
    borderRadius: borderRadius.lg,
    boxShadow: colors.shadow.default,
    transition: 'all 0.2s ease-in-out',
    cursor: onClick ? 'pointer' : 'default'
  };

  const hoverStyles = hoverable ? {
    '&:hover': {
      boxShadow: colors.shadow.hover
    }
  } : {};

  const styles = {
    ...baseStyles,
    ...hoverStyles,
    padding: paddingStyles[padding],
    ...style
  };

  return (
    <div
      style={styles}
      onClick={onClick}
      className={`card-container ${className}`}
    >
      {children}
    </div>
  );
};

export default Card; 