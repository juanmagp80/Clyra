// Sistema de monitoreo de reuniones
// Este archivo implementa la detección automática de reuniones próximas (1 hora antes)

import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { executeAutomationAction } from '@/src/lib/automation-actions';

interface MeetingReminderData {
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  meeting_time: string;
  meeting_location?: string;
  client_id: string;
  client_name: string;
  client_email: string;
  user_id: string;
  project_name?: string;
}

export async function checkUpcomingMeetings(): Promise<void> {
  try {
    console.log('🔍 Iniciando monitoreo de reuniones próximas...');
    
    const supabase = await createServerSupabaseClient();
    
    // Calcular ventana de tiempo: 1 hora antes de la reunión
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    console.log(`⏰ Buscando reuniones entre ${oneHourFromNow.toLocaleString('es-ES')} y ${twoHoursFromNow.toLocaleString('es-ES')}`);
    
    // 1. Buscar reuniones en la próxima hora
    // Nota: Adaptaremos esto según la estructura real de tu tabla de reuniones
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings') // O la tabla que uses para reuniones
      .select(`
        id,
        title,
        description,
        meeting_date,
        meeting_time,
        location,
        client_id,
        user_id,
        status,
        project_id,
        clients (
          id,
          name,
          email
        ),
        projects (
          id,
          name
        )
      `)
      .eq('status', 'scheduled')
      .gte('meeting_date', oneHourFromNow.toISOString().split('T')[0])
      .lte('meeting_date', twoHoursFromNow.toISOString().split('T')[0]);
    
    if (meetingsError) {
      console.error('❌ Error obteniendo reuniones:', meetingsError);
      
      // Si la tabla meetings no existe, crear datos simulados para demostración
      console.log('⚠️ Tabla meetings no encontrada. Creando datos simulados...');
      await createSampleMeetings(supabase);
      return;
    }
    
    console.log(`📊 Reuniones encontradas: ${meetings?.length || 0}`);
    
    // 2. Filtrar reuniones que requieren recordatorio
    const meetingReminders: MeetingReminderData[] = [];
    
    for (const meeting of meetings || []) {
      // Combinar fecha y hora para verificar si está en la ventana de 1 hora
      const meetingDateTime = new Date(`${meeting.meeting_date}T${meeting.meeting_time || '09:00'}`);
      const timeDiffMs = meetingDateTime.getTime() - now.getTime();
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
      
      // Si la reunión es entre 1 y 2 horas desde ahora
      if (timeDiffHours >= 1 && timeDiffHours <= 2) {
        console.log(`⏰ Reunión próxima: ${meeting.title} en ${timeDiffHours.toFixed(1)} horas`);
        
        const client = Array.isArray(meeting.clients) ? meeting.clients[0] : meeting.clients;
        const project = Array.isArray(meeting.projects) ? meeting.projects[0] : meeting.projects;
        
        meetingReminders.push({
          meeting_id: meeting.id,
          meeting_title: meeting.title,
          meeting_date: new Date(meeting.meeting_date).toLocaleDateString('es-ES'),
          meeting_time: meeting.meeting_time || '09:00',
          meeting_location: meeting.location || 'Por determinar',
          client_id: meeting.client_id,
          client_name: client?.name || 'Cliente',
          client_email: client?.email || '',
          user_id: meeting.user_id,
          project_name: project?.name || 'Reunión general'
        });
      }
    }
    
    // 3. Ejecutar automatización para cada recordatorio
    if (meetingReminders.length > 0) {
      console.log(`📧 Enviando ${meetingReminders.length} recordatorios de reunión...`);
      
      // Obtener la automatización de recordatorio de reunión
      const { data: automation, error: autoError } = await supabase
        .from('automations')
        .select('*')
        .ilike('name', '%recordatorio%reunión%')
        .eq('is_active', true)
        .single();
      
      if (autoError || !automation) {
        console.error('❌ No se encontró automatización de recordatorio de reunión activa');
        console.log('🔧 Creando automatización de recordatorio...');
        await createMeetingReminderAutomation(supabase);
        return;
      }
      
      for (const reminder of meetingReminders) {
        // Verificar si ya se envió recordatorio para esta reunión
        const { data: recentReminder } = await supabase
          .from('automation_executions')
          .select('id')
          .eq('automation_id', automation.id)
          .eq('metadata->meeting_id', reminder.meeting_id)
          .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Últimas 2 horas
          .single();
        
        if (recentReminder) {
          console.log(`⏭️ Recordatorio ya enviado para reunión ${reminder.meeting_title}`);
          continue;
        }
        
        // Obtener información del usuario responsable
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', reminder.user_id)
          .single();
        
        const userInfo = {
          id: reminder.user_id,
          email: userProfile?.email || '',
          user_metadata: {
            full_name: userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Usuario'
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as any;
        
        // Preparar payload para la automatización
        const payload = {
          client: {
            id: reminder.client_id,
            name: reminder.client_name,
            email: reminder.client_email
          },
          automation: automation,
          user: userInfo,
          supabase: supabase,
          executionId: `meeting-${reminder.meeting_id}-${Date.now()}`,
          // Variables específicas de la reunión
          meeting_title: reminder.meeting_title,
          meeting_date: reminder.meeting_date,
          meeting_time: reminder.meeting_time,
          meeting_location: reminder.meeting_location,
          project_name: reminder.project_name
        };
        
        try {
          // Ejecutar la automatización
          const result = await executeAutomationAction(
            JSON.parse(automation.actions)[0], 
            payload
          );
          
          if (result.success) {
            console.log(`✅ Recordatorio enviado para reunión: ${reminder.meeting_title}`);
            
            // Registrar la ejecución
            await supabase
              .from('automation_executions')
              .insert({
                automation_id: automation.id,
                user_id: reminder.user_id,
                client_id: reminder.client_id,
                execution_id: payload.executionId,
                status: 'success',
                metadata: {
                  meeting_id: reminder.meeting_id,
                  meeting_title: reminder.meeting_title,
                  meeting_date: reminder.meeting_date,
                  meeting_time: reminder.meeting_time,
                  trigger_type: 'meeting_reminder'
                },
                executed_at: new Date().toISOString()
              });
            
            // Actualizar contador de ejecuciones
            await supabase
              .from('automations')
              .update({ 
                execution_count: (automation.execution_count || 0) + 1,
                last_executed: new Date().toISOString()
              })
              .eq('id', automation.id);
              
          } else {
            console.error(`❌ Error enviando recordatorio para ${reminder.meeting_title}:`, result.message);
          }
          
        } catch (execError) {
          console.error(`❌ Error ejecutando automatización para ${reminder.meeting_title}:`, execError);
        }
      }
      
    } else {
      console.log('✅ No hay reuniones próximas que requieran recordatorio');
    }
    
  } catch (error) {
    console.error('❌ Error en monitoreo de reuniones:', error);
  }
}

// Función para crear automatización de recordatorio si no existe
async function createMeetingReminderAutomation(supabase: any): Promise<void> {
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

  const { error } = await supabase
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
    });
    
  if (error) {
    console.error('❌ Error creando automatización:', error);
  } else {
    console.log('✅ Automatización de recordatorio de reunión creada');
  }
}

