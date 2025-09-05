// Script de prueba para el Detector Automático de Eventos
// Ejecutar con: node test-auto-detector.js

async function testAutoDetector() {
    const baseUrl = 'http://localhost:3000';
    
    // Usar el userId real de los datos de prueba
    const realUserId = '2478a228-7db8-48e2-b58d-66368b15cf01'; // Usuario real de los datos de prueba
    const testUserId = 'test@example.com'; // Usuario de prueba genérico
    
    console.log('🔍 Probando Detector Automático de Eventos...\n');
    
    // Prueba 1: Detectar eventos recientes con usuario real
    console.log('📋 Prueba 1: Detectar eventos recientes (Usuario Real)');
    try {
        const response = await fetch(`${baseUrl}/api/ai/workflows/auto?userId=${realUserId}&hours=24`, {
            method: 'GET'
        });
        
        const result = await response.json();
        console.log('✅ Respuesta del detector (Usuario Real):', result);
        
        if (result.events && result.events.length > 0) {
            console.log(`   🎉 Se encontraron ${result.events.length} eventos recientes:`);
            result.events.forEach((event, index) => {
                console.log(`   ${index + 1}. ${event.type}: ${event.description || 'Sin descripción'}`);
                console.log(`      📅 Fecha: ${new Date(event.timestamp).toLocaleString()}`);
                console.log(`      📧 Cliente: ${event.clientName || 'N/A'}`);
            });
        } else {
            console.log('   ℹ️ No se encontraron eventos recientes con usuario real');
        }
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('   💡 ¿Está el servidor corriendo? npm run dev');
        console.log('');
    }

    // Prueba 1b: Detectar eventos recientes con usuario genérico
    console.log('📋 Prueba 1b: Detectar eventos recientes (Usuario Genérico)');
    try {
        const response = await fetch(`${baseUrl}/api/ai/workflows/auto?userId=${testUserId}&hours=24`, {
            method: 'GET'
        });
        
        const result = await response.json();
        console.log('✅ Respuesta del detector (Usuario Genérico):', result);
        
        if (result.events && result.events.length > 0) {
            console.log(`   🎉 Se encontraron ${result.events.length} eventos recientes:`);
            result.events.forEach((event, index) => {
                console.log(`   ${index + 1}. ${event.type}: ${event.description || 'Sin descripción'}`);
                console.log(`      📅 Fecha: ${new Date(event.timestamp).toLocaleString()}`);
                console.log(`      📧 Cliente: ${event.clientName || 'N/A'}`);
            });
        } else {
            console.log('   ℹ️ No se encontraron eventos recientes con usuario genérico');
        }
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }
    
    // Prueba 2: Procesar eventos automáticamente (Usuario Real)
    console.log('🤖 Prueba 2: Procesar eventos automáticamente (Usuario Real)');
    try {
        const processResponse = await fetch(`${baseUrl}/api/ai/workflows/auto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                autoDetect: true,
                userId: realUserId
            })
        });
        
        const processResult = await processResponse.json();
        console.log('✅ Resultado del procesamiento automático (Usuario Real):');
        console.log('   📧 Eventos procesados:', processResult.processedEvents || 0);
        console.log('   📝 Mensaje:', processResult.message);
        
        if (processResult.events && processResult.events.length > 0) {
            console.log('   💡 Emails generados:');
            processResult.events.forEach((eventResult, index) => {
                console.log(`      ${index + 1}. ${eventResult.email?.subject}`);
                console.log(`         📧 Tono: ${eventResult.email?.tone}`);
                console.log(`         🎯 Próximos pasos: ${eventResult.email?.next_steps?.length || 0}`);
            });
        }
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }
    
    // Prueba 2b: Procesar eventos automáticamente (Usuario Genérico)
    console.log('🤖 Prueba 2b: Procesar eventos automáticamente (Usuario Genérico)');
    try {
        const processResponse = await fetch(`${baseUrl}/api/ai/workflows/auto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                autoDetect: true,
                userId: testUserId
            })
        });
        
        const processResult = await processResponse.json();
        console.log('✅ Resultado del procesamiento automático (Usuario Genérico):');
        console.log('   📧 Eventos procesados:', processResult.processedEvents || 0);
        console.log('   📝 Mensaje:', processResult.message);
        
        if (processResult.events && processResult.events.length > 0) {
            console.log('   💡 Emails generados:');
            processResult.events.forEach((eventResult, index) => {
                console.log(`      ${index + 1}. ${eventResult.email?.subject}`);
                console.log(`         📧 Tono: ${eventResult.email?.tone}`);
                console.log(`         🎯 Próximos pasos: ${eventResult.email?.next_steps?.length || 0}`);
            });
        }
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }
    
    // Prueba 3: Simular procesamiento de evento específico
    console.log('📧 Prueba 3: Procesar evento específico (simulado)');
    try {
        // Nota: Esto requeriría un contractId real de la base de datos
        const eventResponse = await fetch(`${baseUrl}/api/ai/workflows/auto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'contract_signed',
                entityId: 'contract_123', // ID simulado
                userId: realUserId, // Usar usuario real
                autoDetect: false
            })
        });
        
        // Esto probablemente falle porque no existe el contrato, pero demuestra el flujo
        const eventResult = await eventResponse.json();
        
        if (eventResponse.ok) {
            console.log('✅ Email generado para evento específico:');
            console.log('   📧 Asunto:', eventResult.email?.subject);
            console.log('   🎯 Evento:', eventResult.eventData?.trigger);
            console.log('   👤 Cliente:', eventResult.eventData?.context?.client?.name);
        } else {
            console.log('⚠️ Esperado: Error porque el contrato no existe');
            console.log('   Error:', eventResult.error);
            console.log('   💡 Esto es normal en el entorno de prueba');
        }
        console.log('');
    } catch (error) {
        console.log('⚠️ Error esperado (contrato simulado):', error.message);
        console.log('');
    }
    
    console.log('🎉 Pruebas del detector automático completadas!');
    console.log('💡 Casos de uso reales:');
    console.log('   • Cliente firma contrato → Email de bienvenida automático');
    console.log('   • Pago recibido → Email de confirmación y próximos pasos');
    console.log('   • Proyecto completado → Email de entrega y feedback');
    console.log('   • Nuevo cliente → Email de onboarding personalizado');
    console.log('');
    console.log('🔄 Para usar en producción:');
    console.log('   1. Configura webhooks o cron jobs para llamar a /api/ai/workflows/auto');
    console.log('   2. Programa ejecución cada hora o cuando ocurran eventos');
    console.log('   3. Los emails se generan automáticamente con datos reales de la DB');
}

// Función para crear datos de prueba (opcional)
async function createTestData() {
    console.log('📊 Creando datos de prueba...');
    console.log('💡 En un entorno real, podrías:');
    console.log('   • Crear un contrato de prueba');
    console.log('   • Marcarlo como "firmado"');
    console.log('   • El detector lo encontraría automáticamente');
    console.log('   • Generaría el email correspondiente');
    console.log('');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    Promise.resolve()
        .then(() => createTestData())
        .then(() => testAutoDetector())
        .catch(console.error);
}

module.exports = { testAutoDetector, createTestData };
