require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const clearSurveyTemplate = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Banner del remitente MUY VISIBLE -->
    <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center; font-size: 18px; font-weight: bold;">
      📧 ENVIADO DESDE: {{user_email}}
    </div>
    
    <!-- Info de la empresa del usuario -->
    <div style="background-color: #1976d2; color: white; padding: 15px; text-align: center; font-size: 16px;">
      🏢 {{user_company}} | 👤 {{user_name}}
    </div>
    
    <!-- Header principal -->
    <div style="background-color: #4caf50; color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Encuesta de Satisfacción</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Su opinión es muy importante para nosotros</p>
    </div>
    
    <!-- Contenido -->
    <div style="padding: 30px;">
      <h2 style="color: #333; margin: 0 0 20px 0;">Estimado/a {{client_name}},</h2>
      
      <!-- Recordatorio de contacto muy visible -->
      <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;">
        <strong style="color: #856404; font-size: 16px;">
          💬 PUEDE RESPONDER DIRECTAMENTE A: {{user_email}}
        </strong>
      </div>
      
      <p style="margin: 0 0 20px 0; color: #555; font-size: 16px;">
        Esperamos que se encuentre bien. En <strong>{{user_company}}</strong> nos esforzamos constantemente por brindar el mejor servicio posible a nuestros clientes.
      </p>
      
      <p style="margin: 0 0 30px 0; color: #555; font-size: 16px;">
        Su experiencia reciente con nuestros servicios es muy valiosa para nosotros, y nos gustaría conocer su opinión para seguir mejorando.
      </p>
      
      <!-- Encuesta visual -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #4caf50;">
        <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px;">
          ¿Cómo calificaría su experiencia general con nuestros servicios?
        </h3>
        
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 15px;">
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background-color: #f44336; color: white; font-weight: bold; margin-bottom: 5px;">1</div>
            <div style="font-size: 12px; color: #666;">Muy insatisfecho</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background-color: #ff9800; color: white; font-weight: bold; margin-bottom: 5px;">2</div>
            <div style="font-size: 12px; color: #666;">Insatisfecho</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background-color: #ffc107; color: white; font-weight: bold; margin-bottom: 5px;">3</div>
            <div style="font-size: 12px; color: #666;">Neutral</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background-color: #8bc34a; color: white; font-weight: bold; margin-bottom: 5px;">4</div>
            <div style="font-size: 12px; color: #666;">Satisfecho</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background-color: #4caf50; color: white; font-weight: bold; margin-bottom: 5px;">5</div>
            <div style="font-size: 12px; color: #666;">Muy satisfecho</div>
          </div>
        </div>
      </div>
      
      <!-- Botón de respuesta -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:{{user_email}}?subject=RE: Encuesta de Satisfacción - {{user_company}}&body=Estimado/a {{user_name}},%0A%0AMi calificación es: [Escriba del 1 al 5]%0A%0AComentarios:%0A%0A%0ASaludos,%0A{{client_name}}" 
           style="display: inline-block; background-color: #4caf50; color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
          📧 RESPONDER ENCUESTA
        </a>
      </div>
      
      <div style="background-color: #e8f5e8; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #2e7d32; font-weight: bold; text-align: center;">
          💡 Para responder: Simplemente responda a este email o haga clic en el botón verde
        </p>
      </div>
      
      <p style="color: #555; font-size: 14px; margin: 20px 0 0 0;">
        Agradecemos sinceramente el tiempo que dedique a completar esta encuesta. Sus comentarios nos ayudan a seguir creciendo y mejorando.
      </p>
    </div>
    
    <!-- Footer con toda la información de contacto -->
    <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
      <h3 style="margin: 0 0 10px 0; color: #4caf50;">📧 INFORMACIÓN DE CONTACTO</h3>
      <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">{{user_email}}</p>
      <p style="margin: 5px 0;">👤 {{user_name}}</p>
      <p style="margin: 5px 0;">🏢 {{user_company}}</p>
      <p style="margin: 15px 0 0 0; font-size: 14px; color: #ccc;">
        Gracias por confiar en nuestros servicios
      </p>
    </div>
  </div>
</div>`;

async function updateFinalSurveyTemplate() {
  try {
    console.log('🔄 Actualizando template final con información muy visible...');
    
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
    
    // Crear la acción actualizada con nuevo subject
    const updatedAction = {
      type: 'send_email',
      name: 'Enviar email de encuesta de satisfacción',
      parameters: {
        subject: 'Encuesta de Satisfacción - {{user_company}}', // Cambio: empresa del usuario
        template: clearSurveyTemplate
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
      console.log('✅ Template final actualizado exitosamente');
      console.log('📧 Subject: "Encuesta de Satisfacción - {{user_company}}"');
      console.log('🔴 Banner rojo: "ENVIADO DESDE: {{user_email}}"');
      console.log('🔵 Banner azul: empresa y nombre del usuario');
      console.log('🟡 Caja amarilla: recordatorio de contacto');
      console.log('🟢 Botón verde: responder encuesta');
      console.log('⚫ Footer negro: toda la información de contacto');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

updateFinalSurveyTemplate();
