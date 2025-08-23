const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERROR: Missing Supabase environment variables');
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTemplateDataColumn() {
    console.log('🔧 Agregando columna template_data a la tabla projects...');
    
    try {
        // Agregar la columna template_data
        const { data, error } = await supabase.rpc('sql', {
            query: `
                ALTER TABLE projects 
                ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT NULL;
                
                COMMENT ON COLUMN projects.template_data IS 'Datos del template usado para crear el proyecto (fases, entregables, pricing)';
            `
        });

        if (error) {
            console.error('❌ Error ejecutando la migración:', error);
            return false;
        }

        console.log('✅ Columna template_data agregada exitosamente');
        
        // Verificar que la columna existe
        const { data: verification, error: verifyError } = await supabase.rpc('sql', {
            query: `
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'projects' AND column_name = 'template_data';
            `
        });

        if (verifyError) {
            console.error('❌ Error verificando la columna:', verifyError);
            return false;
        }

        if (verification && verification.length > 0) {
            console.log('✅ Verificación exitosa: Columna template_data existe');
            console.log('📊 Detalles de la columna:', verification[0]);
        } else {
            console.log('⚠️  Advertencia: No se pudo verificar la existencia de la columna');
        }

        return true;

    } catch (error) {
        console.error('❌ Error inesperado:', error);
        return false;
    }
}

// Ejecutar la migración
addTemplateDataColumn()
    .then((success) => {
        if (success) {
            console.log('🎉 ¡Migración completada exitosamente!');
            console.log('📝 La tabla projects ahora tiene la columna template_data');
        } else {
            console.log('❌ La migración falló');
        }
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
