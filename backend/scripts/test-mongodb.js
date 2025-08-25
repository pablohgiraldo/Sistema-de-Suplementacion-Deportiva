import "dotenv/config";
import { connectDB } from "../src/config/db.js";

async function testMongoDB() {
    console.log("🧪 Probando conexión a MongoDB...");
    console.log("📋 Variables de entorno:");
    console.log("   MONGODB_URI:", process.env.MONGODB_URI ? "✅ Definida" : "❌ No definida");
    console.log("   NODE_ENV:", process.env.NODE_ENV || "development");
    console.log("   PORT:", process.env.PORT || "4000");

    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI no está definida");
        console.log("💡 Crea un archivo .env con MONGODB_URI");
        process.exit(1);
    }

    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("✅ Conexión exitosa a MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error en la conexión:", error.message);
        process.exit(1);
    }
}

testMongoDB();
