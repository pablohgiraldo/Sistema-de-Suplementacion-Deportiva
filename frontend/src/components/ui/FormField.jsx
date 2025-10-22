import React from 'react';
import Input from './Input';
import Button from './Button';

const FormField = ({ 
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  leftIcon,
  rightIcon,
  className = ''
}) => {
  return (
    <div className={`form-field ${className}`}>
      <Input
        label={label}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        success={success}
        helperText={helperText}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
      />
    </div>
  );
};

export default FormField;
