require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceUpdateTemplate() {
  try {
    console.log('🔍 Buscando TODAS las automatizaciones...');
    
    const { data: allAutomations, error } = await supabase
      .from('automations')
      .select('*');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📋 Encontradas ${allAutomations.length} automatizaciones:`);
    
    // Buscar la que contiene el template de debug
    let targetAutomation = null;
    
    allAutomations.forEach((auto, index) => {
      console.log(`${index + 1}. ${auto.name} (ID: ${auto.id})`);
      
      if (auto.actions) {
        try {
          const actions = typeof auto.actions === 'string' ? JSON.parse(auto.actions) : auto.actions;
          const emailAction = Array.isArray(actions) ? actions[0] : actions;
          
          if (emailAction && emailAction.parameters && emailAction.parameters.template) {
            const template = emailAction.parameters.template;
            if (template.includes('🚨 ENVIADO DESDE')) {
              console.log(`   ❌ Esta automatización tiene el template de DEBUG`);
              targetAutomation = auto;
            } else if (template.includes('Mensaje Personal')) {
              console.log(`   ✅ Esta automatización tiene el template profesional`);
            } else {
              console.log(`   ❓ Template desconocido`);
            }
          }
        } catch (e) {
          console.log(`   ⚠️ Error parseando acciones: ${e.message}`);
        }
      }
    });
    
    if (!targetAutomation) {
      console.log('❌ No se encontró automatización con template de debug');
      return;
    }
    
    console.log(`\n🎯 Actualizando automatización: ${targetAutomation.name}`);
    
    // Template profesional final
    const professionalTemplate = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
  
  <!-- ENCABEZADO PROFESIONAL -->
  <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); padding: 30px; text-align: center; color: white;">
    <h1 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 600;">📧 Encuesta de Satisfacción</h1>
    <div style="background: rgba(255,255,255,0.15); padding: 18px; border-radius: 10px; margin: 15px 0;">
      <p style="margin: 0; font-size: 18px; font-weight: bold;">De parte de: {{user_name}}</p>
      <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">{{user_company}} | {{user_email}}</p>
    </div>
  </div>

  <!-- CONTENIDO PRINCIPAL -->
  <div style="padding: 40px 30px; background-color: #fafafa;">
    <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
      Estimado/a <strong>{{client_name}}</strong>,
    </p>
    
    <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 30px;">
      Su opinión es muy importante para nosotros. Nos ayuda a mejorar nuestros servicios y brindarle una mejor experiencia.
    </p>

    <!-- PREGUNTA PRINCIPAL -->
    <div style="background: white; padding: 25px; border-radius: 10px; border-left: 4px solid #3498db; margin: 30px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">¿Cómo calificaría nuestro servicio?</h3>
      <p style="color: #666; margin: 0; font-size: 14px;">Por favor responda con una calificación del 1 al 5 (siendo 5 excelente)</p>
    </div>

    <!-- BOTÓN PRINCIPAL -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="mailto:{{user_email}}?subject=Respuesta: Encuesta de Satisfacción&body=Estimado/a {{user_name}},%0A%0AMi calificación del servicio es: ___/5%0A%0AComentarios adicionales:%0A%0A%0ASaludos cordiales,%0A{{client_name}}" 
         style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); 
                color: white; 
                text-decoration: none; 
                padding: 18px 45px; 
                border-radius: 8px; 
                font-size: 16px; 
                font-weight: 600; 
                display: inline-block; 
                box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);">
        📝 Responder Encuesta
      </a>
    </div>

    <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0;">
      También puede responder directamente a este email
    </p>
  </div>

  <!-- INFORMACIÓN DE CONTACTO -->
  <div style="background: white; padding: 30px; border-top: 1px solid #e0e0e0;">
    <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px; text-align: center;">📞 Información de Contacto</h3>
    <div style="text-align: center; color: #555; font-size: 15px; line-height: 1.8;">
      <p style="margin: 8px 0;"><strong>Email:</strong> {{user_email}}</p>
      <p style="margin: 8px 0;"><strong>Contacto:</strong> {{user_name}}</p>
      <p style="margin: 8px 0;"><strong>Empresa:</strong> {{user_company}}</p>
    </div>
  </div>

  <!-- PIE DE PÁGINA -->
  <div style="background: #f8f9fa; color: #6c757d; padding: 20px; text-align: center; font-size: 12px;">
    <p style="margin: 0;">
      Enviado desde {{user_company}} • {{user_email}}
    </p>
  </div>
  
</div>`;
    
    // Actualizar las acciones
    const currentActions = typeof targetAutomation.actions === 'string' 
      ? JSON.parse(targetAutomation.actions) 
      : targetAutomation.actions;
    
    let actionsArray = Array.isArray(currentActions) ? currentActions : [currentActions];
    
    if (actionsArray[0] && actionsArray[0].type === 'send_email') {
      actionsArray[0].parameters.template = professionalTemplate;
      actionsArray[0].parameters.subject = 'Encuesta de Satisfacción - {{user_company}}';
      
      const { data, error: updateError } = await supabase
        .from('automations')
        .update({
          actions: JSON.stringify(actionsArray),
          updated_at: new Date().toISOString()
        })
        .eq('id', targetAutomation.id)
        .select();

      if (updateError) {
        console.error('❌ Error actualizando:', updateError);
      } else {
        console.log('✅ ¡Template profesional aplicado exitosamente!');
        console.log('');
        console.log('🎨 Nuevo diseño:');
        console.log('  ✨ Diseño limpio y profesional');
        console.log('  🎯 Sin colores estramboticos');
        console.log('  📧 Información de contacto elegante');
        console.log('  💼 Listo para clientes reales');
        console.log('');
        console.log('🔄 Prueba ejecutar la automatización nuevamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

forceUpdateTemplate();
