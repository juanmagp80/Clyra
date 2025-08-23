const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTableStructure() {
    try {
        console.log('🔍 Verificando estructura de la tabla profiles...\n');
        
        // Obtener un registro para ver las columnas disponibles
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'amazonjgp80@gmail.com')
            .single();

        if (error) {
            console.error('❌ Error al consultar el perfil:', error);
            return;
        }

        console.log('📋 Columnas disponibles en la tabla profiles:');
        console.log('=============================================');
        Object.keys(profile).forEach(key => {
            console.log(`- ${key}: ${typeof profile[key]} (${profile[key]})`);
        });
        
    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

getTableStructure();
