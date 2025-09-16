import { body, validationResult } from 'express-validator';
import { validateRegister, validateLogin, handleValidationErrors } from '../../src/validators/userValidators.js';

// Mock validation middleware
const mockValidation = (validators) => {
  return async (req, res, next) => {
    for (const validator of validators) {
      await validator.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }
    next();
  };
};

describe('User Validators', () => {
  describe('validateRegister', () => {
    test('should pass validation with valid data', async () => {
      const req = {
        body: {
          nombre: 'Test User',
          email: 'test@example.com',
          contraseña: 'password123',
          confirmarContraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should fail validation with missing nombre', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          contraseña: 'password123',
          confirmarContraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'El nombre es requerido'
          })
        ])
      });
    });

    test('should fail validation with invalid email', async () => {
      const req = {
        body: {
          nombre: 'Test User',
          email: 'invalid-email',
          contraseña: 'password123',
          confirmarContraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Por favor ingresa un email válido'
          })
        ])
      });
    });

    test('should fail validation with short password', async () => {
      const req = {
        body: {
          nombre: 'Test User',
          email: 'test@example.com',
          contraseña: '123',
          confirmarContraseña: '123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'La contraseña debe tener al menos 6 caracteres'
          })
        ])
      });
    });

    test('should fail validation with password mismatch', async () => {
      const req = {
        body: {
          nombre: 'Test User',
          email: 'test@example.com',
          contraseña: 'password123',
          confirmarContraseña: 'differentpassword'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Las contraseñas no coinciden'
          })
        ])
      });
    });

    test('should fail validation with empty fields', async () => {
      const req = {
        body: {
          nombre: '',
          email: '',
          contraseña: '',
          confirmarContraseña: ''
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'El nombre es requerido'
          }),
          expect.objectContaining({
            msg: 'El email es requerido'
          }),
          expect.objectContaining({
            msg: 'La contraseña es requerida'
          }),
          expect.objectContaining({
            msg: 'La confirmación de contraseña es requerida'
          })
        ])
      });
    });

    test('should fail validation with special characters in nombre', async () => {
      const req = {
        body: {
          nombre: 'Test@User#123',
          email: 'test@example.com',
          contraseña: 'password123',
          confirmarContraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'El nombre solo puede contener letras y espacios'
          })
        ])
      });
    });

    test('should fail validation with nombre too long', async () => {
      const req = {
        body: {
          nombre: 'A'.repeat(51), // 51 characters
          email: 'test@example.com',
          contraseña: 'password123',
          confirmarContraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateRegister);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'El nombre no puede exceder 50 caracteres'
          })
        ])
      });
    });
  });

  describe('validateLogin', () => {
    test('should pass validation with valid data', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          contraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateLogin);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should fail validation with missing email', async () => {
      const req = {
        body: {
          contraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateLogin);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'El email es requerido'
          })
        ])
      });
    });

    test('should fail validation with missing password', async () => {
      const req = {
        body: {
          email: 'test@example.com'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateLogin);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'La contraseña es requerida'
          })
        ])
      });
    });

    test('should fail validation with invalid email format', async () => {
      const req = {
        body: {
          email: 'invalid-email',
          contraseña: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateLogin);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Por favor ingresa un email válido'
          })
        ])
      });
    });

    test('should fail validation with empty fields', async () => {
      const req = {
        body: {
          email: '',
          contraseña: ''
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateLogin);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'El email es requerido'
          }),
          expect.objectContaining({
            msg: 'La contraseña es requerida'
          })
        ])
      });
    });

    test('should fail validation with whitespace-only fields', async () => {
      const req = {
        body: {
          email: '   ',
          contraseña: '   '
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const middleware = mockValidation(validateLogin);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de entrada inválidos',
        details: expect.arrayContaining([
          expect.objectContaining({
            msg: 'El email es requerido'
          }),
          expect.objectContaining({
            msg: 'La contraseña es requerida'
          })
        ])
      });
    });
  });
});
