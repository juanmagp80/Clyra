require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAutomation() {
  try {
    console.log('🔍 Debug completo de automatización...');
    
    // Buscar automatización por nombre que contenga "satisfac"
    const { data: automations, error: searchError } = await supabase
      .from('automations')
      .select('*')
      .ilike('name', '%satisfac%');

    if (searchError) {
      console.error('❌ Error buscando automatización:', searchError);
      return;
    }

    if (automations.length === 0) {
      console.log('❌ No se encontró automatización de satisfacción');
      return;
    }

    const automation = automations[0];
    console.log('✅ Encontrada automatización:', automation.name);
    console.log('📋 ID:', automation.id);
    console.log('📋 Actions type:', typeof automation.actions);
    console.log('📋 Actions content:', automation.actions);
    
    if (automation.actions) {
      try {
        const parsed = JSON.parse(automation.actions);
        console.log('📋 Actions parsed successfully:', Array.isArray(parsed) ? parsed.length + ' items' : 'not array');
        console.log('📋 First action:', JSON.stringify(parsed[0] || parsed, null, 2));
      } catch (e) {
        console.log('❌ Error parsing actions:', e.message);
      }
    } else {
      console.log('❌ Actions es null/undefined');
    }

  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

debugAutomation();
