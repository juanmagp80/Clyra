#!/usr/bin/env node

/**
 * 🧪 Script DIRECTO para crear datos de prueba
 * Evita problemas de foreign keys creando datos mínimos directamente
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

// UUID fijo para evitar problemas de foreign keys
const FIXED_USER_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

async function createDirectTestData() {
    console.log('🧪 Creando datos de prueba DIRECTOS...\n');

    try {
        // 0. Limpiar datos previos
        console.log('🧹 Limpiando datos previos...');
        await supabase.from('invoices').delete().like('invoice_number', 'TEST-%');
        await supabase.from('contracts').delete().like('title', '%TEST%');
        await supabase.from('projects').delete().like('name', '%TEST%');
        await supabase.from('clients').delete().like('email', '%.test@%');

        // 1. Crear cliente directamente (sin foreign key a profiles)
        console.log('👤 Creando cliente de prueba...');
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                user_id: FIXED_USER_UUID, // UUID fijo para evitar foreign key
                name: 'María González',
                company: 'TechStart Innovation',
                email: 'maria.test@techstart.com',
                phone: '+34 600 123 456',
                city: 'Madrid',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (clientError) {
            console.error('❌ Error creando cliente:', clientError);
            console.log('💡 Intentando crear sin user_id...');
            
            // Intentar sin user_id si falla
            const { data: clientNoUser, error: clientNoUserError } = await supabase
                .from('clients')
                .insert({
                    name: 'María González',
                    company: 'TechStart Innovation',
                    email: 'maria.test@techstart.com',
                    phone: '+34 600 123 456',
                    city: 'Madrid',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (clientNoUserError) {
                console.error('❌ Error también sin user_id:', clientNoUserError);
                return;
            }
            
            client = clientNoUser;
        }

        console.log('✅ Cliente creado:', client.name);

        // 2. Crear proyecto
        console.log('\n📁 Creando proyecto...');
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                user_id: FIXED_USER_UUID,
                client_id: client.id,
                name: 'App Móvil TEST',
                status: 'in_progress',
                budget: 5000,
                start_date: new Date().toISOString(),
                description: 'Proyecto de prueba'
            })
            .select()
            .single();

        if (projectError) {
            console.error('❌ Error creando proyecto:', projectError);
            
            // Intentar sin user_id
            const { data: projectNoUser, error: projectNoUserError } = await supabase
                .from('projects')
                .insert({
                    client_id: client.id,
                    name: 'App Móvil TEST',
                    status: 'in_progress',
                    budget: 5000,
                    start_date: new Date().toISOString(),
                    description: 'Proyecto de prueba'
                })
                .select()
                .single();

            if (projectNoUserError) {
                console.error('❌ Error también sin user_id:', projectNoUserError);
                // Continuar sin proyecto
            } else {
                project = projectNoUser;
            }
        }

        if (project) {
            console.log('✅ Proyecto creado:', project.name);
        }

        // 3. Crear contrato FIRMADO recientemente (CLAVE)
        console.log('\n📋 Creando contrato FIRMADO...');
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert({
                user_id: FIXED_USER_UUID,
                client_id: client.id,
                title: 'Contrato TEST - App Móvil',
                contract_value: 5000,
                status: 'signed', // ¡ESTO ES LO QUE DETECTA EL SISTEMA!
                start_date: new Date().toISOString(),
                signed_at: new Date().toISOString(), // Firmado AHORA
                description: 'Contrato de prueba para detector automático',
                project_details: 'Desarrollo app móvil',
                payment_terms: 'Pago único'
            })
            .select()
            .single();

        if (contractError) {
            console.error('❌ Error creando contrato:', contractError);
            
            // Intentar sin user_id
            const { data: contractNoUser, error: contractNoUserError } = await supabase
                .from('contracts')
                .insert({
                    client_id: client.id,
                    title: 'Contrato TEST - App Móvil',
                    contract_value: 5000,
                    status: 'signed',
                    start_date: new Date().toISOString(),
                    signed_at: new Date().toISOString(),
                    description: 'Contrato de prueba para detector automático'
                })
                .select()
                .single();

            if (contractNoUserError) {
                console.error('❌ Error también sin user_id:', contractNoUserError);
            } else {
                contract = contractNoUser;
            }
        }

        if (contract) {
            console.log('✅ Contrato FIRMADO creado:', contract.title);
            console.log('   📅 Firmado hace:', Math.floor((Date.now() - new Date(contract.signed_at).getTime()) / 1000), 'segundos');
            console.log('   💰 Valor:', contract.contract_value, '€');
        }

        // 4. Crear factura PAGADA recientemente
        console.log('\n💰 Creando factura PAGADA...');
        const projectId = project ? project.id : null;
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: FIXED_USER_UUID,
                client_id: client.id,
                project_id: projectId,
                invoice_number: `TEST-${Math.floor(Math.random() * 10000)}`,
                amount: 2500,
                total_amount: 2500,
                status: 'paid', // ¡ESTO TAMBIÉN SERÁ DETECTADO!
                invoice_date: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Hace 1 hora
                paid_date: new Date().toISOString(), // Pagado AHORA
                title: 'Factura TEST - Pago inicial'
            })
            .select()
            .single();

        if (invoiceError) {
            console.error('❌ Error creando factura:', invoiceError);
            
            // Intentar sin user_id
            const { data: invoiceNoUser, error: invoiceNoUserError } = await supabase
                .from('invoices')
                .insert({
                    client_id: client.id,
                    project_id: projectId,
                    invoice_number: `TEST-${Math.floor(Math.random() * 10000)}`,
                    amount: 2500,
                    total_amount: 2500,
                    status: 'paid',
                    invoice_date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    paid_date: new Date().toISOString(),
                    title: 'Factura TEST - Pago inicial'
                })
                .select()
                .single();

            if (invoiceNoUserError) {
                console.error('❌ Error también sin user_id:', invoiceNoUserError);
            } else {
                invoice = invoiceNoUser;
            }
        }

        if (invoice) {
            console.log('✅ Factura PAGADA creada:', invoice.invoice_number);
            console.log('   📅 Pagada hace:', Math.floor((Date.now() - new Date(invoice.paid_date).getTime()) / 1000), 'segundos');
            console.log('   💰 Monto:', invoice.amount, '€');
        }

        // 5. Crear cliente reciente
        console.log('\n👤 Creando cliente reciente...');
        const { data: client2, error: client2Error } = await supabase
            .from('clients')
            .insert({
                user_id: FIXED_USER_UUID,
                name: 'Carlos López',
                company: 'InnovaCorp',
                email: 'carlos.test@innovacorp.es',
                phone: '+34 600 789 012',
                city: 'Madrid',
                created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // Hace 3 horas
            })
            .select()
            .single();

        if (client2Error) {
            console.log('⚠️ Error creando segundo cliente:', client2Error.message);
        } else {
            console.log('✅ Cliente reciente creado:', client2.name);
            console.log('   📅 Registrado hace:', Math.floor((Date.now() - new Date(client2.created_at).getTime()) / (60 * 60 * 1000)), 'horas');
        }

        // RESUMEN FINAL
        console.log('\n🎯 ¡Datos de prueba creados!\n');
        console.log('📊 Eventos detectables:');
        if (contract) console.log('   ✅ 1 contrato firmado (reciente)');
        if (invoice) console.log('   ✅ 1 pago recibido (reciente)');
        if (client2) console.log('   ✅ 1 cliente nuevo (hace 3h)');
        console.log(`   🔧 User ID usado: ${FIXED_USER_UUID}`);

        console.log('\n🧪 Probar ahora:');
        console.log('   node test-auto-detector.js');
        console.log(`   curl "http://localhost:3000/api/ai/workflows/auto?userId=${FIXED_USER_UUID}&hours=24"`);

        console.log('\n📱 En la app web:');
        console.log('   Dashboard → Automatizaciones IA → Detector Automático');
        console.log('   Período: 24 horas');
        console.log('   ¡Debería detectar los eventos creados!');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Función para limpiar
async function cleanDirectTestData() {
    console.log('🧹 Limpiando datos de prueba directos...');
    
    try {
        await supabase.from('invoices').delete().like('invoice_number', 'TEST-%');
        await supabase.from('contracts').delete().like('title', '%TEST%');
        await supabase.from('projects').delete().like('name', '%TEST%');
        await supabase.from('clients').delete().like('email', '%.test@%');
        
        console.log('✅ Limpieza completada');
    } catch (error) {
        console.log('⚠️ Error limpiando:', error.message);
    }
}

// Ejecutar
async function main() {
    const action = process.argv[2];
    
    if (action === 'clean') {
        await cleanDirectTestData();
    } else if (action === 'create' || !action) {
        await cleanDirectTestData();
        await createDirectTestData();
    } else {
        console.log('📖 Uso:');
        console.log('   node create-direct-test-data.js        # Crear datos');
        console.log('   node create-direct-test-data.js clean  # Limpiar datos');
    }
}

main().catch(console.error);
