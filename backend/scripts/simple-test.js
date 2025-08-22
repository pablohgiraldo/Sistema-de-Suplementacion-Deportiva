import mongoose from "mongoose";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

async function testConnection() {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/supergains";
        console.log("🔌 Intentando conectar a:", uri);

        await mongoose.connect(uri);
        console.log("✅ Conexión exitosa a MongoDB!");

        // Verificar que la conexión esté activa
        const dbState = mongoose.connection.readyState;
        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };

        console.log(`📊 Estado de la conexión: ${states[dbState]}`);

        // Listar las bases de datos disponibles
        const adminDb = mongoose.connection.db.admin();
        const dbList = await adminDb.listDatabases();
        console.log("\n🗄️ Bases de datos disponibles:");
        dbList.databases.forEach(db => {
            console.log(`   - ${db.name}`);
        });

    } catch (error) {
        console.error("❌ Error de conexión:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Conexión cerrada");
        process.exit(0);
    }
}

testConnection();
