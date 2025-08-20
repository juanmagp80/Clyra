require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateToFinalTemplate() {
  try {
    console.log('🔄 Actualizando a template final profesional...');

    // Template final profesional y elegante
    const finalTemplate = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
  
  <!-- ENCABEZADO PRINCIPAL -->
  <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); padding: 30px; text-align: center; color: white;">
    <h1 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 600;">📧 Mensaje Personal</h1>
    <div style="background: rgba(255,255,255,0.15); padding: 18px; border-radius: 10px; margin: 15px 0;">
      <p style="margin: 0; font-size: 20px; font-weight: bold;">✉️ De: {{user_email}}</p>
      <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">👤 {{user_name}} | 🏢 {{user_company}}</p>
    </div>
  </div>

  <!-- CONTENIDO PRINCIPAL -->
  <div style="padding: 40px 30px; background-color: #fafafa;">
    <h2 style="color: #2c3e50; margin: 0 0 25px 0; font-size: 24px; font-weight: 600;">Encuesta de Satisfacción</h2>
    
    <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
      Estimado/a cliente de <strong style="color: #3498db;">{{client_company}}</strong>,
    </p>
    
    <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 30px;">
      Su opinión es fundamental para nosotros. Nos ayuda a mejorar nuestros servicios y brindarle una experiencia excepcional.
    </p>

    <!-- BOTÓN PRINCIPAL -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="mailto:{{user_email}}?subject=Respuesta Encuesta de Satisfacción - {{user_company}}&body=Estimado/a {{user_name}},%0A%0AMi calificación del servicio es: [Por favor escriba del 1 al 5]%0A%0AComentarios adicionales:%0A%0ASaludos cordiales" 
         style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); 
                color: white; 
                text-decoration: none; 
                padding: 18px 45px; 
                border-radius: 30px; 
                font-size: 18px; 
                font-weight: 600; 
                display: inline-block; 
                box-shadow: 0 5px 20px rgba(46, 204, 113, 0.4);
                transition: all 0.3s ease;">
        📝 Responder Encuesta (2 minutos)
      </a>
    </div>

    <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0;">
      También puede responder directamente a este email con su calificación del 1 al 5
    </p>
  </div>

  <!-- SECCIÓN DE CONTACTO DESTACADA -->
  <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-top: 3px solid #3498db; padding: 30px; margin: 0;">
    <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">📞 Información de Contacto</h3>
    <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; color: #2c3e50; font-size: 16px; line-height: 2;">
        <p style="margin: 8px 0;"><strong>✉️ Email directo:</strong> <span style="color: #3498db; font-weight: bold;">{{user_email}}</span></p>
        <p style="margin: 8px 0;"><strong>👤 Su contacto:</strong> {{user_name}}</p>
        <p style="margin: 8px 0;"><strong>🏢 Empresa:</strong> {{user_company}}</p>
      </div>
      <p style="color: #6c757d; font-size: 14px; margin: 20px 0 0 0; text-align: center; font-style: italic;">
        No dude en contactarnos directamente para cualquier consulta o asistencia adicional.
      </p>
    </div>
  </div>

  <!-- PIE DE PÁGINA ELEGANTE -->
  <div style="background: #2c3e50; color: white; padding: 25px; text-align: center;">
    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">
      📧 Mensaje enviado desde: <span style="color: #3498db; font-weight: bold;">{{user_email}}</span>
    </p>
    <p style="margin: 0; font-size: 12px; opacity: 0.8;">
      {{user_company}} • Sistema de Gestión Profesional
    </p>
  </div>
  
</div>`;

    // Obtener la automatización de satisfacción
    const { data: automations, error: searchError } = await supabase
      .from('automations')
      .select('*')
      .ilike('name', '%satisfac%')
      .single();

    if (searchError) {
      console.error('❌ Error:', searchError);
      return;
    }

    console.log('✅ Automatización encontrada:', automations.name);
    console.log('📋 ID:', automations.id);

    // Parsear acciones - puede ser un objeto o un array
    let actions;
    if (typeof automations.actions === 'string') {
      const parsed = JSON.parse(automations.actions);
      // Si es un objeto, convertirlo a array
      actions = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      actions = Array.isArray(automations.actions) ? automations.actions : [automations.actions];
    }

    console.log('📧 Acciones encontradas:', actions.length);

    // Actualizar el template de la primera acción de email
    if (actions.length > 0 && actions[0].type === 'send_email') {
      actions[0].parameters.template = finalTemplate;
      // Mantener el subject normal (sin TEST)
      actions[0].parameters.subject = 'Encuesta de Satisfacción - {{user_company}}';

      console.log('🔄 Actualizando template profesional...');

      const { data, error } = await supabase
        .from('automations')
        .update({
          actions: JSON.stringify(actions), // Siempre guardar como array
          updated_at: new Date().toISOString()
        })
        .eq('id', automations.id)
        .select();

      if (error) {
        console.error('❌ Error actualizando:', error);
      } else {
        console.log('✅ ¡Template profesional actualizado exitosamente!');
        console.log('');
        console.log('📧 Características del nuevo template:');
        console.log('  ✨ Diseño profesional y elegante');
        console.log('  📧 Email del usuario prominente en encabezado azul');
        console.log('  📞 Sección de contacto destacada');
        console.log('  🎯 Botón directo para responder por email');
        console.log('  🔧 Dominio verificado (noreply@taskelio.app)');
        console.log('  💼 Sin banners de debug - listo para producción');
        console.log('');
        console.log('🎉 ¡Listo para enviar emails profesionales!');
      }
    } else {
      console.log('❌ No se encontró acción de email');
    }

  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

updateToFinalTemplate();
