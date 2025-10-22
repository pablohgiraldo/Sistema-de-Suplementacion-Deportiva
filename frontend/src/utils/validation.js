// Utilidades de validación mejoradas
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Este campo es obligatorio';
    }
    return null;
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Ingresa un email válido';
    }
    return null;
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Debe tener al menos ${min} caracteres`;
    }
    return null;
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `No puede tener más de ${max} caracteres`;
    }
    return null;
  },
  
  phone: (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Ingresa un teléfono válido';
    }
    return null;
  },
  
  password: (value) => {
    if (value && value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    return null;
  },
  
  confirmPassword: (password) => (value) => {
    if (value && value !== password) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  },
  
  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Debe ser un número válido';
    }
    return null;
  },
  
  min: (min) => (value) => {
    if (value && Number(value) < min) {
      return `El valor mínimo es ${min}`;
    }
    return null;
  },
  
  max: (max) => (value) => {
    if (value && Number(value) > max) {
      return `El valor máximo es ${max}`;
    }
    return null;
  }
};

// Función para validar un campo con múltiples reglas
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) {
      return error;
    }
  }
  return null;
};

// Función para validar un formulario completo
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  
  Object.keys(validationSchema).forEach(field => {
    const rules = validationSchema[field];
    const value = formData[field];
    const error = validateField(value, rules);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Esquemas de validación predefinidos
export const validationSchemas = {
  login: {
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required]
  },
  
  register: {
    name: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password],
    confirmPassword: [validationRules.required]
  },
  
  contact: {
    name: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    message: [validationRules.required, validationRules.minLength(10)]
  },
  
  product: {
    name: [validationRules.required, validationRules.minLength(3)],
    price: [validationRules.required, validationRules.number, validationRules.min(0)],
    description: [validationRules.required, validationRules.minLength(10)]
  }
};
