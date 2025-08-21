import cron from 'node-cron';

// Declaración manual del tipo ScheduleOptions (según @types/node-cron)
type ScheduleOptions = {
  scheduled?: boolean;
  timezone?: string;
  recoverMissedExecutions?: boolean;
  name?: string;
  runOnInit?: boolean;
};
import { GoogleCalendarService } from '../services/GoogleCalendarService.js';
import { SupabaseService } from '../services/SupabaseService.js';
import { EmailService } from '../services/EmailService.js';
import { config } from '../config/index.js';
import { CalendarEvent, Client, AutomationStatus } from '../types/index.js';

export class MeetingReminderAutomation {
  private googleCalendar: GoogleCalendarService;
  private supabase: SupabaseService;
  private email: EmailService;
  private cronJob?: import('node-cron').ScheduledTask;
  private status: AutomationStatus;

  constructor(
    googleCalendar: GoogleCalendarService,
    supabase: SupabaseService,
    email: EmailService
  ) {
    this.googleCalendar = googleCalendar;
    this.supabase = supabase;
    this.email = email;
    
    this.status = {
      isRunning: false,
      remindersToday: 0,
      errors: 0,
    };
  }

  /**
   * Iniciar la automatización
   */
  start() {
    if (this.cronJob) {
      this.stop();
    }

    console.log('🚀 Iniciando automatización de recordatorios...');
    console.log(`⏰ Patrón cron: ${config.automation.cronPattern}`);

    this.cronJob = cron.schedule(
      config.automation.cronPattern,
      async () => {
        await this.runReminderCheck();
      },
      {
        scheduled: true,
        timezone: config.automation.timezone,
      } as ScheduleOptions
    );

    this.status.isRunning = true;
    console.log('✅ Automatización iniciada exitosamente');
  }

  /**
   * Detener la automatización
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob.destroy();
      this.cronJob = undefined;
    }

    this.status.isRunning = false;
    console.log('⏹️ Automatización detenida');
  }

  /**
   * Obtener estado de la automatización
   */
  getStatus(): AutomationStatus {
    return { ...this.status };
  }

  /**
   * Ejecutar verificación de recordatorios
   */
  private async runReminderCheck() {
    try {
      console.log('🔍 Ejecutando verificación de recordatorios...');
      this.status.lastRun = new Date().toISOString();

      // Obtener reuniones que necesitan recordatorios
      const upcomingMeetings = await this.supabase.getUpcomingMeetings(undefined, 3);
      
      if (upcomingMeetings.length === 0) {
        console.log('📭 No hay reuniones próximas que requieran recordatorios');
        return;
      }

      console.log(`📊 Encontradas ${upcomingMeetings.length} reuniones próximas`);

      for (const meeting of upcomingMeetings) {
        await this.processMeetingReminders(meeting);
      }

      // Actualizar estadísticas
      const stats = await this.supabase.getReminderStats();
      this.status.remindersToday = stats.sent;
      this.status.errors = stats.errors;

    } catch (error) {
      console.error('❌ Error en verificación de recordatorios:', error);
      this.status.errors++;
    }
  }

  /**
   * Procesar recordatorios para una reunión específica
   */
  private async processMeetingReminders(meeting: CalendarEvent & { client?: Client }) {
    try {
      if (!meeting.client?.email) {
        console.log(`⚠️ Reunión "${meeting.title}" no tiene cliente con email válido`);
        return;
      }

      const now = new Date();
      const meetingTime = new Date(meeting.startTime);
      const hoursUntilMeeting = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Determinar qué tipo de recordatorio enviar
      let reminderType: '1_hour' | '3_hours' | '24_hours' | null = null;

      if (hoursUntilMeeting <= 1.5 && hoursUntilMeeting > 0.5) {
        reminderType = '1_hour';
      } else if (hoursUntilMeeting <= 3.5 && hoursUntilMeeting > 2.5) {
        reminderType = '3_hours';
      } else if (hoursUntilMeeting <= 25 && hoursUntilMeeting > 23) {
        reminderType = '24_hours';
      }

      if (!reminderType) {
        return; // No es momento para ningún recordatorio
      }

      // Verificar si ya se envió este tipo de recordatorio
      const alreadySent = await this.supabase.wasReminderSent(meeting.id, reminderType);
      if (alreadySent) {
        console.log(`📨 Recordatorio ${reminderType} ya fue enviado para "${meeting.title}"`);
        return;
      }

      // Enviar recordatorio
      const result = await this.sendMeetingReminder(meeting.id, reminderType);
      
      if (result.success) {
        console.log(`✅ Recordatorio ${reminderType} enviado para "${meeting.title}" a ${meeting.client.email}`);
      } else {
        console.log(`❌ Error enviando recordatorio para "${meeting.title}": ${result.error}`);
      }

    } catch (error) {
      console.error(`❌ Error procesando recordatorio para reunión ${meeting.id}:`, error);
    }
  }

