require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const professionalSurveyWithContactTemplate = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 10px 0;">Encuesta de Satisfacción</h1>
      <p style="font-size: 16px; opacity: 0.9; margin: 0;">Su opinión es muy importante para nosotros</p>
    </div>
    
    <!-- Sender Info Banner -->
    <div style="background-color: #1e40af; color: white; padding: 15px 30px; text-align: center;">
      <p style="margin: 0; font-size: 16px;">
        <strong>📧 Contacto directo:</strong> {{user_email}}
      </p>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
        Puede responder directamente a este email para contactar con {{user_name}}
      </p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <div style="margin-bottom: 25px;">
        <h2 style="color: #2d3748; font-size: 22px; margin: 0 0 10px 0;">Estimado/a {{client_name}},</h2>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0 0 15px 0;">
          Esperamos que se encuentre bien. En <strong>{{client_company}}</strong> nos esforzamos constantemente por brindar el mejor servicio posible a nuestros clientes.
        </p>
        
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0;">
          Su experiencia reciente con nuestros servicios es muy valiosa para nosotros, y nos gustaría conocer su opinión para seguir mejorando.
        </p>
      </div>
      
      <!-- Personal Contact Box -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0284c7; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <div style="text-align: center;">
          <h3 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 18px;">👤 Su contacto personal</h3>
          <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px; font-weight: 600;">{{user_name}}</p>
          <p style="margin: 0; color: #0369a1; font-size: 16px;">
            📧 <a href="mailto:{{user_email}}" style="color: #0369a1; text-decoration: none; font-weight: 600;">{{user_email}}</a>
          </p>
        </div>
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
      
      <!-- Additional Questions -->
      <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">También nos encantaría conocer su opinión sobre:</h3>
        <ul style="list-style: none; padding-left: 0; margin: 0;">
          <li style="margin-bottom: 8px; padding-left: 20px; position: relative; color: #4a5568;">
            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">→</span>
            La calidad del servicio recibido
          </li>
          <li style="margin-bottom: 8px; padding-left: 20px; position: relative; color: #4a5568;">
            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">→</span>
            La atención y profesionalismo de nuestro equipo
          </li>
          <li style="margin-bottom: 8px; padding-left: 20px; position: relative; color: #4a5568;">
            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">→</span>
            Los tiempos de respuesta y entrega
          </li>
          <li style="margin-bottom: 8px; padding-left: 20px; position: relative; color: #4a5568;">
            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">→</span>
            La comunicación durante el proceso
          </li>
          <li style="margin-bottom: 0; padding-left: 20px; position: relative; color: #4a5568;">
            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">→</span>
            Sugerencias para mejorar
          </li>
        </ul>
      </div>
      
      <!-- CTA Section -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="mailto:{{user_email}}?subject=Encuesta de Satisfacción - {{client_company}}&body=Estimado/a {{user_name}},%0A%0AMi calificación general es: [Escriba su calificación del 1 al 5]%0A%0AComentarios adicionales:%0A%0A%0AAtentamente,%0A{{client_name}}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          📧 Responder Encuesta
        </a>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0 0 15px 0;">
          <strong>¿Prefiere responder por teléfono?</strong><br>
          No dude en contactarnos directamente a <strong>{{user_email}}</strong>. Su tiempo es valioso y queremos facilitarle el proceso de retroalimentación.
        </p>
        
        <p style="line-height: 1.7; font-size: 16px; color: #4a5568; margin: 0;">
          Agradecemos sinceramente el tiempo que dedique a completar esta encuesta. Sus comentarios nos ayudan a seguir creciendo y mejorando.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #2d3748; color: white; padding: 25px 30px; text-align: center;">
      <p style="margin: 0 0 10px 0; opacity: 0.8;"><strong>Gracias por confiar en {{client_company}}</strong></p>
      <p style="margin: 0 0 20px 0; opacity: 0.8;">Esperamos seguir brindándole un servicio excepcional</p>
      
      <div style="border-top: 1px solid #4a5568; padding-top: 20px; margin-top: 20px; font-size: 14px; opacity: 0.7;">
        <p style="margin: 0 0 5px 0;">📧 <strong>Contacto directo:</strong> {{user_email}}</p>
        <p style="margin: 0 0 10px 0;">👤 <strong>Su representante:</strong> {{user_name}}</p>
        <p style="margin: 0;">Puede responder directamente a este correo para contactarnos</p>
      </div>
    </div>
  </div>
</div>`;

async function updateSurveyWithContactInfo() {
  try {
    console.log('🔄 Actualizando template con información de contacto prominente...');
    
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
        template: professionalSurveyWithContactTemplate
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
      console.log('✅ Template actualizado con información de contacto prominente');
      console.log('📧 Incluye banner con email del usuario');
      console.log('👤 Caja destacada con datos de contacto personal');
      console.log('🔗 Links directos al email personal');
      console.log('📍 Footer con información de contacto');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

updateSurveyWithContactInfo();
