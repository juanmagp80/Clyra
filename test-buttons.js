// TEST DE BOTONES - Ejecutar en la consola del navegador

// Test para botones de login
console.log('🧪 INICIANDO TESTS DE BOTONES');

// Función para simular click en botón
function testButton(selector, name) {
    console.log(`\n🎯 Testing ${name} button...`);
    const button = document.querySelector(selector);
    
    if (!button) {
        console.log(`❌ Button ${name} no encontrado`);
        return false;
    }
    
    console.log(`✅ Button ${name} encontrado:`, button);
    console.log(`📋 Attributes:`, {
        disabled: button.disabled,
        onclick: button.onclick,
        className: button.className
    });
    
    try {
        button.click();
        console.log(`✅ Click ejecutado en ${name}`);
        return true;
    } catch (error) {
        console.log(`❌ Error al hacer click en ${name}:`, error);
        return false;
    }
}

// Esperar 2 segundos y luego probar botones
setTimeout(() => {
    console.log('\n🔍 PROBANDO BOTONES...');
    
    // Test login button
    testButton('button:contains("Iniciar Sesión")', 'Login');
    
    // Test GitHub button
    testButton('button:contains("GitHub")', 'GitHub');
    
    // Test Google button  
    testButton('button:contains("Google")', 'Google');
    
    console.log('\n✅ Tests completados. Revisa los logs arriba para ver si las funciones se ejecutaron.');
}, 2000);

console.log('⏳ Esperando 2 segundos para cargar la página...');
