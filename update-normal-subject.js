require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateToNormalSubject() {
  try {
    console.log('🔄 Cambiando subject a uno más normal...');
    
    const automationId = 'f15708dd-db40-4ed1-8c6c-e3632588c46c';
    
    const { data: currentData } = await supabase
      .from('automations')
      .select('actions')
      .eq('id', automationId)
      .single();
    
    const currentAction = typeof currentData.actions === 'string' 
      ? JSON.parse(currentData.actions) 
      : currentData.actions;
    
    // Cambiar solo el subject, mantener el template
    const updatedAction = {
      ...currentAction,
      parameters: {
        ...currentAction.parameters,
        subject: 'Encuesta de Satisfacción - {{user_company}}'
      }
    };
    
    await supabase
      .from('automations')
      .update({
        actions: JSON.stringify(updatedAction)
      })
      .eq('id', automationId);
    
    console.log('✅ Subject cambiado a: "Encuesta de Satisfacción - {{user_company}}"');
    console.log('🎨 Template con banners visibles mantenido');
    console.log('📧 Ahora prueba de nuevo - debería llegar sin problemas');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

updateToNormalSubject();