// Función para crear reuniones de ejemplo si no existen
async function createSampleMeetings(supabase: any): Promise<void> {
  console.log('🔧 Creando tabla de reuniones y datos de ejemplo...');
  
  // Crear reunión de ejemplo para 1.5 horas desde ahora
  const futureDate = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
  const meetingDate = futureDate.toISOString().split('T')[0];
  const meetingTime = futureDate.toTimeString().split(' ')[0].substring(0, 5);
  
  // Esta función se ejecutaría después de crear la tabla meetings
  console.log(`📅 Reunión de ejemplo programada para: ${meetingDate} ${meetingTime}`);
  console.log('💡 Crea la tabla "meetings" en Supabase con las siguientes columnas:');
  console.log('   - id (uuid, primary key)');
  console.log('   - title (text)');
  console.log('   - description (text)');
  console.log('   - meeting_date (date)');
  console.log('   - meeting_time (time)');
  console.log('   - location (text)');
  console.log('   - client_id (uuid, foreign key to clients)');
  console.log('   - user_id (uuid, foreign key to profiles)');
  console.log('   - project_id (uuid, foreign key to projects)');
  console.log('   - status (text, default: "scheduled")');
  console.log('   - created_at (timestamp)');
  console.log('   - updated_at (timestamp)');
}

// Función principal para ejecutar manualmente o por cron job
export async function runMeetingReminderMonitoring(): Promise<{ success: boolean; message: string; remindersSent: number }> {
  try {
    await checkUpcomingMeetings();
    return {
      success: true,
      message: 'Monitoreo de recordatorios de reunión completado',
      remindersSent: 0 // Se podría mejorar para devolver el número real
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      remindersSent: 0
    };
  }
}
