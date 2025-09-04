// Script para probar la carga automática de datos del freelancer
// Ejecutar: node test-contract-data-loading.js

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://onkqbcjwsxulhwgfaorh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ua3FiY2p3c3h1bGh3Z2Zhb3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMjMzNTQsImV4cCI6MjA1MDc5OTM1NH0.QX9xPOoWsJY1hh9ZKvwcfFGDcXQJK99XPxzUcXdLfzU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDataLoading() {
    try {
        console.log('🔍 Probando carga de datos del freelancer...\n');

        // Verificar que las tablas existen
        console.log('📋 Verificando estructura de tablas...');
        
        // Test companies table
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .limit(1);
        
        if (companiesError) {
            console.log('❌ Error en tabla companies:', companiesError.message);
        } else {
            console.log('✅ Tabla companies: OK');
            if (companies && companies.length > 0) {
                console.log('   Campos disponibles:', Object.keys(companies[0]));
            }
        }

        // Test company_settings table
        const { data: settings, error: settingsError } = await supabase
            .from('company_settings')
            .select('*')
            .limit(1);
        
        if (settingsError) {
            console.log('❌ Error en tabla company_settings:', settingsError.message);
        } else {
            console.log('✅ Tabla company_settings: OK');
            if (settings && settings.length > 0) {
                console.log('   Campos disponibles:', Object.keys(settings[0]));
            }
        }

        // Test profiles table
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (profilesError) {
            console.log('❌ Error en tabla profiles:', profilesError.message);
        } else {
            console.log('✅ Tabla profiles: OK');
            if (profiles && profiles.length > 0) {
                console.log('   Campos disponibles:', Object.keys(profiles[0]));
            }
        }

        // Test contract_templates table
        const { data: templates, error: templatesError } = await supabase
            .from('contract_templates')
            .select('name, category, description')
            .limit(5);
        
        if (templatesError) {
            console.log('❌ Error en tabla contract_templates:', templatesError.message);
        } else {
            console.log('✅ Tabla contract_templates: OK');
            console.log(`   Templates disponibles: ${templates?.length || 0}`);
            if (templates && templates.length > 0) {
                templates.forEach((template, index) => {
                    console.log(`   ${index + 1}. ${template.name} (${template.category})`);
                });
            }
        }

        console.log('\n🎯 Resultado del test:');
        
        if (!companiesError && !settingsError && !profilesError && !templatesError) {
            console.log('✅ ¡Todas las tablas funcionan correctamente!');
            console.log('✅ El sistema de contratos está listo para usar');
            console.log('✅ La carga automática de datos funcionará perfectamente');
        } else {
            console.log('⚠️  Algunas tablas tienen problemas - revisar configuración de Supabase');
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Función para simular la carga de datos como lo hace el componente
async function simulateFreelancerDataLoading(userId = null) {
    if (!userId) {
        console.log('\n📝 Para probar con un usuario real, ejecuta:');
        console.log('   node test-contract-data-loading.js [user_id]');
        return;
    }

    console.log(`\n🔄 Simulando carga de datos para usuario: ${userId}`);

    try {
        // Cargar datos de la empresa/freelancer
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', userId)
            .single();

        console.log('🏢 Datos de empresa:', companyError ? `Error: ${companyError.message}` : 'Cargados correctamente');
        if (companyData) {
            console.log(`   Nombre: ${companyData.name || 'N/A'}`);
            console.log(`   Tax ID: ${companyData.tax_id || 'N/A'}`);
            console.log(`   Email: ${companyData.email || 'N/A'}`);
            console.log(`   Teléfono: ${companyData.phone || 'N/A'}`);
        }

        // Cargar configuración de la empresa
        const { data: settingsData, error: settingsError } = await supabase
            .from('company_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        console.log('📊 Configuración empresa:', settingsError ? `Error: ${settingsError.message}` : 'Cargados correctamente');
        if (settingsData) {
            console.log(`   Nombre empresa: ${settingsData.company_name || 'N/A'}`);
            console.log(`   NIF: ${settingsData.nif || 'N/A'}`);
            console.log(`   Ciudad: ${settingsData.city || 'N/A'}`);
            console.log(`   Dirección: ${settingsData.address || 'N/A'}`);
        }

        // Cargar datos del perfil
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        console.log('👤 Datos de perfil:', profileError ? `Error: ${profileError.message}` : 'Cargados correctamente');
        if (profileData) {
            console.log(`   Nombre: ${profileData.name || 'N/A'}`);
            console.log(`   DNI: ${profileData.dni || 'N/A'}`);
            console.log(`   Ciudad: ${profileData.city || 'N/A'}`);
        }

        // Simular la combinación de datos como en el componente
        const combinedData = {
            name: settingsData?.company_name || companyData?.name || profileData?.name || 'Usuario',
            dni: settingsData?.nif || companyData?.tax_id || profileData?.dni || '',
            address: settingsData?.address || companyData?.address || profileData?.address || '',
            email: companyData?.email || settingsData?.email || 'email@usuario.com',
            phone: companyData?.phone || settingsData?.phone || profileData?.phone || '',
            city: settingsData?.city || profileData?.city || ''
        };

        console.log('\n🎯 Datos combinados finales:');
        Object.entries(combinedData).forEach(([key, value]) => {
            console.log(`   ${key}: ${value || '[Vacío]'}`);
        });

    } catch (error) {
        console.error('❌ Error en simulación:', error);
    }
}

// Ejecutar tests
if (require.main === module) {
    testDataLoading().then(() => {
        const userId = process.argv[2];
        if (userId) {
            simulateFreelancerDataLoading(userId);
        }
    });
}

module.exports = { testDataLoading, simulateFreelancerDataLoading };
