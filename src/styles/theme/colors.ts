export const colors = {
  // Primary colors
  primary: {
    main: '#2767e1',
    light: '#e8f0ff',
    dark: '#1e4fa8',
    gradient: 'linear-gradient(180deg, #2767e1 0%, #2767e1 98%, #e8f0ff 100%)',
    hover: 'linear-gradient(180deg, #1e4fa8 0%, #1e4fa8 98%, #dce8ff 100%)',
    active: 'linear-gradient(180deg, #1a4490 0%, #1a4490 98%, #c6d8ff 100%)'
  },        
  
  // Secondary colors
  secondary: {
    main: '#2767e1',
    light: '#f0f4ff',
    dark: '#1e4fa8',
    hover: '#e6f0ff'
  },
  
  // Text colors
  text: {
    primary: '#222C47',
    secondary: '#394164',
    body: '#5E6A81',
    inactive: '#ADB4BE',
    subtle: '#BFC6CF',
    inverse: '#FFFFFF'
  },
  
  // Background colors
  background: {
    app: '#F7F8FA',
    card: '#FFFFFF',
    input: '#F5F7FB',
    disabled: '#F3F6FA',
    icon: '#F5F7FB'
  },
  
  // Border colors
  border: {
    card: '#E0E3EB',
    input: '#D1D9E0',
    profile: '#E0E3EB'
  },
  
  // Calendar event colors
  calendar: {
    checkHealth: 'rgba(140, 116, 250, 0.06)',
    checkUpKid: 'rgba(237, 199, 81, 0.08)',
    heartCheckUp: 'rgba(71, 202, 132, 0.10)',
    physicalControl: 'linear-gradient(180deg, #2767e1 0%, #2767e1 98%, #e8f0ff 100%)',
    bodyCondition: 'rgba(71, 202, 132, 0.07)',
    checkTeeth: 'rgba(71, 202, 132, 0.10)',
    checkUp: 'rgba(140, 116, 250, 0.06)'
  },
  
  // Icon colors
  icon: {
    default: '#2767e1',
    disabled: '#ADB4BE',
    inverse: '#FFFFFF',
    notification: '#1E2650'
  },
  
  // Shadow colors
  shadow: {
    default: '0 4px 16px 0 rgba(39, 103, 225, 0.04)',
    hover: '0 6px 24px 0 rgba(39, 103, 225, 0.07)',
    focus: '0 0 0 2px rgba(39, 103, 225, 0.30)'
  }
} as const;

export type ColorKey = keyof typeof colors; 