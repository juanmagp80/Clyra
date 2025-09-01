/**
 * Script para verificar automatizaciones en la base de datos
 */

const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando automatizaciones en la base de datos...\n');

console.log('📋 Variables de entorno:');
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('- SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n❌ Faltan variables de entorno críticas');
    process.exit(1);
}

// Crear cliente de Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAutomations() {
    try {
        console.log('\n🔧 Verificando tabla de automatizaciones...');
        
        // Verificar si existe la tabla automations
        const { data: automations, error } = await supabase
            .from('automations')
            .select('*')
            .limit(10);
        
        if (error) {
            console.log('❌ Error consultando automatizaciones:', error.message);
            
            // Verificar si es un error de tabla no existe
            if (error.message.includes('relation "automations" does not exist')) {
                console.log('\n🔧 La tabla "automations" no existe. ¿Necesitas crearla?');
                console.log('Puedes usar este SQL para crearla:');
                console.log(`
CREATE TABLE automations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    actions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_count INTEGER DEFAULT 0,
    last_executed TIMESTAMP WITH TIME ZONE
);

-- Política de RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automations"
    ON automations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automations"
    ON automations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automations"
    ON automations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automations"
    ON automations FOR DELETE
    USING (auth.uid() = user_id);
                `);
            }
            return false;
        }
        
        console.log(`✅ Tabla automations encontrada con ${automations.length} registros`);
        
        if (automations.length > 0) {
            console.log('\n📊 Automatizaciones encontradas:');
            automations.forEach((auto, index) => {
                console.log(`${index + 1}. ${auto.name} (${auto.trigger_type}) - Usuario: ${auto.user_id}`);
            });
        } else {
            console.log('\n📝 No hay automatizaciones en la base de datos.');
            console.log('Esto es normal si es la primera vez que usas la aplicación.');
        }
        
        // Verificar usuarios
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.log('❌ Error obteniendo usuarios:', usersError.message);
        } else {
            console.log(`\n👥 Usuarios registrados: ${users.length}`);
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
            });
        }
        
        return true;
        
    } catch (err) {
        console.log('❌ Error durante la verificación:', err.message);
        return false;
    }
}

// Ejecutar verificación
checkAutomations().then(success => {
    if (success) {
        console.log('\n✅ Verificación completada.');
    }
    process.exit(0);
});
