require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Template súper simple y claro para debug
const debugTemplate = `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f0f0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 20px;">
    
    <!-- BANNER SÚPER VISIBLE -->
    <div style="background-color: red; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
      🚨 ENVIADO DESDE: {{user_email}} 🚨
    </div>
    
    <div style="background-color: blue; color: white; padding: 15px; text-align: center; font-size: 18px; margin-bottom: 20px;">
      🏢 EMPRESA: {{user_company}} | 👤 USUARIO: {{user_name}}
    </div>
    
    <h1 style="color: green; text-align: center;">ENCUESTA DE SATISFACCIÓN</h1>
    
    <p style="font-size: 18px; margin: 20px 0;">Estimado/a {{client_name}},</p>
    
    <div style="background-color: yellow; border: 3px solid orange; padding: 20px; text-align: center; margin: 20px 0;">
      <h2 style="color: red; margin: 0;">RESPONDER A: {{user_email}}</h2>
    </div>
    
    <p style="font-size: 16px;">
      Por favor califique nuestro servicio del 1 al 5 respondiendo directamente a este email.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:{{user_email}}?subject=Respuesta Encuesta - {{user_company}}&body=Mi calificación es: " 
         style="background-color: green; color: white; padding: 20px 30px; text-decoration: none; font-size: 18px; border-radius: 5px;">
        📧 RESPONDER AHORA
      </a>
    </div>
    
    <div style="background-color: black; color: white; padding: 20px; text-align: center; margin-top: 30px;">
      <h2>CONTACTO DIRECTO:</h2>
      <p style="font-size: 18px; margin: 5px 0;">📧 {{user_email}}</p>
      <p style="font-size: 16px; margin: 5px 0;">👤 {{user_name}}</p>
      <p style="font-size: 16px; margin: 5px 0;">🏢 {{user_company}}</p>
    </div>
  </div>
</div>`;

async function forceUpdateSurvey() {
  try {
    console.log('🔄 FORZANDO actualización directa por ID...');

    const automationId = 'f15708dd-db40-4ed1-8c6c-e3632588c46c';

    // Crear acción con template súper visible para debug
    const updatedAction = {
      type: 'send_email',
      name: 'Enviar email de encuesta de satisfacción',
      parameters: {
        subject: 'TEST - Encuesta {{user_company}} - NUEVO TEMPLATE',
        template: debugTemplate
      }
    };

    console.log('📧 Nuevo subject:', updatedAction.parameters.subject);
    console.log('📏 Longitud del template:', updatedAction.parameters.template.length);

    // Actualizar directamente por ID
    const { data, error } = await supabase
      .from('automations')
      .update({
        actions: JSON.stringify(updatedAction),
        updated_at: new Date().toISOString() // Forzar timestamp update
      })
      .eq('id', automationId)
      .select();

    if (error) {
      console.error('❌ Error actualizando:', error);
    } else {
      console.log('✅ FORZADO: Automatización actualizada');
      console.log('🔴 Template con banners súper visibles aplicado');
      console.log('📊 ID:', automationId);
      console.log('⏰ Timestamp actualizado para forzar refresh');
      console.log('');
      console.log('🧪 AHORA PRUEBA LA AUTOMATIZACIÓN Y DEBERÍAS VER:');
      console.log('📧 Subject: "TEST - Encuesta [Tu Empresa] - NUEVO TEMPLATE"');
      console.log('🚨 Banner rojo con tu email');
      console.log('🔵 Banner azul con empresa y nombre');
      console.log('🟡 Caja amarilla con email de respuesta');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

forceUpdateSurvey();
