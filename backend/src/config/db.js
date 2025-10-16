import mongoose from "mongoose";
import fallbackService from "../services/fallbackService.js";
import databaseAlertService from "../services/databaseAlertService.js";

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 segundos

export async function connectDB(uri) {
  try {
    // Validar que la URI esté presente
    if (!uri) {
      throw new Error("MONGODB_URI no está definida en las variables de entorno");
    }

    // Validar formato básico de la URI
    if (!uri.includes("mongodb+srv://") && !uri.includes("mongodb://")) {
      throw new Error("URI de MongoDB inválida. Debe comenzar con 'mongodb+srv://' o 'mongodb://'");
    }

    // Configuración de conexión con auto-reconexión
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(uri, options);
    console.log("✅ MongoDB conectado exitosamente");
    reconnectAttempts = 0; // Resetear contador de reconexiones
    fallbackService.checkMongoDBStatus(true);

    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión MongoDB:', err.message);
      fallbackService.checkMongoDBStatus(false);
      databaseAlertService.sendDatabaseDownAlert(err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
      fallbackService.checkMongoDBStatus(false);
      databaseAlertService.sendDatabaseDownAlert(new Error('MongoDB disconnected'));
      attemptReconnection(uri);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado exitosamente');
      reconnectAttempts = 0;
      fallbackService.checkMongoDBStatus(true);
      databaseAlertService.sendDatabaseRecoveredAlert();
    });

    mongoose.connection.on('connecting', () => {
      console.log('🔄 Intentando conectar a MongoDB...');
    });

  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    fallbackService.checkMongoDBStatus(false);
    databaseAlertService.sendDatabaseDownAlert(err);

    // Dar más información sobre el error
    if (err.message.includes("ENOTFOUND")) {
      console.error("💡 Verifica que la URI de MongoDB sea correcta");
      console.error("💡 Asegúrate de incluir el nombre del cluster completo");
      console.error("💡 Ejemplo: mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains");
    }

    if (err.message.includes("Authentication failed")) {
      console.error("💡 Verifica usuario y contraseña de MongoDB");
    }

    // No terminar el proceso - activar modo fallback
    console.warn("⚠️ Servidor iniciando en MODO FALLBACK (sin MongoDB)");
    console.warn("⚠️ Algunas funcionalidades estarán limitadas");
    
    // Intentar reconectar después de un tiempo
    attemptReconnection(uri);
  }
}

/**
 * Intentar reconectar a MongoDB automáticamente
 */
function attemptReconnection(uri) {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`❌ Máximo de intentos de reconexión alcanzado (${MAX_RECONNECT_ATTEMPTS})`);
    console.error('❌ Sistema operando en modo fallback permanente');
    return;
  }

  reconnectAttempts++;
  console.log(`🔄 Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} en ${RECONNECT_INTERVAL/1000}s...`);

  setTimeout(async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        console.log('🔄 Reconectando a MongoDB...');
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log('✅ Reconexión exitosa a MongoDB');
        reconnectAttempts = 0;
        fallbackService.checkMongoDBStatus(true);
        databaseAlertService.sendDatabaseRecoveredAlert();
      }
    } catch (error) {
      console.error(`❌ Fallo intento ${reconnectAttempts}: ${error.message}`);
      fallbackService.checkMongoDBStatus(false);
      if (reconnectAttempts === MAX_RECONNECT_ATTEMPTS) {
        databaseAlertService.sendDatabaseDownAlert(new Error('Max reconnection attempts reached'));
      }
      attemptReconnection(uri);
    }
  }, RECONNECT_INTERVAL);
}

/**
 * Verificar estado de MongoDB
 */
export function checkMongoDBHealth() {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return {
    connected: state === 1,
    connecting: state === 2,
    disconnected: state === 0,
    disconnecting: state === 3,
    state: state,
    stateName: ['disconnected', 'connected', 'connecting', 'disconnecting'][state]
  };
}

/**
 * Forzar reconexión manual
 */
export async function forceReconnect(uri) {
  console.log('🔄 Forzando reconexión manual a MongoDB...');
  reconnectAttempts = 0;
  
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await connectDB(uri);
    return true;
  } catch (error) {
    console.error('❌ Error en reconexión forzada:', error.message);
    return false;
  }
}
