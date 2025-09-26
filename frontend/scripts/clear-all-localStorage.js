// Script para limpiar completamente el localStorage
// Ejecutar en la consola del navegador (F12)

console.log('🧹 Limpiando completamente el localStorage...');

// Mostrar datos actuales
console.log('📦 Datos actuales:');
console.log('supergains_cart:', localStorage.getItem('supergains_cart'));
console.log('supergains_auth:', localStorage.getItem('supergains_auth'));

// Limpiar todo
localStorage.clear();

console.log('✅ localStorage completamente limpiado');
console.log('🔄 Recarga la página para empezar limpio');
