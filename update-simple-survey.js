require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const simpleSurveyTemplate = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    
    <!-- Sender Info - Muy prominente al inicio -->
    <div style="background-color: #1e40af; color: white; padding: 20px 30px; text-align: center; border-bottom: 3px solid #3b82f6;">
      <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">📧 Email enviado desde: {{user_email}}</h2>
      <p style="margin: 0; font-size: 16px; opacity: 0.9;">Por: {{user_name}} de {{client_company}}</p>
    </div>
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 10px 0;">Encuesta de Satisfacción</h1>
      <p style="font-size: 16px; opacity: 0.9; margin: 0;">Su opinión es muy importante para nosotros</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <div style="margin-bottom: 25px;">
        <h2 style="color: #2d3748; font-size: 22px; margin: 0 0 10px 0;">Estimado/a {{client_name}},</h2>
      </div>
      
      <!-- Contact reminder box -->
      <div style="background-color: #e0f2fe; border: 2px solid #0284c7; border-radius: 8px; padding: 20px; margin: 0 0 30px 0; text-align: center;">
        <p style="margin: 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">
          💬 Puede responder directamente a este email: <strong>{{user_email}}</strong>
        </p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0 0 15px 0;">
          Esperamos que se encuentre bien. En <strong>{{client_company}}</strong> nos esforzamos constantemente por brindar el mejor servicio posible a nuestros clientes.
        </p>
        
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0;">
          Su experiencia reciente con nuestros servicios es muy valiosa para nosotros, y nos gustaría conocer su opinión para seguir mejorando.
        </p>
      </div>
      
      <!-- Survey Section -->
      <div style="background-color: #f7fafc; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea;">
        <div style="font-size: 18px; font-weight: 600; color: #2d3748; margin-bottom: 20px;">
          ¿Cómo calificaría su experiencia general con nuestros servicios?
        </div>
        
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px;">
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 45px; height: 45px; line-height: 45px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; font-size: 18px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">1</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">Muy insatisfecho</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 45px; height: 45px; line-height: 45px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; font-size: 18px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">2</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">Insatisfecho</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 45px; height: 45px; line-height: 45px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; font-size: 18px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">3</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">Neutral</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 45px; height: 45px; line-height: 45px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; font-size: 18px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">4</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">Satisfecho</div>
          </div>
          <div style="text-align: center; flex: 1; min-width: 80px; margin: 5px;">
            <div style="display: inline-block; width: 45px; height: 45px; line-height: 45px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; font-size: 18px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">5</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">Muy satisfecho</div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px; color: #666;">
          <span style="color: #e53e3e; font-weight: 600;">Necesita mejorar</span>
          <span style="color: #38a169; font-weight: 600;">Excelente</span>
        </div>
      </div>
      
      <!-- CTA Section -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="mailto:{{user_email}}?subject=Encuesta de Satisfacción - {{client_company}}&body=Estimado/a {{user_name}},%0A%0AMi calificación general es: [Escriba su calificación del 1 al 5]%0A%0AComentarios adicionales:%0A%0A%0AAtentamente,%0A{{client_name}}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          📧 Responder Encuesta por Email
        </a>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0 0 15px 0;">
          <strong>💡 Para responder:</strong> Simplemente responda a este email o haga clic en el botón de arriba.
        </p>
        
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0;">
          Agradecemos sinceramente el tiempo que dedique a completar esta encuesta. Sus comentarios nos ayudan a seguir creciendo y mejorando.
        </p>
      </div>
    </div>
    
    <!-- Footer con contacto -->
    <div style="background-color: #2d3748; color: white; padding: 25px 30px; text-align: center;">
      <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📧 Su contacto directo: {{user_email}}</p>
      <p style="margin: 0 0 10px 0; opacity: 0.8;">👤 {{user_name}} - {{client_company}}</p>
      <p style="margin: 0; opacity: 0.8; font-size: 14px;">Gracias por confiar en nuestros servicios</p>
    </div>
  </div>
</div>`;

async function updateSimpleSurveyTemplate() {
  try {
    console.log('🔄 Actualizando con template simple y claro...');

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

    // Crear la acción actualizada
    const updatedAction = {
      type: 'send_email',
      name: 'Enviar email de encuesta de satisfacción',
      parameters: {
        subject: 'Encuesta de Satisfacción - {{client_company}}',
        template: simpleSurveyTemplate
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
      console.log('✅ Template actualizado con diseño simple y claro');
      console.log('📧 Prominente: "Email enviado desde: {{user_email}}" al inicio');
      console.log('💬 Caja de recordatorio de contacto');
      console.log('🔗 Botón directo para responder por email');
      console.log('📍 Footer con información de contacto clara');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

updateSimpleSurveyTemplate();
