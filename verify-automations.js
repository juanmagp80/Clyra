// Script para verificar que las automatizaciones se actualizaron correctamente
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAutomations() {
    try {
        const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

        console.log('🔍 Verificando automatizaciones actualizadas...');

        const { data: automations, error } = await supabase
            .from('automations')
            .select('*')
            .eq('user_id', userId)
            .eq('name', 'Encuesta de satisfacción');

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        if (automations.length === 0) {
            console.log('⚠️ No se encontró la automatización "Encuesta de satisfacción"');
            return;
        }

        const automation = automations[0];
        console.log('📋 Automatización encontrada:');
        console.log('   - Nombre:', automation.name);
        console.log('   - ID:', automation.id);
        console.log('   - Actions (raw):', automation.actions);
        console.log('   - Actions (tipo):', typeof automation.actions);

        try {
            const parsedActions = JSON.parse(automation.actions);
            console.log('   - Actions (parseadas):', JSON.stringify(parsedActions, null, 2));
            console.log('   - Número de acciones:', parsedActions.length);

            if (parsedActions.length > 0) {
                console.log('   - Primera acción:', parsedActions[0]);
            }
        } catch (parseError) {
            console.error('   ❌ Error parseando actions:', parseError);
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

verifyAutomations();
