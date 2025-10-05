// Global setup para pruebas E2E
async function globalSetup(config) {
    console.log('🚀 Configurando entorno de pruebas E2E...');

    // Crear directorio para screenshots de debug si no existe
    const fs = require('fs');
    const path = require('path');

    const debugDir = path.join(__dirname, '..', 'debug-screenshots');
    if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
    }

    // Limpiar screenshots de debug anteriores
    const files = fs.readdirSync(debugDir);
    for (const file of files) {
        if (file.endsWith('.png')) {
            fs.unlinkSync(path.join(debugDir, file));
        }
    }

    console.log('✅ Entorno de pruebas configurado correctamente');
}

module.exports = globalSetup;
