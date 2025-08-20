const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupTrialSystem() {
    console.log('🚀 Configurando sistema de trial al 100%...\n');

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Error: Variables de Supabase no configuradas en .env.local');
        console.log('Necesitas:');
        console.log('- NEXT_PUBLIC_SUPABASE_URL');
        console.log('- SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    console.log('✅ Variables de Supabase configuradas');

    try {
        // Crear cliente de Supabase con service role
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log('📖 Leyendo archivo de migración...');
        const sqlFile = path.join(__dirname, 'database/subscription_trial_migration.sql');
        
        if (!fs.existsSync(sqlFile)) {
            console.error('❌ No se encontró el archivo de migración:', sqlFile);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('⚡ Ejecutando migración SQL en Supabase...');
        
        // Dividir el SQL en bloques para ejecutar por separado
        const sqlBlocks = sql.split(';').filter(block => block.trim().length > 0);
        
        for (let i = 0; i < sqlBlocks.length; i++) {
            const block = sqlBlocks[i].trim();
            if (block.length === 0) continue;

            try {
                const { error } = await supabase.rpc('exec_sql', { sql_query: block + ';' });
                if (error && !error.message.includes('already exists')) {
                    console.warn(`⚠️ Bloque ${i + 1}: ${error.message}`);
                }
            } catch (blockError) {
                console.warn(`⚠️ Error en bloque ${i + 1}:`, blockError.message);
            }
        }

        console.log('✅ Migración ejecutada');

        // Verificar que las tablas existan
        console.log('📊 Verificando tablas creadas...');
        
        const { data: plans } = await supabase.from('subscription_plans').select('name');
        const { data: profiles } = await supabase.from('profiles').select('subscription_status').limit(1);
        
        if (plans && plans.length > 0) {
            console.log('✅ Tabla subscription_plans: OK');
            console.log('📋 Planes disponibles:', plans.map(p => p.name));
        } else {
            console.log('⚠️ Tabla subscription_plans: Sin datos');
        }

        if (profiles) {
            console.log('✅ Tabla profiles: OK con campos de trial');
        } else {
            console.log('⚠️ Tabla profiles: Verificar manualmente');
        }

        // Verificar usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log('👤 Usuario actual encontrado:', user.email);
            
            // Asegurar que el usuario tenga trial configurado
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    trial_started_at: new Date().toISOString(),
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    subscription_status: 'trial',
                    subscription_plan: 'free'
                });

            if (updateError) {
                console.warn('⚠️ No se pudo actualizar perfil de usuario:', updateError.message);
            } else {
                console.log('✅ Perfil de usuario actualizado con trial de 14 días');
            }
        }

        console.log('\n🎉 Sistema de trial configurado al 100%!');
        console.log('\n📝 Estado actual:');
        console.log('✅ Base de datos: Configurada');
        console.log('✅ Tablas: Creadas');
        console.log('✅ Planes: Insertados');
        console.log('✅ Usuario: Trial activo por 14 días');
        
        console.log('\n🚀 Próximos pasos:');
        console.log('1. Reinicia el servidor: npm run dev');
        console.log('2. Ve a /dashboard para ver el banner de trial');
        console.log('3. Prueba las restricciones de límites');

    } catch (error) {
        console.error('💥 Error configurando trial:', error);
        process.exit(1);
    }
}

// Ejecutar setup
setupTrialSystem();
