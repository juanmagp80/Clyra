// Script de prueba para verificar la consulta de companies
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testCompanyQuery() {
    if (!supabaseUrl || !supabaseKey) {
        console.log('⚠️ Variables de entorno no configuradas');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Verificar estructura de la tabla companies
        console.log('🔍 Verificando estructura de tabla companies...');
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .limit(5);

        if (companiesError) {
            console.error('❌ Error consultando companies:', companiesError);
            return;
        }

        console.log('✅ Datos de companies encontrados:', companies?.length || 0);
        if (companies && companies.length > 0) {
            console.log('📄 Ejemplo de company:', companies[0]);
        }

        // Verificar relación profiles -> companies
        console.log('\n🔍 Verificando relación profiles -> companies...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, company_id, company_name')
            .not('company_id', 'is', null)
            .limit(3);

        if (profilesError) {
            console.error('❌ Error consultando profiles:', profilesError);
        } else {
            console.log('✅ Profiles con company_id:', profiles?.length || 0);
            if (profiles && profiles.length > 0) {
                console.log('📄 Ejemplos de profiles:', profiles);
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

testCompanyQuery();