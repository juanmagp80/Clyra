#!/usr/bin/env node

/**
 * 🧪 Script para crear datos de prueba realistas
 * Crea clientes, contratos, proyectos y eventos para probar el detector automático
 */

// Cargar variables de entorno
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Usuario de prueba - Obtener usuario real existente
let TEST_USER_ID = null;
const TEST_USER_EMAIL = 'test@clyra.com';

async function getOrCreateTestUser() {
    // Primero intentar obtener un usuario existente
    const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (existingUsers && existingUsers.length > 0) {
        TEST_USER_ID = existingUsers[0].id;
        console.log('🔍 Usando usuario existente:', TEST_USER_ID);
        return TEST_USER_ID;
    }

    // Si no hay usuarios, intentar crear uno (esto puede fallar si la tabla users tiene restricciones)
    try {
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email: TEST_USER_EMAIL,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (!error && newUser) {
            TEST_USER_ID = newUser.id;
            console.log('✅ Usuario de prueba creado:', TEST_USER_ID);
            return TEST_USER_ID;
        }
    } catch (err) {
        console.log('⚠️ No se pudo crear usuario en tabla users');
    }

    // Como último recurso, usar un UUID que probablemente funcione
    TEST_USER_ID = '00000000-0000-0000-0000-000000000000';
    console.log('⚠️ Usando UUID genérico:', TEST_USER_ID);
    return TEST_USER_ID;
}

