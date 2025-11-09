import request from 'supertest';
import express from 'express';
import ContactMessage from '../../src/models/ContactMessage.js';
import { createContactMessage } from '../../src/controllers/contactController.js';
import { contactRateLimit } from '../../src/middleware/rateLimitMiddleware.js';

const buildTestApp = () => {
    const app = express();
    app.use(express.json());
    app.post('/contact', contactRateLimit, createContactMessage);
    return app;
};

describe('Contact Controller', () => {
    let app;

    beforeEach(() => {
        app = buildTestApp();
    });

    it('debería crear un mensaje de contacto exitosamente', async () => {
        const payload = {
            nombre: 'Juan Pérez',
            email: 'JPerez@Example.com',
            telefono: '+57 300 123 4567',
            asunto: 'Ayuda con mi pedido',
            mensaje: 'Hola, necesito ayuda con el estado de mi pedido.',
            tipoConsulta: 'pedido'
        };

        const response = await request(app)
            .post('/contact')
            .send(payload)
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');

        const storedMessage = await ContactMessage.findOne({ email: payload.email.toLowerCase() });
        expect(storedMessage).not.toBeNull();
        expect(storedMessage.nombre).toBe(payload.nombre);
        expect(storedMessage.tipoConsulta).toBe(payload.tipoConsulta);
        expect(storedMessage.mensaje).toBe(payload.mensaje);
    });

    it('debería devolver error de validación cuando faltan campos obligatorios', async () => {
        const response = await request(app)
            .post('/contact')
            .send({
                nombre: '',
                email: '',
                asunto: '',
                mensaje: ''
            })
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Faltan campos obligatorios');
        expect(Array.isArray(response.body.details)).toBe(true);
        expect(response.body.details.length).toBeGreaterThan(0);
    });
});

