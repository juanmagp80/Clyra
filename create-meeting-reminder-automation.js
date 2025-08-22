require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMeetingReminderAutomation() {
  console.log('🔧 Creando automatización de recordatorio de reunión...');
  
  const meetingReminderTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio de Reunión</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 25px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">📅 Recordatorio de Reunión</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Su reunión está programada en 1 hora
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Información del responsable -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #e3f2fd; border-bottom: 1px solid #bbdefb;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 14px; color: #1565c0;">
                                            <strong>Organizador:</strong> {{user_name}}<br>
                                            <strong>Email:</strong> {{user_email}}<br>
                                            <strong>Empresa:</strong> {{user_company}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Contenido principal -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                                Estimado/a <strong>{{client_name}}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                Le recordamos que tiene una reunión programada con nosotros en aproximadamente <strong>1 hora</strong>.
                            </p>
                            
                            <!-- Detalles de la reunión -->
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; border-left: 4px solid #007bff; margin: 25px 0;">
                                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #007bff; font-weight: 600;">
                                    📋 Detalles de la Reunión
                                </h3>
                                <table width="100%" cellpadding="8" cellspacing="0" border="0" style="font-size: 14px;">
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Asunto:</td>
                                        <td style="color: #555;">{{meeting_title}}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Fecha:</td>
                                        <td style="color: #555;">{{meeting_date}}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Hora:</td>
                                        <td style="color: #555; font-weight: 600;">{{meeting_time}}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Ubicación:</td>
                                        <td style="color: #555;">{{meeting_location}}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Proyecto:</td>
                                        <td style="color: #555;">{{project_name}}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                <strong>Importante:</strong> Si necesita reprogramar o cancelar la reunión, por favor contáctenos lo antes posible.
                            </p>
                            
                            <!-- Call to action -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #28a745; border-radius: 6px; padding: 14px 28px;">
                                                    <a href="mailto:{{user_email}}?subject=Confirmación reunión - {{meeting_title}}&body=Estimado/a {{user_name}},%0A%0AConfirmo mi asistencia a la reunión:%0A- Fecha: {{meeting_date}}%0A- Hora: {{meeting_time}}%0A- Asunto: {{meeting_title}}%0A%0ASaludos,%0A{{client_name}}" 
                                                       style="color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; display: block;">
                                                        ✅ Confirmar Asistencia
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; font-size: 15px; color: #555555; line-height: 1.6;">
                                Esperamos verle pronto. Si tiene alguna pregunta, no dude en contactarnos.
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Información de contacto -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e8e8e8;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333333; font-weight: 600;">
                                📞 Información de Contacto
                            </h3>
                            <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                <strong>{{user_name}}</strong><br>
                                {{user_company}}<br>
                                Email: <a href="mailto:{{user_email}}" style="color: #007bff; text-decoration: none;">{{user_email}}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 20px 40px 30px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
                            <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.4;">
                                Recordatorio automático del sistema de gestión de {{user_company}}<br>
                                Para consultas, contáctenos en {{user_email}}
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`;

  const { data, error } = await supabase
    .from('automations')
    .insert({
      name: 'Recordatorio de Reunión',
      description: 'Envía recordatorios automáticos a clientes 1 hora antes de las reuniones programadas',
      trigger_type: 'meeting_reminder',
      trigger_conditions: JSON.stringify({
        minutes_before: 60,
        meeting_status: 'scheduled'
      }),
      actions: JSON.stringify([{
        type: 'send_email',
        name: 'Enviar recordatorio de reunión',
        parameters: {
          subject: '📅 Recordatorio: Reunión {{meeting_title}} - {{user_company}}',
          template: meetingReminderTemplate
        }
      }]),
      is_active: true,
      user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
    })
    .select();
    
  if (error) {
    console.error('❌ Error creando automatización:', error);
  } else {
    console.log('✅ Automatización de recordatorio de reunión creada exitosamente!');
    console.log('🆔 ID:', data[0].id);
    console.log('📝 Nombre:', data[0].name);
    console.log('📊 Estado: Activa');
    
    // Probar la automatización con datos simulados
    console.log('');
    console.log('🧪 Probando automatización con datos simulados...');
    await testAutomationWithSimulatedData(data[0]);
  }
}

async function testAutomationWithSimulatedData(automation) {
  // Obtener cliente existente
  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c')
    .limit(1);
  
  if (!existingClient || existingClient.length === 0) {
    console.log('❌ No hay clientes disponibles para la prueba');
    return;
  }
  
  const client = existingClient[0];
  const futureDate = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
  
  const emailData = {
    to: 'juangpdev@gmail.com', // Tu email para la prueba
    subject: '📅 Recordatorio: Reunión de Seguimiento - INSTELCA S.L.U',
    variables: {
      meeting_title: 'Reunión de Seguimiento del Proyecto',
      meeting_date: futureDate.toLocaleDateString('es-ES'),
      meeting_time: futureDate.toTimeString().split(' ')[0].substring(0, 5),
      meeting_location: 'Oficina principal / Video llamada',
      client_name: client.name,
      user_name: 'Juan García',
      user_email: 'juangpdev@gmail.com',
      user_company: 'INSTELCA S.L.U',
      project_name: 'Desarrollo Web Corporativo'
    }
  };
  
  // Obtener template y reemplazar variables
  const template = JSON.parse(automation.actions)[0].parameters.template;
  let htmlContent = template;
  
  Object.entries(emailData.variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, value);
  });
  
  // Enviar email de prueba
  const response = await fetch('http://localhost:3000/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: emailData.to,
      subject: emailData.subject,
      html: htmlContent,
      replyTo: emailData.variables.user_email
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ Email de prueba enviado exitosamente!');
    console.log('📧 ID del email:', result.id);
    console.log('📬 Destinatario:', emailData.to);
    console.log('');
    console.log('🎉 ¡Sistema de recordatorios de reunión configurado y funcionando!');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. Crear tabla "meetings" en Supabase');
    console.log('2. Agregar reuniones reales al sistema');
    console.log('3. Configurar cron job para ejecución automática');
    console.log('4. Monitorear desde /admin/meeting-reminder');
  } else {
    console.error('❌ Error enviando email de prueba:', response.status);
    const errorText = await response.text();
    console.error('Error details:', errorText);
  }
}

createMeetingReminderAutomation();
