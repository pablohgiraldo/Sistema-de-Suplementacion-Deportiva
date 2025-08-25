import mongoose from "mongoose";

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

    // Configuración de conexión
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(uri, options);
    console.log("✅ MongoDB conectado exitosamente");

    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);

    // Dar más información sobre el error
    if (err.message.includes("ENOTFOUND")) {
      console.error("💡 Verifica que la URI de MongoDB sea correcta");
      console.error("💡 Asegúrate de incluir el nombre del cluster completo");
      console.error("💡 Ejemplo: mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains");
    }

    if (err.message.includes("Authentication failed")) {
      console.error("💡 Verifica usuario y contraseña de MongoDB");
    }

    process.exit(1);
  }
}
