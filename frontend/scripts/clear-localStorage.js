// Script para limpiar localStorage del carrito
// Ejecutar en la consola del navegador (F12)

console.log('🧹 Limpiando localStorage del carrito...');

// Mostrar datos actuales
const currentCart = localStorage.getItem('supergains_cart');
if (currentCart) {
    console.log('📦 Datos actuales del carrito:', JSON.parse(currentCart));
} else {
    console.log('📦 No hay datos del carrito en localStorage');
}

// Limpiar localStorage
localStorage.removeItem('supergains_cart');
localStorage.removeItem('supergains_auth');

console.log('✅ localStorage limpiado');
console.log('🔄 Recarga la página para probar con datos frescos');
