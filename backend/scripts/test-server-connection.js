const API_BASE = 'http://localhost:4000/api';

async function testServerConnection() {
    console.log('🔍 Verificando conexión al servidor...');
    
    try {
        const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log(`✅ Servidor respondiendo - Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.text();
            console.log('📄 Respuesta:', data);
        }
        
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        console.log('💡 Asegúrate de que el servidor backend esté ejecutándose en el puerto 4000');
    }
}

testServerConnection();
