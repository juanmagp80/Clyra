require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const professionalTemplate = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border: 1px solid #ddd; border-radius: 8px;">
  <div style="background: #2c3e50; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Encuesta de Satisfacción</h1>
    <p style="margin: 15px 0 0 0; font-size: 16px;">De: <strong>{{user_name}}</strong> ({{user_email}})</p>
  </div>
  <div style="padding: 30px;">
    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Estimado/a <strong>{{client_name}}</strong>,</p>
    <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">Su opinión es muy importante para nosotros. Por favor califique nuestro servicio del 1 al 5.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:{{user_email}}?subject=Respuesta Encuesta&body=Mi calificación es: ___/5" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">📝 Responder Encuesta</a>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center;">También puede responder directamente a este email</p>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-top: 1px solid #eee;">
    <h3 style="color: #333; font-size: 16px; margin: 0 0 15px 0; text-align: center;">Información de Contacto</h3>
    <div style="text-align: center; color: #555; font-size: 14px;">
      <p style="margin: 5px 0;"><strong>Email:</strong> {{user_email}}</p>
      <p style="margin: 5px 0;"><strong>Contacto:</strong> {{user_name}}</p>
      <p style="margin: 5px 0;"><strong>Empresa:</strong> {{user_company}}</p>
    </div>
  </div>
  <div style="background: #343a40; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">Enviado desde {{user_company}}</div>
</div>`;

async function createNewAutomation() {
  try {
    console.log('🚀 Creando nueva automatización profesional...');
    
    // Primero, obtener el user_id (usando uno existente o crear lógica para obtenerlo)
    const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'; // ID del usuario actual
    
    const newAutomation = {
      user_id: userId,
      name: 'Encuesta de Satisfacción Profesional',
      description: 'Envío profesional de encuesta de satisfacción a clientes',
      trigger_type: 'manual',
      trigger_conditions: {},
      actions: JSON.stringify([{
        type: 'send_email',
        name: 'Enviar email de encuesta profesional',
        parameters: {
          subject: 'Encuesta de Satisfacción - {{user_company}}',
          template: professionalTemplate
        }
      }]),
      is_active: true,
      execution_count: 0,
      error_count: 0,
      success_rate: 100,
      is_public: false
    };
    
    const { data, error } = await supabase
      .from('automations')
      .insert(newAutomation)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creando automatización:', error);
    } else {
      console.log('✅ Nueva automatización creada:');
      console.log('📧 ID:', data.id);
      console.log('📧 Nombre:', data.name);
      console.log('🎨 Template profesional aplicado');
      console.log('');
      console.log('🔄 Ahora puedes usar esta nueva automatización desde el dashboard');
      console.log('⚠️  Recuerda desactivar o eliminar la automatización antigua con template debug');
    }
    
  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

createNewAutomation();