async function createTestData() {
    console.log('🧪 Creando datos de prueba para el detector automático...\n');

    try {
        // 0. Obtener o crear usuario de prueba
        await getOrCreateTestUser();
        
        if (!TEST_USER_ID) {
            console.error('❌ No se pudo obtener un user_id válido');
            return;
        }

        // 1. Crear cliente de prueba
        console.log('👤 1. Creando cliente de prueba...');
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                user_id: TEST_USER_ID,
                name: 'María González',
                company: 'TechStart Innovation',
                email: 'maria@techstart.com',
                phone: '+34 600 123 456',
                address: 'Calle Mayor 123',
                city: 'Madrid',
                province: 'Madrid',
                nif: '12345678A',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (clientError) {
            console.error('❌ Error creando cliente:', clientError);
            return;
        }
        console.log('✅ Cliente creado:', client.name, '-', client.company);

        // 2. Crear proyecto de prueba
        console.log('\n📁 2. Creando proyecto de prueba...');
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                user_id: TEST_USER_ID,
                client_id: client.id,
                name: 'Desarrollo App Móvil iOS/Android',
                status: 'in_progress',
                budget: 8500,
                start_date: new Date().toISOString(),
                description: 'Desarrollo completo de aplicación móvil para gestión de inventarios'
            })
            .select()
            .single();

        if (projectError) {
            console.error('❌ Error creando proyecto:', projectError);
            return;
        }
        console.log('✅ Proyecto creado:', project.name, '- Budget:', project.budget, '€');

        // 3. Crear contrato recién firmado (para trigger automático)
        console.log('\n📋 3. Creando contrato recién firmado...');
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert({
                user_id: TEST_USER_ID,
                client_id: client.id,
                title: 'Contrato Desarrollo App Móvil - TechStart',
                contract_value: 8500,
                status: 'signed', // ¡Esto debería ser detectado!
                start_date: new Date().toISOString(),
                signed_at: new Date().toISOString(),
                end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 días
                description: 'Desarrollo completo de aplicación móvil para TechStart Innovation',
                project_details: 'App iOS/Android con backend completo',
                payment_terms: '50% inicio, 50% entrega'
            })
            .select()
            .single();

        if (contractError) {
            console.error('❌ Error creando contrato:', contractError);
            return;
        }
        console.log('✅ Contrato firmado:', contract.title, '- Status:', contract.status);

        // 4. Crear factura pagada reciente
        console.log('\n💰 4. Creando factura pagada...');
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: TEST_USER_ID,
                client_id: client.id,
                project_id: project.id,
                invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                amount: 3500, // Primera fase del proyecto
                total_amount: 3500,
                status: 'paid', // ¡Esto debería ser detectado!
                invoice_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
                paid_date: new Date().toISOString(), // Pagado hoy
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // Vencimiento en 15 días
                description: 'Primera fase - Diseño y arquitectura de la aplicación',
                title: 'Factura Primera Fase - App Móvil'
            })
            .select()
            .single();

        if (invoiceError) {
            console.error('❌ Error creando factura:', invoiceError);
            return;
        }
        console.log('✅ Factura pagada:', invoice.invoice_number, '- Monto:', invoice.amount, '€');

        // 5. Crear evento de calendario reciente
        console.log('\n📅 5. Creando evento de calendario...');
        const { data: event, error: eventError } = await supabase
            .from('calendar_events')
            .insert({
                user_id: TEST_USER_ID,
                client_id: client.id,
                project_id: project.id,
                title: 'Reunión Kickoff - Desarrollo App Móvil',
                description: 'Reunión inicial para definir requirements y timeline del proyecto',
                start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // En 2 días
                end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hora de duración
                location: 'Oficina TechStart Innovation',
                type: 'meeting',
                status: 'scheduled',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (eventError) {
            console.error('❌ Error creando evento:', eventError);
            return;
        }
        console.log('✅ Evento creado:', event.title);

        // 6. Crear un segundo cliente para más datos
        console.log('\n👤 6. Creando segundo cliente...');
        const { data: client2, error: client2Error } = await supabase
            .from('clients')
            .insert({
                user_id: TEST_USER_ID,
                name: 'Carlos López',
                company: 'InnovaCorp Solutions',
                email: 'carlos@innovacorp.es',
                phone: '+34 600 789 012',
                address: 'Paseo de la Castellana 456',
                city: 'Madrid',
                province: 'Madrid',
                nif: '87654321B',
                created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // Hace 1 hora
            })
            .select()
            .single();

        if (client2Error) {
            console.error('❌ Error creando segundo cliente:', client2Error);
        } else {
            console.log('✅ Segundo cliente creado:', client2.name, '-', client2.company);
        }

        // 7. Proyecto completado para el segundo cliente
        console.log('\n🎉 7. Creando proyecto completado...');
        const { data: project2, error: project2Error } = await supabase
            .from('projects')
            .insert({
                user_id: TEST_USER_ID,
                client_id: client2.id,
                name: 'Rediseño Web Corporativo',
                status: 'completed', // ¡Esto debería ser detectado!
                budget: 4200,
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Hace 30 días
                end_date: new Date().toISOString(), // Completado hoy
                description: 'Rediseño completo del sitio web corporativo con nueva identidad visual'
            })
            .select()
            .single();

        if (project2Error) {
            console.error('❌ Error creando proyecto completado:', project2Error);
        } else {
            console.log('✅ Proyecto completado:', project2.name, '- Status:', project2.status);
        }

        // Resumen de datos creados
        console.log('\n🎯 ¡Datos de prueba creados exitosamente!\n');
        console.log('📊 Resumen de eventos que deberían ser detectados:');
        console.log('   📋 1 contrato firmado (María González - TechStart)');
        console.log('   💰 1 pago recibido (€3,500 - Primera fase)');
        console.log('   🎉 1 proyecto completado (Carlos López - Rediseño Web)');
        console.log('   👤 1 cliente nuevo (Carlos López - hace 1 hora)');
        console.log('   📅 1 reunión programada (Kickoff en 2 días)');

        console.log('\n🔍 Ahora ejecuta:');
        console.log('   node test-auto-detector.js');
        console.log('\n💡 O prueba desde la interfaz:');
        console.log('   Dashboard → Automatizaciones IA → Detector Automático');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

async function cleanTestData() {
    console.log('🧹 Limpiando datos de prueba existentes...');
    
    try {
        // Si no tenemos TEST_USER_ID, intentar obtenerlo
        if (!TEST_USER_ID) {
            await getOrCreateTestUser();
        }

        if (TEST_USER_ID) {
            // Eliminar en orden inverso por dependencias
            await supabase.from('calendar_events').delete().eq('user_id', TEST_USER_ID);
            await supabase.from('invoices').delete().eq('user_id', TEST_USER_ID);
            await supabase.from('contracts').delete().eq('user_id', TEST_USER_ID);
            await supabase.from('projects').delete().eq('user_id', TEST_USER_ID);
            await supabase.from('clients').delete().eq('user_id', TEST_USER_ID);
        }
        
        // También limpiar por email de cliente si existe
        await supabase.from('clients').delete().in('email', ['maria@techstart.com', 'carlos@innovacorp.es']);
        
        console.log('✅ Datos de prueba eliminados');
    } catch (error) {
        console.log('⚠️ Error limpiando datos (normal si no existían):', error.message);
    }
}

// Ejecutar script
async function main() {
    const action = process.argv[2];
    
    if (action === 'clean') {
        await cleanTestData();
    } else if (action === 'create' || !action) {
        await cleanTestData();
        await createTestData();
    } else {
        console.log('📖 Uso:');
        console.log('   node create-test-data.js        # Crear datos de prueba');
        console.log('   node create-test-data.js create # Crear datos de prueba');
        console.log('   node create-test-data.js clean  # Limpiar datos de prueba');
    }
}

main().catch(console.error);
