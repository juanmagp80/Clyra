const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    console.log('Ejecuta: NEXT_PUBLIC_SUPABASE_URL=tu-url SUPABASE_SERVICE_ROLE_KEY=tu-key node update-user-dni-data.js');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const USER_EMAIL = 'juangpdev@gmail.com';
const USER_ID = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

async function updateUserDNIData() {
    try {
        console.log('🎯 Actualizando datos DNI específicos para el usuario:', USER_EMAIL);

        // 1. Actualizar la empresa "Mi Empresa"
        console.log('\n🏢 1. Actualizando empresa "Mi Empresa"...');

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .update({
                tax_id: 'B12345678',  // NIF empresarial de ejemplo
                address: 'Calle Gran Vía 25, 3º B, 28013 Madrid',
                phone: '+34 911 234 567'
            })
            .eq('user_id', USER_ID)
            .select()
            .single();

        if (companyError) {
            console.error('❌ Error actualizando empresa:', companyError);
        } else {
            console.log('✅ Empresa actualizada:', company);
        }

        // 2. Actualizar clientes del usuario con DNI
        console.log('\n👥 2. Actualizando clientes del usuario...');

        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', USER_ID);

        if (clientsError) {
            console.error('❌ Error obteniendo clientes:', clientsError);
            return;
        }

        console.log(`👤 Encontrados ${clients?.length || 0} clientes`);

        // Datos de ejemplo para actualizar clientes
        const clientUpdates = [
            {
                nif: '12345678A',
                address: 'Calle Alcalá 100, 1º A, 28009 Madrid',
                city: 'Madrid',
                province: 'Madrid'
            },
            {
                nif: '87654321B',
                address: 'Paseo de Gracia 45, 2º C, 08007 Barcelona',
                city: 'Barcelona',
                province: 'Barcelona'
            },
            {
                nif: '11223344C',
                address: 'Calle Colón 30, 4º D, 46004 Valencia',
                city: 'Valencia',
                province: 'Valencia'
            }
        ];

        if (clients && clients.length > 0) {
            for (let i = 0; i < clients.length && i < clientUpdates.length; i++) {
                const client = clients[i];
                const updateData = clientUpdates[i];

                const { error: updateError } = await supabase
                    .from('clients')
                    .update({
                        ...updateData,
                        phone: client.phone || '+34 600 000 ' + (100 + i).toString().padStart(3, '0')
                    })
                    .eq('id', client.id);

                if (updateError) {
                    console.error(`❌ Error actualizando cliente ${client.name}:`, updateError);
                } else {
                    console.log(`✅ Cliente "${client.name}" actualizado:`);
                    console.log(`   - DNI: ${updateData.nif}`);
                    console.log(`   - Dirección: ${updateData.address}`);
                    console.log(`   - Ciudad: ${updateData.city}`);
                }
            }
        }

        console.log('\n🎉 ¡Actualización completada!');
        console.log('\n🔄 Ahora intenta generar un PDF y deberías ver:');
        console.log('✅ DNI Empresa: B12345678');
        console.log('✅ DNI Cliente: 12345678A (u otros)');
        console.log('✅ Direcciones completas');
        console.log('✅ Sin caracteres raros (á→a, ñ→n)');

    } catch (error) {
        console.error('❌ Error ejecutando script:', error);
    }
}

// Ejecutar el script
updateUserDNIData();