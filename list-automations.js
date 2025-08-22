// Script para listar todas las automatizaciones y ver sus IDs
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllAutomations() {
    try {
        const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

        console.log('🔍 Listando TODAS las automatizaciones...');

        const { data: automations, error } = await supabase
            .from('automations')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log(`📊 Total de automatizaciones: ${automations.length}\n`);

        automations.forEach((automation, index) => {
            console.log(`${index + 1}. 📋 ${automation.name}`);
            console.log(`   - ID: ${automation.id}`);
            console.log(`   - Tipo: ${automation.trigger_type}`);
            console.log(`   - Actions: ${automation.actions.substring(0, 50)}${automation.actions.length > 50 ? '...' : ''}`);
            console.log(`   - Actions length: ${automation.actions.length}`);
            console.log('');
        });

        // Buscar específicamente por ID que vimos en los logs
        const targetId = 'f15708dd-db40-4ed1-8c6c-e3632588c46c';
        const targetAutomation = automations.find(a => a.id === targetId);

        if (targetAutomation) {
            console.log('🎯 Automatización objetivo encontrada:');
            console.log('   - Nombre:', targetAutomation.name);
            console.log('   - Actions completas:', targetAutomation.actions);

            try {
                const parsed = JSON.parse(targetAutomation.actions);
                console.log('   - Actions parseadas exitosamente:', parsed.length, 'acciones');
            } catch (e) {
                console.log('   - Error parseando:', e.message);
            }
        } else {
            console.log('❌ No se encontró la automatización con ID:', targetId);
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

listAllAutomations();
