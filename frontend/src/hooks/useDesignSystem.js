import { useMemo } from 'react';

export const useDesignSystem = () => {
  const colors = useMemo(() => ({
    primary: '#000000',
    primaryHover: '#1a1a1a',
    primaryLight: '#333333',
    secondary: '#ffffff',
    secondaryHover: '#f8f9fa',
    accentBlue: '#3B82F6',
    accentGreen: '#10B981',
    accentPink: '#EC4899',
    accentYellow: '#F59E0B',
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  }), []);

  const typography = useMemo(() => ({
    fontFamily: {
      primary: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      heading: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem'   // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.6,
      relaxed: 1.8
    }
  }), []);

  const spacing = useMemo(() => ({
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem'      // 96px
  }), []);

  const borderRadius = useMemo(() => ({
    sm: '0.25rem',
    base: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  }), []);

  const shadows = useMemo(() => ({
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }), []);

  const getButtonStyles = (variant = 'primary', size = 'md') => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-black text-black hover:bg-black hover:text-white focus:ring-black',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };
    
    return `${baseStyles} ${variants[variant]} ${sizes[size]}`;
  };

  const getInputStyles = (state = 'default') => {
    const baseStyles = 'w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
    
    const states = {
      default: 'border-gray-300 focus:border-black focus:ring-black',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50',
      disabled: 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
    };
    
    return `${baseStyles} ${states[state]}`;
  };

  const getCardStyles = (variant = 'default') => {
    const baseStyles = 'bg-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden';
    
    const variants = {
      default: 'hover:shadow-xl hover:-translate-y-1',
      elevated: 'shadow-xl hover:shadow-2xl hover:-translate-y-2',
      flat: 'shadow-none border border-gray-200 hover:shadow-md'
    };
    
    return `${baseStyles} ${variants[variant]}`;
  };

  return {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    getButtonStyles,
    getInputStyles,
    getCardStyles
  };
};
