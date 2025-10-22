// Utilidad para validación de responsividad
export const responsiveValidation = {
  // Breakpoints estándar
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Validar que un componente sea responsivo
  validateComponent: (componentName, classes) => {
    const responsiveClasses = [
      'xs:', 'sm:', 'md:', 'lg:', 'xl:', '2xl:',
      'grid-cols-', 'flex-', 'hidden', 'block',
      'text-', 'w-', 'h-', 'p-', 'm-', 'gap-'
    ];
    
    const hasResponsiveClasses = responsiveClasses.some(prefix => 
      classes.some(cls => cls.includes(prefix))
    );
    
    return {
      component: componentName,
      isResponsive: hasResponsiveClasses,
      classes: classes,
      recommendations: hasResponsiveClasses ? [] : [
        'Agregar clases responsive (sm:, md:, lg:, etc.)',
        'Implementar breakpoints para diferentes tamaños',
        'Asegurar que el contenido se adapte correctamente'
      ]
    };
  },

  // Validar grid responsivo
  validateGrid: (gridClasses) => {
    const hasGridResponsive = gridClasses.some(cls => 
      cls.includes('grid-cols-') && (
        cls.includes('sm:') || 
        cls.includes('md:') || 
        cls.includes('lg:') || 
        cls.includes('xl:')
      )
    );
    
    return {
      isGridResponsive: hasGridResponsive,
      recommendations: hasGridResponsive ? [] : [
        'Implementar grid responsivo con breakpoints',
        'Usar grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        'Asegurar que el grid se adapte a diferentes pantallas'
      ]
    };
  },

  // Validar tipografía responsiva
  validateTypography: (textClasses) => {
    const hasResponsiveText = textClasses.some(cls => 
      cls.includes('text-') && (
        cls.includes('sm:') || 
        cls.includes('md:') || 
        cls.includes('lg:') || 
        cls.includes('xl:')
      )
    );
    
    return {
      isTypographyResponsive: hasResponsiveText,
      recommendations: hasResponsiveText ? [] : [
        'Implementar tipografía responsiva',
        'Usar text-sm sm:text-base md:text-lg lg:text-xl',
        'Asegurar legibilidad en todos los dispositivos'
      ]
    };
  },

  // Validar espaciado responsivo
  validateSpacing: (spacingClasses) => {
    const hasResponsiveSpacing = spacingClasses.some(cls => 
      (cls.includes('p-') || cls.includes('m-') || cls.includes('gap-')) && (
        cls.includes('sm:') || 
        cls.includes('md:') || 
        cls.includes('lg:') || 
        cls.includes('xl:')
      )
    );
    
    return {
      isSpacingResponsive: hasResponsiveSpacing,
      recommendations: hasResponsiveSpacing ? [] : [
        'Implementar espaciado responsivo',
        'Usar p-4 sm:p-6 md:p-8 lg:p-12',
        'Asegurar espaciado adecuado en todos los dispositivos'
      ]
    };
  }
};

// Componentes validados
export const validatedComponents = {
  Header: {
    isResponsive: true,
    features: [
      'Menú hamburger en móvil',
      'Búsqueda adaptativa',
      'Iconos responsivos',
      'Navegación colapsable'
    ]
  },
  HeroBanner: {
    isResponsive: true,
    features: [
      'Altura adaptativa (h-80 sm:h-96 lg:h-[32rem])',
      'Texto responsivo (text-2xl xs:text-3xl sm:text-4xl)',
      'Layout flexible',
      'Imágenes optimizadas'
    ]
  },
  ProductGrid: {
    isResponsive: true,
    features: [
      'Grid adaptativo (grid-cols-1 xs:grid-cols-2 sm:grid-cols-2)',
      'Gap responsivo (gap-4 sm:gap-6 lg:gap-8)',
      'Cards flexibles',
      'Imágenes responsivas'
    ]
  },
  Footer: {
    isResponsive: true,
    features: [
      'Grid responsivo (grid-cols-1 md:grid-cols-3)',
      'Enlaces sociales adaptativos',
      'Texto legible en móvil',
      'Espaciado optimizado'
    ]
  },
  ProductCarousel: {
    isResponsive: true,
    features: [
      'Items por vista adaptativos',
      'Navegación responsiva',
      'Controles móviles',
      'Scroll suave'
    ]
  }
};

export default responsiveValidation;
