require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSurveyEmailLink() {
  try {
    console.log('🔄 Actualizando link de email en template de satisfacción...');
    
    // Buscar la automatización de satisfacción
    const { data: automations, error: fetchError } = await supabase
      .from('automations')
      .select('id, name, actions')
      .ilike('name', '%satisfac%');
    
    if (fetchError) {
      console.error('❌ Error buscando automatización:', fetchError);
      return;
    }
    
    if (!automations || automations.length === 0) {
      console.log('❌ No se encontró la automatización de satisfacción');
      return;
    }
    
    const automation = automations[0];
    console.log('✅ Automatización encontrada:', automation.name);
    
    // Obtener el action actual
    const currentAction = typeof automation.actions === 'string' 
      ? JSON.parse(automation.actions) 
      : automation.actions;
    
    // Actualizar el template para usar {{user_email}} en lugar de juangpdev@gmail.com
    let updatedTemplate = currentAction.parameters.template;
    
    // Reemplazar el email hardcodeado por la variable dinámica
    updatedTemplate = updatedTemplate.replace(
      /mailto:juangpdev@gmail\.com/g, 
      'mailto:{{user_email}}'
    );
    
    // Crear la acción actualizada
    const updatedAction = {
      ...currentAction,
      parameters: {
        ...currentAction.parameters,
        template: updatedTemplate
      }
    };
    
    // Actualizar la automatización
    const { data, error } = await supabase
      .from('automations')
      .update({
        actions: JSON.stringify(updatedAction)
      })
      .eq('id', automation.id)
      .select();
    
    if (error) {
      console.error('❌ Error actualizando automatización:', error);
    } else {
      console.log('✅ Template de satisfacción actualizado exitosamente');
      console.log('📄 Link de email ahora usa: {{user_email}}');
      console.log('📧 Los clientes podrán responder al email personal del usuario');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

updateSurveyEmailLink();
