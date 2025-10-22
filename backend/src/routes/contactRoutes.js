import express from "express";
import {
    createContactMessage,
    getContactMessages,
    getContactMessageById,
    updateContactMessageStatus,
    deleteContactMessage,
    getContactStats
} from "../controllers/contactController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { sanitizeInput, detectCommonAttacks } from "../middleware/inputValidationMiddleware.js";
import { contactRateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Aplicar middlewares de seguridad a todas las rutas
router.use(sanitizeInput);
router.use(detectCommonAttacks);

// Ruta pública para crear mensajes de contacto
router.post("/",
    contactRateLimit,
    createContactMessage
);

// Rutas protegidas para administradores
router.get("/",
    authMiddleware,
    requireAdmin,
    getContactMessages
);

router.get("/stats",
    authMiddleware,
    requireAdmin,
    getContactStats
);

router.get("/:id",
    authMiddleware,
    requireAdmin,
    getContactMessageById
);

router.put("/:id/status",
    authMiddleware,
    requireAdmin,
    updateContactMessageStatus
);

router.delete("/:id",
    authMiddleware,
    requireAdmin,
    deleteContactMessage
);

export default router;
