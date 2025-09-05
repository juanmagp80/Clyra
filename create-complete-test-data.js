#!/usr/bin/env node

/**
 * 🧪 Script COMPLETO para crear datos de prueba
 * Incluye todos los campos requeridos y maneja foreign keys correctamente
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

async function createCompleteTestData() {
    console.log('🧪 Creando datos de prueba COMPLETOS...\n');

    try {
        // 0. Limpiar datos previos
        console.log('🧹 Limpiando datos previos...');
        await supabase.from('invoices').delete().like('invoice_number', 'TEST-%');
        await supabase.from('contracts').delete().like('title', '%TEST%');
        await supabase.from('projects').delete().like('name', '%TEST%');
        await supabase.from('clients').delete().like('email', '%.test@%');

        // 1. Buscar un perfil existente
        console.log('🔍 Buscando perfil existente...');
        const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('id, email')
            .limit(1);

        let userId = null;
        if (existingProfiles && existingProfiles.length > 0) {
            userId = existingProfiles[0].id;
            console.log('✅ Usando perfil existente:', existingProfiles[0].email);
        } else {
            console.log('⚠️ No hay perfiles existentes.');
            console.log('💡 Por favor:');
            console.log('   1. Ve a tu aplicación web');
            console.log('   2. Regístrate como usuario');
            console.log('   3. Vuelve a ejecutar este script');
            console.log('');
            console.log('🔄 Alternativamente, podemos crear solo clientes (sin user_id)...');
            
            // Crear solo datos básicos sin user_id
            await createBasicTestData();
            return;
        }

        // 2. Crear cliente
        console.log('\n👤 Creando cliente de prueba...');
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                user_id: userId,
                name: 'María González',
                company: 'TechStart Innovation',
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

        // 3. Crear proyecto
        console.log('\n📁 Creando proyecto...');
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                client_id: client.id,
                name: 'App Móvil TEST',
                status: 'in_progress',
                budget: 5000,
                start_date: new Date().toISOString().split('T')[0],
                description: 'Proyecto de prueba para detector automático'
            })
            .select()
            .single();

        if (projectError) {
            console.error('❌ Error creando proyecto:', projectError);
            return;
        }
        console.log('✅ Proyecto creado:', project.name);

        // 4. Crear contrato FIRMADO (con todos los campos requeridos)
        console.log('\n📋 Creando contrato FIRMADO...');
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert({
                user_id: userId,
                client_id: client.id,
                title: 'Contrato TEST - App Móvil',
                description: 'Contrato de prueba para detector automático',
                contract_content: JSON.stringify({
                    terms: 'Desarrollo de aplicación móvil',
                    deliverables: ['Diseño UI/UX', 'Desarrollo iOS', 'Desarrollo Android', 'Testing'],
                    timeline: '3 meses',
                    payment: 'Pago único de €5,000'
                }), // Campo requerido
                project_details: 'Desarrollo completo de app móvil para TechStart',
                contract_value: 5000,
                currency: 'EUR',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                payment_terms: 'Pago único al inicio del proyecto',
                status: 'signed', // ¡ESTO ES LO QUE DETECTA EL SISTEMA!
                signed_at: new Date().toISOString() // Firmado AHORA
            })
            .select()
            .single();

        if (contractError) {
            console.error('❌ Error creando contrato:', contractError);
            return;
        }
        console.log('✅ Contrato FIRMADO creado:', contract.title);
        console.log('   📅 Firmado hace:', Math.floor((Date.now() - new Date(contract.signed_at).getTime()) / 1000), 'segundos');
        console.log('   💰 Valor:', contract.contract_value, '€');

        // 5. Crear factura PAGADA (con todos los campos requeridos)
        console.log('\n💰 Creando factura PAGADA...');
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: userId,
                client_id: client.id,
                project_id: project.id,
                invoice_number: `TEST-${Math.floor(Math.random() * 10000)}`,
                title: 'Factura TEST - Pago inicial',
                description: 'Pago inicial para desarrollo de app móvil',
                amount: 2500,
                tax_rate: 21,
                tax_amount: 525,
                total_amount: 3025,
                status: 'paid', // ¡ESTO TAMBIÉN SERÁ DETECTADO!
                invoice_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 2 horas
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Campo requerido
                paid_date: new Date().toISOString().split('T')[0], // Pagado HOY
                payment_terms: 'Transferencia bancaria',
                items: JSON.stringify([
                    {
                        description: 'Desarrollo App Móvil - Fase 1',
                        quantity: 1,
                        rate: 2500,
                        amount: 2500
                    }
                ])
            })
            .select()
            .single();

        if (invoiceError) {
            console.error('❌ Error creando factura:', invoiceError);
            return;
        }
        console.log('✅ Factura PAGADA creada:', invoice.invoice_number);
        console.log('   📅 Pagada hoy');
        console.log('   💰 Monto:', invoice.total_amount, '€ (incluye IVA)');

        // 6. Crear cliente reciente
        console.log('\n👤 Creando cliente reciente...');
        const { data: client2, error: client2Error } = await supabase
            .from('clients')
            .insert({
                user_id: userId,
                name: 'Carlos López',
                company: 'InnovaCorp',
                email: 'carlos.test@innovacorp.es',
                phone: '+34 600 789 012',
                address: 'Paseo Castellana 456',
                city: 'Madrid',
                province: 'Madrid',
                nif: '87654321B',
                created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // Hace 4 horas
            })
            .select()
            .single();

        if (client2Error) {
            console.log('⚠️ Error creando segundo cliente:', client2Error.message);
        } else {
            console.log('✅ Cliente reciente creado:', client2.name);
            console.log('   📅 Registrado hace:', Math.floor((Date.now() - new Date(client2.created_at).getTime()) / (60 * 60 * 1000)), 'horas');
        }

        // 7. Crear proyecto completado para el segundo cliente
        if (client2) {
            console.log('\n🎉 Creando proyecto COMPLETADO...');
            const { data: completedProject, error: completedProjectError } = await supabase
                .from('projects')
                .insert({
                    user_id: userId,
                    client_id: client2.id,
                    name: 'Web Corporativa TEST',
                    status: 'completed', // ¡ESTO TAMBIÉN SERÁ DETECTADO!
                    budget: 3000,
                    start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 20 días
                    end_date: new Date().toISOString().split('T')[0], // Completado HOY
                    description: 'Proyecto completado para testing del detector'
                })
                .select()
                .single();

            if (completedProjectError) {
                console.log('⚠️ Error creando proyecto completado:', completedProjectError.message);
            } else {
                console.log('✅ Proyecto COMPLETADO creado:', completedProject.name);
                console.log('   📅 Completado hoy');
                console.log('   💰 Budget:', completedProject.budget, '€');
            }
        }

        // RESUMEN FINAL
        console.log('\n🎯 ¡Datos de prueba COMPLETOS creados!\n');
        console.log('📊 Eventos que el detector DEBERÍA encontrar:');
        console.log('   ✅ 1 contrato firmado (hace minutos)');
        console.log('   ✅ 1 pago recibido (hoy)');
        console.log('   ✅ 1 cliente nuevo (hace 4h)');
        if (client2) console.log('   ✅ 1 proyecto completado (hoy)');
        console.log(`   🔧 User ID usado: ${userId}`);

        console.log('\n🧪 Comandos de prueba:');
        console.log('   node test-auto-detector.js');
        console.log(`   curl "http://localhost:3000/api/ai/workflows/auto?userId=${userId}&hours=24"`);

        console.log('\n📱 En la aplicación web:');
        console.log('   Dashboard → Automatizaciones IA → Detector Automático');
        console.log('   Configurar período: 24 horas');
        console.log('   ¡Deberías ver 4 eventos detectados!');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Función para crear datos básicos sin user_id (plan B)
async function createBasicTestData() {
    console.log('\n📝 Creando datos básicos sin user_id...');
    
    // Al menos crear algunos clientes para ver si el sistema funciona
    try {
        const { data: basicClient, error } = await supabase
            .from('clients')
            .insert({
                name: 'Cliente Básico TEST',
                company: 'Empresa TEST',
                email: 'basico.test@example.com',
                phone: '+34 600 000 000',
                city: 'Madrid',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Hace 2 horas
            })
            .select()
            .single();

        if (error) {
            console.log('❌ Error creando cliente básico:', error.message);
        } else {
            console.log('✅ Cliente básico creado:', basicClient.name);
            console.log('💡 Este cliente aparecerá como "cliente nuevo" en las últimas 24h');
        }
    } catch (err) {
        console.log('❌ Error en creación básica:', err.message);
    }
}

// Función para limpiar
async function cleanCompleteTestData() {
    console.log('🧹 Limpiando datos de prueba completos...');
    
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
        await cleanCompleteTestData();
    } else if (action === 'create' || !action) {
        await cleanCompleteTestData();
        await createCompleteTestData();
    } else {
        console.log('📖 Uso:');
        console.log('   node create-complete-test-data.js        # Crear datos completos');
        console.log('   node create-complete-test-data.js clean  # Limpiar datos');
    }
}

main().catch(console.error);
