import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    // Para desarrollo local, usar MongoDB local si está disponible
    const localUri = "mongodb://localhost:27017/supergains";
    
    // Intentar conectar a MongoDB local primero
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 2000, // Timeout más corto para desarrollo
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(localUri, options);
      console.log("✅ MongoDB local conectado exitosamente");
      
      // Manejar eventos de conexión
      mongoose.connection.on('error', (err) => {
        console.error('❌ Error de conexión MongoDB:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB desconectado');
      });

      return; // Conexión exitosa
      
    } catch (localError) {
      console.log("⚠️ MongoDB local no disponible, continuando sin base de datos...");
      console.log("💡 Para usar MongoDB local, instala MongoDB Community Server");
      console.log("💡 O configura MongoDB Atlas en el archivo .env");
      
      // No hacer exit(1) para permitir que la app funcione sin DB
      return;
    }

  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    console.log("⚠️ Continuando sin base de datos para desarrollo...");
    return; // No hacer exit para permitir desarrollo
  }
}
