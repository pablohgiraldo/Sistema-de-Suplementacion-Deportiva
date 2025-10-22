import React from 'react';
import { useResponsiveValidation } from '../hooks/useResponsiveGrid';

export default function ResponsiveValidator({ children, showDebug = false }) {
  const validation = useResponsiveValidation();

  if (showDebug) {
    return (
      <div className="relative">
        {children}
        <div className="fixed top-4 right-4 bg-black text-white p-2 rounded-lg text-xs z-50">
          <div>Mobile: {validation.isMobile ? '✓' : '✗'}</div>
          <div>Tablet: {validation.isTablet ? '✓' : '✗'}</div>
          <div>Desktop: {validation.isDesktop ? '✓' : '✗'}</div>
          <div>Landscape: {validation.isLandscape ? '✓' : '✗'}</div>
          <div>Portrait: {validation.isPortrait ? '✓' : '✗'}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ResponsiveGrid({ children, className = '' }) {
  const validation = useResponsiveValidation();

  const getResponsiveClasses = () => {
    if (validation.isMobile) {
      return 'grid-cols-1 gap-3';
    } else if (validation.isTablet) {
      return 'grid-cols-2 gap-5';
    } else {
      return 'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 lg:gap-7 xl:gap-8';
    }
  };

  return (
    <div className={`grid ${getResponsiveClasses()} ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveContainer({ children, className = '' }) {
  const validation = useResponsiveValidation();

  const getContainerClasses = () => {
    if (validation.isMobile) {
      return 'px-4 py-6';
    } else if (validation.isTablet) {
      return 'px-6 py-8';
    } else {
      return 'px-8 py-12';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto ${getContainerClasses()} ${className}`}>
      {children}
    </div>
  );
}
