import React from 'react';
import { colors, borderRadius, typography } from '../../../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button'
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontWeight: typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: typography.fontSize.sm
    },
    md: {
      padding: '12px 24px',
      fontSize: typography.fontSize.md
    },
    lg: {
      padding: '16px 32px',
      fontSize: typography.fontSize.lg
    }
  };

  const variantStyles = {
    primary: {
      background: disabled ? colors.background.disabled : colors.primary.gradient,
      color: colors.text.inverse,
      '&:hover': {
        background: disabled ? colors.background.disabled : colors.primary.hover
      },
      '&:active': {
        background: colors.primary.active
      },
      '&:focus': {
        boxShadow: colors.shadow.focus
      }
    },
    secondary: {
      background: disabled ? colors.background.disabled : colors.secondary.light,
      color: disabled ? colors.text.inactive : colors.secondary.main,
      '&:hover': {
        background: disabled ? colors.background.disabled : colors.secondary.hover
      },
      '&:active': {
        background: colors.secondary.dark
      },
      '&:focus': {
        boxShadow: `0 0 0 2px ${colors.secondary.main}30`
      }
    }
  };

  const styles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };

  return (
    <button
      type={type}
      style={styles}
      onClick={onClick}
      disabled={disabled}
      className={`btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 