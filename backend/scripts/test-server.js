import "dotenv/config";
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🧪 Probando servidor local...");
console.log("📋 Variables de entorno:");
console.log("   MONGODB_URI:", process.env.MONGODB_URI ? "✅ Definida" : "❌ No definida");
console.log("   CORS_ORIGIN:", process.env.CORS_ORIGIN || "No definida");
console.log("   NODE_ENV:", process.env.NODE_ENV || "development");
console.log("   PORT:", process.env.PORT || "4000");

if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI no está definida");
    console.log("💡 Crea un archivo .env con tus variables o usa env.example");
    process.exit(1);
}

console.log("\n🚀 Iniciando servidor...");
console.log("💡 Presiona Ctrl+C para detener");

// Iniciar el servidor
const server = spawn('node', ['src/server.js'], {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env
});

server.on('error', (error) => {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ Servidor terminó con código ${code}`);
        process.exit(code);
    }
});
