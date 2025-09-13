// Diagnóstico de reCAPTCHA
console.log('🔍 Diagnóstico de reCAPTCHA');
console.log('');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('NEXT_PUBLIC_RECAPTCHA_SITE_KEY:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
console.log('RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
console.log('');

// Verificar formato de las claves
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const secretKey = process.env.RECAPTCHA_SECRET_KEY;

console.log('🔑 Análisis de claves:');
if (siteKey) {
    console.log('Site Key longitud:', siteKey.length);
    console.log('Site Key formato válido:', siteKey.startsWith('6L') && siteKey.length === 40);
} else {
    console.log('❌ Site Key no encontrada');
}

if (secretKey) {
    console.log('Secret Key longitud:', secretKey.length);
    console.log('Secret Key formato válido:', secretKey.startsWith('6L') && secretKey.length === 40);
} else {
    console.log('❌ Secret Key no encontrada');
}

console.log('');
console.log('🌐 Para solucionar el error "tipo de clave no válido":');
console.log('1. Ve a: https://www.google.com/recaptcha/admin');
console.log('2. Verifica que el sitio esté configurado como "reCAPTCHA v2 - Checkbox"');
console.log('3. Asegúrate de que "localhost" esté en la lista de dominios');
console.log('4. Copia las claves exactamente como aparecen');