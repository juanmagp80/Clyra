const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-service')) {
    console.error('❌ Error: Debes configurar las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    console.log('📝 Instrucciones:');
    console.log('1. Copia tu URL de Supabase desde el dashboard');
    console.log('2. Crea una service role key desde Settings > API');
    console.log('3. Ejecuta: NEXT_PUBLIC_SUPABASE_URL=tu-url SUPABASE_SERVICE_ROLE_KEY=tu-key node add-dni-test-data.js');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para generar DNI/NIF falsos pero válidos
function generateFakeDNI() {
    const numbers = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const letter = letters[parseInt(numbers) % 23];
    return `${numbers}${letter}`;
}

function generateFakeNIF() {
    // Para empresas, usar formato NIF (B12345678)
    const letters = 'ABCDEFGHJNPQRSUVW';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const numbers = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
    return `${letter}${numbers}`;
}

async function addTestDNIData() {
    try {
        console.log('🚀 Iniciando script para agregar datos DNI/NIF de prueba...');

        // 1. Actualizar datos de la empresa
        console.log('\n📊 1. Actualizando datos de empresa...');

        // Buscar la empresa del usuario
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .limit(5);

        if (companiesError) {
            console.error('❌ Error obteniendo empresas:', companiesError);
            return;
        }

        console.log(`📋 Encontradas ${companies?.length || 0} empresas`);

        if (companies && companies.length > 0) {
            for (const company of companies) {
                const fakeTaxId = generateFakeNIF();
                const fakeAddress = `Calle ${Math.floor(Math.random() * 100) + 1}, ${Math.floor(Math.random() * 5) + 1}º, 28001 Madrid`;

                const { error: updateError } = await supabase
                    .from('companies')
                    .update({
                        tax_id: fakeTaxId,
                        address: company.address || fakeAddress
                    })
                    .eq('id', company.id);

                if (updateError) {
                    console.error(`❌ Error actualizando empresa ${company.name}:`, updateError);
                } else {
                    console.log(`✅ Empresa "${company.name}" actualizada:`);
                    console.log(`   - NIF: ${fakeTaxId}`);
                    console.log(`   - Dirección: ${company.address || fakeAddress}`);
                }
            }
        } else {
            console.log('⚠️  No se encontraron empresas para actualizar');
        }

        // 2. Actualizar datos de clientes
        console.log('\n👥 2. Actualizando datos de clientes...');

        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .limit(10);

        if (clientsError) {
            console.error('❌ Error obteniendo clientes:', clientsError);
            return;
        }

        console.log(`👤 Encontrados ${clients?.length || 0} clientes`);

        if (clients && clients.length > 0) {
            for (const client of clients) {
                const fakeDNI = generateFakeDNI();
                const fakeAddress = `Avenida ${Math.floor(Math.random() * 200) + 1}, ${Math.floor(Math.random() * 10) + 1}º, ${['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'][Math.floor(Math.random() * 5)]}`;
                const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza'];
                const provinces = ['Madrid', 'Barcelona', 'Valencia', 'Andalucía', 'País Vasco', 'Andalucía', 'Aragón'];

                const randomIndex = Math.floor(Math.random() * cities.length);

                const { error: updateError } = await supabase
                    .from('clients')
                    .update({
                        nif: fakeDNI,
                        address: client.address || fakeAddress,
                        city: client.city || cities[randomIndex],
                        province: client.province || provinces[randomIndex]
                    })
                    .eq('id', client.id);

                if (updateError) {
                    console.error(`❌ Error actualizando cliente ${client.name}:`, updateError);
                } else {
                    console.log(`✅ Cliente "${client.name}" actualizado:`);
                    console.log(`   - DNI: ${fakeDNI}`);
                    console.log(`   - Dirección: ${client.address || fakeAddress}`);
                    console.log(`   - Ciudad: ${client.city || cities[randomIndex]}`);
                }
            }
        } else {
            console.log('⚠️  No se encontraron clientes para actualizar');
        }

        console.log('\n🎉 ¡Script completado exitosamente!');
        console.log('\n📋 Resumen:');
        console.log(`✅ Empresas actualizadas: ${companies?.length || 0}`);
        console.log(`✅ Clientes actualizados: ${clients?.length || 0}`);
        console.log('\n🔄 Ahora puedes probar generar PDFs y deberías ver los DNI/NIF correctamente.');

    } catch (error) {
        console.error('❌ Error ejecutando script:', error);
    }
}

// Ejecutar el script
addTestDNIData().then(() => {
    console.log('🏁 Script finalizado');
}).catch(error => {
    console.error('💥 Error fatal:', error);
});