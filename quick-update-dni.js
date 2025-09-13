// Script para actualizar datos DNI usando dotenv
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Configuración:');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: No se pueden cargar las variables de entorno desde .env.local');
    console.log('📝 Verifica que .env.local contenga:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=tu-url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=tu-key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const USER_EMAIL = 'juangpdev@gmail.com';
const USER_ID = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

async function quickUpdateDNI() {
    try {
        console.log('\n🎯 Actualización rápida de DNI para:', USER_EMAIL);
        
        // 1. Actualizar empresa
        console.log('\n🏢 Actualizando empresa...');
        const { data: companyUpdate, error: companyError } = await supabase
            .from('companies')
            .update({
                tax_id: 'B12345678',
                address: 'Calle Gran Via 25, 3B, 28013 Madrid'
            })
            .eq('user_id', USER_ID)
            .select();
            
        if (companyError) {
            console.error('❌ Error empresa:', companyError.message);
        } else {
            console.log('✅ Empresa actualizada:', companyUpdate?.[0]?.name || 'Mi Empresa');
        }
        
        // 2. Actualizar primer cliente encontrado
        console.log('\n👤 Actualizando clientes...');
        const { data: clients } = await supabase
            .from('clients')
            .select('id, name')
            .eq('user_id', USER_ID)
            .limit(3);
            
        if (clients && clients.length > 0) {
            const dniList = ['12345678A', '87654321B', '11223344C'];
            const addresses = [
                'Calle Alcala 100, 1A, 28009 Madrid',
                'Paseo de Gracia 45, 2C, 08007 Barcelona',
                'Calle Colon 30, 4D, 46004 Valencia'
            ];
            
            for (let i = 0; i < Math.min(clients.length, 3); i++) {
                const { error } = await supabase
                    .from('clients')
                    .update({
                        nif: dniList[i],
                        address: addresses[i],
                        city: ['Madrid', 'Barcelona', 'Valencia'][i],
                        province: ['Madrid', 'Barcelona', 'Valencia'][i]
                    })
                    .eq('id', clients[i].id);
                    
                if (!error) {
                    console.log(`✅ Cliente "${clients[i].name}": DNI ${dniList[i]}`);
                } else {
                    console.error(`❌ Error cliente ${clients[i].name}:`, error.message);
                }
            }
        } else {
            console.log('⚠️  No se encontraron clientes');
        }
        
        console.log('\n🎉 ¡Listo! Prueba generar un PDF ahora.');
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

quickUpdateDNI();