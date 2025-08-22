require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 Variables de entorno:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl?.substring(0, 30) + '...'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTemplate() {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('name, subject, content')
      .eq('name', 'satisfaction_survey')
      .single();

    if (error) {
      console.log('❌ Error:', error);
    } else {
      console.log('📧 Template actual:');
      console.log('Nombre:', data.name);
      console.log('Asunto:', data.subject);
      console.log('Contenido (primeros 800 chars):', data.content.substring(0, 800) + '...');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkTemplate();
