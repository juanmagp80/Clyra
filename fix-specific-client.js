// Script para actualizar el cliente específico del contrato
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// ID específico del cliente que aparece en los logs
const CLIENT_ID = 'c2e54274-a9be-4219-9d87-ed2831975b78';

async function updateSpecificClient() {
    try {
        console.log('🎯 Actualizando cliente específico del contrato...');
        console.log('📋 Cliente ID:', CLIENT_ID);

        // Actualizar este cliente específico
        const { data: updatedClient, error } = await supabase
            .from('clients')
            .update({
                nif: '12345678Z',  // DNI específico para Roberto Silva
                // Mantener los datos existentes, solo agregar el NIF
            })
            .eq('id', CLIENT_ID)
            .select()
            .single();

        if (error) {
            console.error('❌ Error actualizando cliente:', error.message);
        } else {
            console.log('✅ Cliente actualizado exitosamente:');
            console.log('- Nombre:', updatedClient.name);
            console.log('- NIF:', updatedClient.nif);
            console.log('- Email:', updatedClient.email);
            console.log('- Dirección:', updatedClient.address);
        }

        console.log('\n🎉 ¡Listo! Ahora genera el PDF y deberías ver:');
        console.log('✅ DNI Empresa: B12345678');
        console.log('✅ DNI Cliente: 12345678Z');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

updateSpecificClient();