#!/usr/bin/env node

// Test del sistema de emails IA
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testEmailSystem() {
    console.log('🧪 Probando Sistema de Emails IA');
    console.log('================================\n');

    try {
        // Test 1: Verificar endpoint de detección automática
        console.log('1️⃣ Probando detección automática de eventos...');

        const autoResponse = await fetch(`${BASE_URL}/api/ai/workflows/auto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                autoDetect: true,
                userId: 'test@taskelio.app' // Email de prueba
            })
        });

        const autoResult = await autoResponse.json();
        console.log('Respuesta de detección automática:', autoResult);

        if (autoResponse.ok) {
            console.log('✅ Detección automática funciona');
            console.log(`📊 Eventos procesados: ${autoResult.processedEvents}`);
        } else {
            console.log('❌ Error en detección automática:', autoResult.error);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Probar generación de email específico
        console.log('2️⃣ Probando generación de email específico...');

        const specificResponse = await fetch(`${BASE_URL}/api/ai/workflows/auto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventType: 'contract_signed',
                entityId: 'test-contract-id',
                userId: 'test@taskelio.app'
            })
        });

        const specificResult = await specificResponse.json();
        console.log('Respuesta de email específico:', specificResult);

        if (specificResponse.ok) {
            console.log('✅ Generación de email específico funciona');
            if (specificResult.email) {
                console.log('📧 Email generado:');
                console.log(`   Asunto: ${specificResult.email.subject}`);
                console.log(`   Tono: ${specificResult.email.tone}`);
                console.log(`   Próximos pasos: ${specificResult.email.next_steps?.length || 0}`);
            }
        } else {
            console.log('❌ Error en generación específica:', specificResult.error);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Verificar endpoint de automatizaciones IA
        console.log('3️⃣ Probando endpoint de automatizaciones IA...');

        const aiResponse = await fetch(`${BASE_URL}/api/ai/automations/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'smart_email',
                data: {
                    trigger: 'test',
                    context: 'Prueba del sistema',
                    clientId: 'test-client'
                },
                userId: 'test@taskelio.app'
            })
        });

        const aiResult = await aiResponse.json();
        console.log('Respuesta de automatización IA:', aiResult);

        if (aiResponse.ok) {
            console.log('✅ Endpoint de automatizaciones IA funciona');
        } else {
            console.log('❌ Error en automatizaciones IA:', aiResult.error);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 4: Verificar si hay eventos recientes
        console.log('4️⃣ Verificando eventos recientes...');

        const eventsResponse = await fetch(`${BASE_URL}/api/ai/workflows/auto?userId=test@taskelio.app&hours=24`);
        const eventsResult = await eventsResponse.json();

        console.log('Eventos recientes:', eventsResult);

        if (eventsResponse.ok) {
            console.log('✅ Consulta de eventos funciona');
            console.log(`📅 Eventos encontrados: ${eventsResult.eventsFound}`);
        } else {
            console.log('❌ Error consultando eventos:', eventsResult.error);
        }

    } catch (error) {
        console.error('💥 Error crítico en las pruebas:', error.message);
    }

    console.log('\n🏁 Pruebas completadas');
}

// Verificar que el servidor esté funcionando
async function checkServer() {
    try {
        const response = await fetch(`${BASE_URL}/api/test/ping`);
        if (response.ok) {
            console.log('✅ Servidor funcionando en', BASE_URL);
            return true;
        }
    } catch (error) {
        console.log('❌ Servidor no disponible en', BASE_URL);
        console.log('   Asegúrate de que npm run dev esté ejecutándose');
        return false;
    }
}

// Ejecutar pruebas
async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testEmailSystem();
    }
}

main();
