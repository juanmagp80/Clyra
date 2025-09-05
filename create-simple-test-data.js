#!/usr/bin/env node

/**
 * 🧪 Script simplificado para crear datos de prueba
 * Funciona directamente con los datos existentes sin crear nuevos usuarios
 */

// Cargar variables de entorno
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSimpleTestData() {
    console.log('🧪 Creando datos de prueba simplificados...\n');

    try {
        // 1. Obtener un usuario existente de la base de datos
        console.log('🔍 Buscando perfil de usuario existente...');
        const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('id, email')
            .limit(1);

        let userId = null;
        if (existingProfiles && existingProfiles.length > 0) {
            userId = existingProfiles[0].id;
            console.log('✅ Perfil encontrado:', existingProfiles[0].email, '- ID:', userId);
        } else {
            console.log('⚠️ No se encontraron perfiles. Creando perfil de prueba...');
            
            // Intentar crear un perfil de prueba
            try {
                const testUUID = crypto.randomUUID ? crypto.randomUUID() : '12345678-1234-5678-9abc-123456789def';
                const { data: newProfile, error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: testUUID,
                        email: 'test@clyra.com',
                        full_name: 'Usuario de Prueba',
                        company: 'Clyra Testing',
                        phone: '+34 600 000 000'
                    })
                    .select()
                    .single();

                if (!profileError && newProfile) {
                    userId = newProfile.id;
                    console.log('✅ Perfil de prueba creado:', newProfile.email);
                } else {
                    console.log('⚠️ Error creando perfil:', profileError?.message);
                    console.log('💡 Tip: Registra un usuario en la aplicación primero');
                    return;
                }
            } catch (createError) {
                console.log('⚠️ No se pudo crear perfil automáticamente');
                console.log('💡 Solución: Ve a tu aplicación y regístrate como usuario');
                console.log('💡 Luego ejecuta este script nuevamente');
                return;
            }
        }

        // 2. Limpiar datos de prueba existentes
        console.log('\n🧹 Limpiando datos de prueba previos...');
        await supabase.from('clients').delete().in('email', ['maria.test@techstart.com', 'carlos.test@innovacorp.es']);
        console.log('✅ Limpieza completada');

        // 3. Crear cliente de prueba con timestamp reciente
        console.log('\n👤 Creando cliente con contrato reciente...');
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                user_id: userId,
                name: 'María González Test',
                company: 'TechStart Innovation (Prueba)',
                email: 'maria.test@techstart.com',
                phone: '+34 600 123 456',
                address: 'Calle Mayor 123',
                city: 'Madrid',
                province: 'Madrid',
                nif: '12345678A'
            })
            .select()
            .single();

        if (clientError) {
            console.error('❌ Error creando cliente:', clientError);
            return;
        }

        console.log('✅ Cliente creado:', client.name);

        // 4. Crear proyecto en progreso
        console.log('\n📁 Creando proyecto...');
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                client_id: client.id,
                name: 'App Móvil Testing',
                status: 'in_progress',
                budget: 5000,
                start_date: new Date().toISOString(),
                description: 'Proyecto de prueba para testing del detector automático'
            })
            .select()
            .single();

        if (projectError) {
            console.error('❌ Error creando proyecto:', projectError);
            return;
        }

        console.log('✅ Proyecto creado:', project.name);

        // 5. Crear contrato recién firmado (CLAVE PARA EL DETECTOR)
        console.log('\n📋 Creando contrato recién firmado...');
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert({
                user_id: userId,
                client_id: client.id,
                title: 'Contrato Testing - App Móvil',
                contract_value: 5000,
                status: 'signed', // ¡ESTO ES LO QUE DETECTARÁ EL SISTEMA!
                start_date: new Date().toISOString(),
                signed_at: new Date().toISOString(), // Firmado ahora
                end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días
                description: 'Contrato de prueba para verificar detección automática',
                project_details: 'Desarrollo de aplicación móvil de testing',
                payment_terms: '100% al inicio'
            })
            .select()
            .single();

        if (contractError) {
            console.error('❌ Error creando contrato:', contractError);
            return;
        }

        console.log('✅ Contrato FIRMADO creado:', contract.title);
        console.log('   📅 Firmado:', new Date(contract.signed_at).toLocaleString());
        console.log('   💰 Valor:', contract.contract_value, '€');

        // 6. Crear factura pagada reciente
        console.log('\n💰 Creando factura pagada...');
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: userId,
                client_id: client.id,
                project_id: project.id,
                invoice_number: `INV-TEST-${Math.floor(Math.random() * 1000)}`,
                amount: 2500,
                total_amount: 2500,
                status: 'paid', // ¡ESTO TAMBIÉN SERÁ DETECTADO!
                invoice_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
                paid_date: new Date().toISOString(), // Pagado hoy
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Pago inicial - Testing automático',
                title: 'Factura Testing - Pago Inicial'
            })
            .select()
            .single();

        if (invoiceError) {
            console.error('❌ Error creando factura:', invoiceError);
            return;
        }

        console.log('✅ Factura PAGADA creada:', invoice.invoice_number);
        console.log('   📅 Pagada:', new Date(invoice.paid_date).toLocaleString());
        console.log('   💰 Monto:', invoice.amount, '€');

        // 7. Crear segundo cliente reciente
        console.log('\n👤 Creando segundo cliente reciente...');
        const { data: client2, error: client2Error } = await supabase
            .from('clients')
            .insert({
                user_id: userId,
                name: 'Carlos López Test',
                company: 'InnovaCorp Testing',
                email: 'carlos.test@innovacorp.es',
                phone: '+34 600 789 012',
                address: 'Paseo Castellana 456',
                city: 'Madrid',
                province: 'Madrid',
                nif: '87654321B',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Hace 2 horas
            })
            .select()
            .single();

        if (client2Error) {
            console.error('❌ Error creando segundo cliente:', client2Error);
        } else {
            console.log('✅ Segundo cliente creado:', client2.name);
            console.log('   📅 Registrado:', new Date(client2.created_at).toLocaleString());
        }

        // RESUMEN DE EVENTOS CREADOS
        console.log('\n🎯 ¡Datos de prueba creados exitosamente!\n');
        console.log('📊 Eventos que el detector debería encontrar:');
        console.log('   📋 1 contrato firmado (hace minutos)');
        console.log('   💰 1 pago recibido (hace minutos)');
        console.log('   👤 1 cliente nuevo (hace 2 horas)');
        console.log(`   🔧 Usuario ID utilizado: ${userId}`);

        console.log('\n🔍 Comandos de prueba:');
        console.log('   node test-auto-detector.js');
        console.log('   curl "http://localhost:3000/api/ai/workflows/auto?userId=' + userId + '&hours=24"');

        console.log('\n💡 En la interfaz web:');
        console.log('   Dashboard → Automatizaciones IA → Detector Automático');
        console.log('   Configurar período: 24 horas');
        console.log('   ¡Debería detectar los 3 eventos creados!');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Función para limpiar solo datos de prueba
async function cleanTestData() {
    console.log('🧹 Limpiando datos de prueba...');
    
    try {
        await supabase.from('invoices').delete().like('invoice_number', 'INV-TEST-%');
        await supabase.from('contracts').delete().like('title', '%Testing%');
        await supabase.from('projects').delete().like('name', '%Testing%');
        await supabase.from('clients').delete().in('email', ['maria.test@techstart.com', 'carlos.test@innovacorp.es']);
        
        console.log('✅ Datos de prueba eliminados');
    } catch (error) {
        console.log('⚠️ Error limpiando:', error.message);
    }
}

// Ejecutar script
async function main() {
    const action = process.argv[2];
    
    if (action === 'clean') {
        await cleanTestData();
    } else if (action === 'create' || !action) {
        await cleanTestData();
        await createSimpleTestData();
    } else {
        console.log('📖 Uso:');
        console.log('   node create-simple-test-data.js        # Crear datos de prueba');
        console.log('   node create-simple-test-data.js create # Crear datos de prueba');
        console.log('   node create-simple-test-data.js clean  # Limpiar datos de prueba');
    }
}

main().catch(console.error);
