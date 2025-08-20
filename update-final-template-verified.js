require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAutomation() {
  try {
    console.log('🔄 Actualizando automatización con template verificado...');

    // Template final profesional con información de contacto prominente
    const surveyTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  
  <!-- BANNER PRINCIPAL CON INFO DE CONTACTO -->
  <div style="background: linear-gradient(135deg, #007acc 0%, #0056b3 100%); padding: 25px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0 0 15px 0; font-size: 28px; font-weight: bold;">📧 Mensaje Personal</h1>
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; font-size: 18px; font-weight: bold;">✉️ Enviado desde: {{user_email}}</p>
      <p style="margin: 5px 0 0 0; font-size: 16px;">👤 {{user_name}} | 🏢 {{user_company}}</p>
    </div>
  </div>

  <!-- CONTENIDO PRINCIPAL -->
  <div style="padding: 30px; background-color: #f8f9fa;">
    <h2 style="color: #333; margin: 0 0 20px 0;">Encuesta de Satisfacción</h2>
    
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Estimado/a cliente de <strong>{{client_company}}</strong>,
    </p>
    
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Esperamos que esté satisfecho con nuestros servicios. Su opinión es muy importante para nosotros y nos ayuda a mejorar continuamente.
    </p>

    <!-- BOTÓN DE ENCUESTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://forms.google.com/satisfaction-survey" 
         style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                color: white; 
                text-decoration: none; 
                padding: 15px 40px; 
                border-radius: 25px; 
                font-size: 18px; 
                font-weight: bold; 
                display: inline-block; 
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
        📝 Completar Encuesta (2 minutos)
      </a>
    </div>

    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      La encuesta le tomará aproximadamente 2 minutos y su feedback nos ayudará a servirle mejor en el futuro.
    </p>
  </div>

  <!-- INFORMACIÓN DE CONTACTO DESTACADA -->
  <div style="background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; margin: 20px; border-radius: 8px;">
    <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📞 Información de Contacto</h3>
    <div style="color: #856404; font-size: 16px; line-height: 1.8;">
      <p style="margin: 5px 0;"><strong>✉️ Email:</strong> {{user_email}}</p>
      <p style="margin: 5px 0;"><strong>👤 Contacto:</strong> {{user_name}}</p>
      <p style="margin: 5px 0;"><strong>🏢 Empresa:</strong> {{user_company}}</p>
    </div>
    <p style="color: #856404; font-size: 14px; margin: 15px 0 0 0; font-style: italic;">
      No dude en contactarnos directamente si tiene alguna pregunta o necesita asistencia.
    </p>
  </div>

  <!-- PIE DE PÁGINA -->
  <div style="background-color: #343a40; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
    <p style="margin: 0; font-size: 14px;">
      Este email fue enviado desde: <strong>{{user_email}}</strong>
    </p>
    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
      {{user_company}} • Sistema de Gestión Taskelio
    </p>
  </div>
  
</div>`;

    // Buscar automatización por nombre que contenga "satisfac"
    const { data: automations, error: searchError } = await supabase
      .from('automations')
      .select('*')
      .ilike('name', '%satisfac%');

    if (searchError) {
      console.error('❌ Error buscando automatización:', searchError);
      return;
    }

    if (automations.length === 0) {
      console.log('❌ No se encontró automatización de satisfacción');
      // Listar todas las automatizaciones para debug
      const { data: allAutos } = await supabase.from('automations').select('id, name').limit(10);
      console.log('📋 Automatizaciones disponibles:');
      allAutos?.forEach(auto => console.log(`- ${auto.name} (${auto.id})`));
      return;
    }

    const automation = automations[0];
    console.log('✅ Encontrada automatización:', automation.name, `(${automation.id})`);

    // Parsear acciones actuales
    const currentActions = JSON.parse(automation.actions);
    console.log('📋 Acciones actuales:', currentActions.length);

    // Actualizar el template en la primera acción de email
    if (currentActions.length > 0 && currentActions[0].type === 'send_email') {
      currentActions[0].parameters.template = surveyTemplate;
      currentActions[0].parameters.subject = 'Encuesta de Satisfacción - {{user_company}}';

      console.log('🔄 Actualizando template de la acción...');

      const { data, error } = await supabase
        .from('automations')
        .update({
          actions: JSON.stringify(currentActions),
          updated_at: new Date().toISOString()
        })
        .eq('id', automation.id)
        .select();

      if (error) {
        console.error('❌ Error actualizando automatización:', error);
      } else {
        console.log('✅ Template actualizado exitosamente!');
        console.log('📧 Nuevo template incluye:');
        console.log('  - Banner azul con info de contacto');
        console.log('  - Email del usuario prominente');
        console.log('  - Sección de contacto destacada');
        console.log('  - Pie de página con remitente');
        console.log('  - Dominio verificado (noreply@taskelio.app)');
      }
    } else {
      console.log('❌ No se encontró acción de email para actualizar');
    }

  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

updateAutomation();