  /**
   * Enviar recordatorio de reunión
   */
  async sendMeetingReminder(
    eventId: string, 
    reminderType: '1_hour' | '3_hours' | '24_hours'
  ): Promise<{ success: boolean; error?: string; recipientEmail?: string }> {
    try {
      // Obtener detalles del evento
      const meeting = await this.supabase.getEvent(eventId);
      
      if (!meeting) {
        return { success: false, error: 'Evento no encontrado' };
      }

      if (!meeting.client?.email) {
        return { success: false, error: 'Cliente no tiene email válido' };
      }

      // Enviar email
      const emailResult = await this.email.sendMeetingReminder({
        recipientEmail: meeting.client.email,
        recipientName: meeting.client.name,
        meetingTitle: meeting.title,
        meetingDate: new Date(meeting.startTime),
        meetingLocation: meeting.location,
        reminderType: reminderType,
        professionalName: 'Su profesional', // Podrías obtener esto del usuario
        meetingDescription: meeting.description,
      });

      // Registrar el intento de envío
      await this.supabase.recordReminderSent({
        eventId: eventId,
        reminderType: reminderType,
        recipientEmail: meeting.client.email,
        success: emailResult.success,
        error: emailResult.error,
      });

      return {
        success: emailResult.success,
        error: emailResult.error,
        recipientEmail: meeting.client.email,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error enviando recordatorio:', errorMessage);
      
      // Intentar registrar el error
      try {
        await this.supabase.recordReminderSent({
          eventId: eventId,
          reminderType: reminderType,
          recipientEmail: 'unknown',
          success: false,
          error: errorMessage,
        });
      } catch (recordError) {
        console.error('❌ Error registrando fallo de recordatorio:', recordError);
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Obtener reuniones próximas
   */
  async getUpcomingMeetings(
    userId?: string, 
    hoursAhead: number = 3
  ): Promise<(CalendarEvent & { client?: Client })[]> {
    return await this.supabase.getUpcomingMeetings(userId, hoursAhead);
  }

  /**
   * Ejecutar sincronización manual con Google Calendar
   */
  async syncWithGoogleCalendar(userId: string) {
    try {
      console.log(`🔄 Iniciando sincronización con Google Calendar para usuario ${userId}...`);
      
      // Obtener eventos de Google Calendar (próximos 30 días)
      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const googleEvents = await this.googleCalendar.getEvents({
        userId: userId,
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
      });

      // Sincronizar con Supabase
      const syncedEvents = await this.supabase.syncEvents(userId, googleEvents);
      
      console.log(`✅ Sincronizados ${syncedEvents.length} eventos para usuario ${userId}`);
      return { success: true, syncedCount: syncedEvents.length };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en sincronización:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Ejecutar verificación manual de recordatorios
   */
  async runManualCheck(): Promise<{ success: boolean; processed: number; errors: number }> {
    try {
      console.log('🔍 Ejecutando verificación manual de recordatorios...');
      
      const upcomingMeetings = await this.supabase.getUpcomingMeetings(undefined, 25); // 25 horas para incluir recordatorios de 24h
      
      let processed = 0;
      let errors = 0;

      for (const meeting of upcomingMeetings) {
        try {
          await this.processMeetingReminders(meeting);
          processed++;
        } catch (error) {
          console.error(`Error procesando reunión ${meeting.id}:`, error);
          errors++;
        }
      }

      console.log(`✅ Verificación manual completada: ${processed} procesadas, ${errors} errores`);
      
      return { success: true, processed, errors };
    } catch (error) {
      console.error('❌ Error en verificación manual:', error);
      return { success: false, processed: 0, errors: 1 };
    }
  }
}
