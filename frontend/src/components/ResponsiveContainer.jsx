// Componente para manejar la responsividad de manera consistente
import { useState, useEffect } from 'react';

export default function ResponsiveContainer({ children, className = "" }) {
  const [screenSize, setScreenSize] = useState('desktop');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 768) {
        setScreenSize('tablet');
      } else if (width < 1024) {
        setScreenSize('laptop');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getResponsiveClasses = () => {
    const baseClasses = "transition-all duration-500";
    const visibilityClasses = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4";
    
    switch (screenSize) {
      case 'mobile':
        return `${baseClasses} ${visibilityClasses} px-4 py-6`;
      case 'tablet':
        return `${baseClasses} ${visibilityClasses} px-6 py-8`;
      case 'laptop':
        return `${baseClasses} ${visibilityClasses} px-8 py-10`;
      case 'desktop':
        return `${baseClasses} ${visibilityClasses} px-12 py-12`;
      default:
        return `${baseClasses} ${visibilityClasses} px-8 py-10`;
    }
  };

  return (
    <div className={`${getResponsiveClasses()} ${className}`}>
      {children}
    </div>
  );
}

// Hook para usar la información de responsividad
export function useResponsive() {
  const [screenSize, setScreenSize] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 768) {
        setScreenSize('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setScreenSize('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints: {
      mobile: 640,
      tablet: 768,
      laptop: 1024,
      desktop: 1280
    }
  };
}
