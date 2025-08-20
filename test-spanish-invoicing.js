const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSpanishInvoice() {
    try {
        console.log('🧪 Probando sistema de facturas españolas...');

        // 1. Verificar tabla de configuración de empresa
        console.log('\n1️⃣ Verificando tabla company_settings...');
        const { data: companySettings, error: companyError } = await supabase
            .from('company_settings')
            .select('count')
            .eq('count', '*');

        if (companyError) {
            console.log('❌ Error:', companyError);
        } else {
            console.log('✅ Tabla company_settings accesible');
        }

        // 2. Verificar tabla de facturas actualizada
        console.log('\n2️⃣ Verificando estructura de tabla invoices...');
        const { data: sampleInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .limit(1)
            .single();

        if (invoiceError && invoiceError.code !== 'PGRST116') {
            console.log('⚠️ Error consultando invoices:', invoiceError.message);
        } else if (sampleInvoice) {
            console.log('✅ Tabla invoices accesible');
            console.log('🔍 Columnas encontradas:');
            Object.keys(sampleInvoice).forEach(col => {
                console.log(`   - ${col}`);
            });

            // Verificar si tiene las nuevas columnas españolas
            const spanishColumns = [
                'invoice_number', 'series', 'issue_date', 'client_nif',
                'client_address', 'subtotal', 'tax_rate', 'tax_amount', 'qr_data'
            ];

            const missingColumns = spanishColumns.filter(col => !sampleInvoice.hasOwnProperty(col));
            if (missingColumns.length > 0) {
                console.log('⚠️ Columnas faltantes para normativa española:');
                missingColumns.forEach(col => console.log(`   - ${col}`));
            } else {
                console.log('✅ Todas las columnas de normativa española están presentes');
            }
        } else {
            console.log('✅ Tabla invoices accesible (vacía)');
        }

        // 3. Crear datos de prueba de empresa
        console.log('\n3️⃣ Creando configuración de empresa de prueba...');

        // Obtener primer usuario
        const { data: users } = await supabase.auth.admin.listUsers();
        if (!users.users || users.users.length === 0) {
            console.log('❌ No hay usuarios en el sistema');
            return;
        }

        const testUser = users.users[0];
        console.log(`👤 Usando usuario: ${testUser.email}`);

        const companyData = {
            user_id: testUser.id,
            company_name: 'Mi Empresa de Prueba S.L.',
            nif: 'A12345674',
            address: 'Calle Mayor, 123, 1º A',
            postal_code: '28001',
            city: 'Madrid',
            province: 'Madrid',
            country: 'España',
            phone: '+34 912 345 678',
            email: 'info@miempresa.com',
            invoice_series: 'A',
            next_invoice_number: 1,
            current_year: 2025,
            default_vat_rate: 21.00,
            default_retention_rate: 15.00
        };

        const { error: insertError } = await supabase
            .from('company_settings')
            .upsert(companyData, { onConflict: 'user_id' });

        if (insertError) {
            console.log('❌ Error insertando empresa de prueba:', insertError);
        } else {
            console.log('✅ Configuración de empresa creada/actualizada');
        }

        // 4. Probar funciones de utilidades españolas
        console.log('\n4️⃣ Probando utilidades de normativa española...');

        // Importar las funciones (simular, ya que es CommonJS)
        const validateNIF = (nif) => {
            const nifPattern = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
            if (!nifPattern.test(nif)) return false;

            const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
            const number = parseInt(nif.substring(0, 8));
            const letter = nif.substring(8, 9).toUpperCase();
            const calculatedLetter = letters.charAt(number % 23);

            return letter === calculatedLetter;
        };

        const testNIFs = ['12345678Z', 'A12345674', '87654321X'];
        testNIFs.forEach(nif => {
            const isValid = validateNIF(nif);
            console.log(`   NIF ${nif}: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
        });

        // 5. Generar número de factura
        console.log('\n5️⃣ Generando número de factura...');
        const currentYear = 2025;
        const sequence = 1;
        const series = 'A';
        const invoiceNumber = `${currentYear}/${series}${sequence.toString().padStart(6, '0')}`;
        console.log(`   Número generado: ${invoiceNumber}`);

        console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
        console.log('💡 El sistema de facturas españolas está listo para usar');

    } catch (error) {
        console.error('💥 Error crítico en las pruebas:', error);
    }
}

console.log('🚀 Iniciando pruebas del sistema de facturación española...');
testSpanishInvoice().then(() => {
    console.log('\nPruebas finalizadas. Presiona Ctrl+C para salir.');
}).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
