// Script de prueba para el sistema de automatizaciones avanzadas
// Ejecutar con: node test-advanced-automations.js

async function testAutomations() {
    const baseUrl = 'http://localhost:3000';

    console.log('🚀 Iniciando pruebas del sistema de automatizaciones avanzadas...\n');

    // Prueba 1: Proyecto de alto valor
    console.log('📋 Prueba 1: Proyecto Alto Valor');
    const projectData = {
        trigger_type: 'project_created',
        data: {
            project: {
                id: 'proj_001',
                name: 'Desarrollo App Móvil Enterprise',
                budget: 7500,
                client: 'TechCorp SA',
                description: 'Aplicación móvil enterprise con funcionalidades avanzadas de IA'
            },
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response1 = await fetch(`${baseUrl}/api/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        const result1 = await response1.json();
        console.log('✅ Resultado:', result1.message);
        console.log('📊 Automatizaciones ejecutadas:', result1.executedAutomations);
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }

    // Prueba 2: Cliente VIP
    console.log('👑 Prueba 2: Cliente VIP');
    const clientData = {
        trigger_type: 'client_registered',
        data: {
            client: {
                id: 'client_002',
                name: 'María González',
                email: 'maria@techcorp.com',
                tier: 'VIP',
                company: 'TechCorp SA',
                industry: 'Tecnología'
            },
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response2 = await fetch(`${baseUrl}/api/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });

        const result2 = await response2.json();
        console.log('✅ Resultado:', result2.message);
        console.log('📊 Automatizaciones ejecutadas:', result2.executedAutomations);
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }

    // Prueba 3: Proyecto en riesgo
    console.log('⚠️ Prueba 3: Proyecto en Riesgo');
    const riskData = {
        trigger_type: 'project_status_update',
        data: {
            project: {
                id: 'proj_003',
                name: 'Rediseño Web Corporativo',
                status: 'delayed',
                days_overdue: 5,
                client: 'InnovaCorp',
                original_deadline: '2024-01-15',
                current_issues: 'Retrasos en la entrega de contenido por parte del cliente'
            },
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response3 = await fetch(`${baseUrl}/api/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(riskData)
        });

        const result3 = await response3.json();
        console.log('✅ Resultado:', result3.message);
        console.log('📊 Automatizaciones ejecutadas:', result3.executedAutomations);
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }

    // Prueba 4: Sentimiento negativo
    console.log('😟 Prueba 4: Sentimiento Negativo');
    const sentimentData = {
        trigger_type: 'message_received',
        data: {
            message: {
                id: 'msg_004',
                content: 'Estoy muy decepcionado con el progreso del proyecto. Los retrasos son inaceptables.',
                from: 'cliente@empresa.com'
            },
            client: {
                id: 'client_004',
                name: 'Roberto Sánchez',
                email: 'roberto@empresa.com'
            },
            analysis: {
                sentiment: 'negative',
                confidence: 0.92,
                keywords: ['decepcionado', 'retrasos', 'inaceptables']
            },
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response4 = await fetch(`${baseUrl}/api/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sentimentData)
        });

        const result4 = await response4.json();
        console.log('✅ Resultado:', result4.message);
        console.log('📊 Automatizaciones ejecutadas:', result4.executedAutomations);
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }

    console.log('🎉 Pruebas completadas! Revisa los logs de automatización en Supabase.');
}

// Función auxiliar para simular delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar pruebas con delays entre cada una
async function runTests() {
    await testAutomations();
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testAutomations };
