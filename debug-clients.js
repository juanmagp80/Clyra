// SCRIPT DE DEBUG PARA COPIAR Y PEGAR EN LA CONSOLA DEL NAVEGADOR
// Ejecuta esto en la consola cuando tengas el modal abierto

console.log('=== DEBUG CLIENTES EN COMUNICACIONES ===');

// 1. Verificar variables de entorno
console.log('🔧 Variables de entorno:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'No disponible en cliente');
console.log('URL actual:', window.location.href);

// 2. Verificar estado de React
const reactFiberNode = document.querySelector('[data-reactroot]') || document.querySelector('#__next');
if (reactFiberNode && reactFiberNode._reactInternalFiber) {
    console.log('🔍 React Fiber encontrado');
} else {
    console.log('⚠️ No se pudo acceder al estado de React');
}

// 3. Verificar localStorage/sessionStorage
console.log('💾 Storage:');
console.log('localStorage keys:', Object.keys(localStorage));
console.log('sessionStorage keys:', Object.keys(sessionStorage));

// 4. Verificar cookies de Supabase
console.log('🍪 Cookies de Supabase:');
const supabaseCookies = document.cookie.split(';')
    .filter(cookie => cookie.trim().startsWith('sb-'))
    .map(cookie => cookie.trim().split('=')[0]);
console.log('Supabase cookies:', supabaseCookies);

// 5. Verificar red
console.log('🌐 Realizando prueba de conexión...');
fetch('/api/client-portal/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'test' })
})
    .then(r => r.json())
    .then(data => console.log('✅ API funciona:', data))
    .catch(err => console.log('❌ Error en API:', err));

console.log('=== FIN DEBUG ===');
