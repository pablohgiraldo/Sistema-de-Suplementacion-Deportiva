import 'dotenv/config';
import { getRedisClient, closeRedisConnection, checkRedisHealth } from '../src/config/redis.js';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

async function run() {
    console.log('\n' + '='.repeat(60));
    log(colors.cyan, '🧪 PRUEBA DE CONEXIÓN REDIS');
    console.log('='.repeat(60) + '\n');

    try {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = process.env.REDIS_PORT || 6379;
        const db = process.env.REDIS_DB || 0;
        console.log(`🔌 Config: host=${host} port=${port} db=${db}`);

        // Verificar salud
        const healthy = await checkRedisHealth();
        if (!healthy) {
            log(colors.yellow, '⚠️  Redis no respondió al PING (puede estar apagado o inaccesible)');
        } else {
            log(colors.green, '✅ Redis respondió PONG');
        }

        // Operaciones básicas
        const client = getRedisClient();
        const key = `test:redis:${Date.now()}`;
        const value = JSON.stringify({ timestamp: new Date().toISOString() });

        // set con expiración 10s
        await client.set(key, value, 'EX', 10);
        log(colors.blue, `💾 SET ${key} (ttl=10s)`);

        const read = await client.get(key);
        log(colors.green, `📖 GET ${key} -> ${read ? 'OK' : 'NULL'}`);

        const ttl = await client.ttl(key);
        console.log(`⏱️  TTL ${key} -> ${ttl}s`);

        await client.del(key);
        log(colors.blue, `🗑️  DEL ${key}`);

        await closeRedisConnection();
        log(colors.green, '\n✅ Prueba de Redis completada correctamente\n');
        process.exit(0);
    } catch (err) {
        log(colors.red, '\n❌ Error en prueba de Redis:');
        console.error(err.message);
        process.exit(1);
    }
}

run();
