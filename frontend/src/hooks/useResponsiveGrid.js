import { useState, useEffect } from 'react';

export function useResponsiveGrid() {
  const [gridConfig, setGridConfig] = useState({
    columns: 1,
    gap: 'gap-3',
    containerClass: 'grid-cols-1'
  });

  useEffect(() => {
    const updateGridConfig = () => {
      const width = window.innerWidth;
      
      if (width < 475) {
        // Móvil pequeño
        setGridConfig({
          columns: 1,
          gap: 'gap-3',
          containerClass: 'grid-cols-1'
        });
      } else if (width < 640) {
        // Móvil grande
        setGridConfig({
          columns: 2,
          gap: 'gap-4',
          containerClass: 'grid-cols-2'
        });
      } else if (width < 768) {
        // Tablet pequeño
        setGridConfig({
          columns: 2,
          gap: 'gap-5',
          containerClass: 'grid-cols-2'
        });
      } else if (width < 1024) {
        // Tablet grande
        setGridConfig({
          columns: 3,
          gap: 'gap-6',
          containerClass: 'grid-cols-3'
        });
      } else if (width < 1280) {
        // Desktop pequeño
        setGridConfig({
          columns: 4,
          gap: 'gap-7',
          containerClass: 'grid-cols-4'
        });
      } else if (width < 1536) {
        // Desktop grande
        setGridConfig({
          columns: 5,
          gap: 'gap-8',
          containerClass: 'grid-cols-5'
        });
      } else {
        // Desktop extra grande
        setGridConfig({
          columns: 6,
          gap: 'gap-8',
          containerClass: 'grid-cols-6'
        });
      }
    };

    // Configurar inicialmente
    updateGridConfig();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', updateGridConfig);

    // Cleanup
    return () => window.removeEventListener('resize', updateGridConfig);
  }, []);

  return gridConfig;
}

export function useResponsiveBreakpoints() {
  const [breakpoint, setBreakpoint] = useState('mobile');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setBreakpoint('mobile');
      } else if (width < 768) {
        setBreakpoint('tablet-sm');
      } else if (width < 1024) {
        setBreakpoint('tablet-lg');
      } else if (width < 1280) {
        setBreakpoint('desktop-sm');
      } else if (width < 1536) {
        setBreakpoint('desktop-lg');
      } else {
        setBreakpoint('desktop-xl');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

export function useResponsiveValidation() {
  const [validation, setValidation] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLandscape: false,
    isPortrait: false
  });

  useEffect(() => {
    const updateValidation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setValidation({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isLandscape: width > height,
        isPortrait: height > width
      });
    };

    updateValidation();
    window.addEventListener('resize', updateValidation);

    return () => window.removeEventListener('resize', updateValidation);
  }, []);

  return validation;
}
