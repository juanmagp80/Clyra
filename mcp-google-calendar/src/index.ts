// Servidor MCP simplificado para Google Calendar
// Versión inicial que funciona sin las dependencias MCP

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GoogleCalendarService } from './services/GoogleCalendarService.js';
import { SupabaseService } from './services/SupabaseService.js';
import { EmailService } from './services/EmailServiceResend.js';
import { MeetingReminderAutomation } from './automations/MeetingReminderAutomation.js';
import { config } from './config/index.js';

class MCPGoogleCalendarServer {
  private googleCalendar: GoogleCalendarService;
  private supabase: SupabaseService;
  private email: EmailService;
  private automation: MeetingReminderAutomation;

  constructor() {
    // Inicializar servicios
    this.googleCalendar = new GoogleCalendarService();
    this.supabase = new SupabaseService();
    this.email = new EmailService();
    this.automation = new MeetingReminderAutomation(
      this.googleCalendar,
      this.supabase,
      this.email
    );

    console.log('🚀 Servidor MCP Google Calendar inicializado');
  }

  /**
   * Sincronizar eventos de Google Calendar con Supabase
   */
  async syncCalendarEvents(args: {
    userId: string;
    timeMin?: string;
    timeMax?: string;
  }) {
    try {
      const { userId, timeMin, timeMax } = args;
      
      const events = await this.googleCalendar.getEvents({
        userId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const syncedEvents = await this.supabase.syncEvents(userId, events);

      return {
        success: true,
        message: `✅ Sincronizados ${syncedEvents.length} eventos de Google Calendar para el usuario ${userId}`,
        data: { syncedCount: syncedEvents.length }
      };
    } catch (error: any) {
      console.error('Error sincronizando eventos:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Crear evento en Google Calendar y Supabase
   */
  async createCalendarEvent(args: {
    userId: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    description?: string;
    clientId?: string;
    location?: string;
  }) {
    try {
      const { userId, title, startDateTime, endDateTime, description, clientId, location } = args;

      // Crear evento en Google Calendar
      const googleEvent = await this.googleCalendar.createEvent({
        userId,
        title,
        startDateTime,
        endDateTime,
        description,
        location,
      });

      // Sincronizar con Supabase
      const supabaseEvent = await this.supabase.createEvent({
        googleEventId: googleEvent.id,
        userId,
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        description,
        clientId,
        location,
        type: 'meeting',
        status: 'scheduled',
      });

      return {
        success: true,
        message: `✅ Evento creado exitosamente: ${title}`,
        data: {
          googleEventId: googleEvent.id,
          supabaseEventId: supabaseEvent.id,
          title,
          startDateTime,
          endDateTime
        }
      };
    } catch (error: any) {
      console.error('Error creando evento:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Enviar recordatorio de reunión
   */
  async sendMeetingReminder(args: {
    eventId: string;
    reminderType: '1_hour' | '3_hours' | '24_hours';
  }) {
    try {
      const { eventId, reminderType } = args;
      const result = await this.automation.sendMeetingReminder(eventId, reminderType);

      return {
        success: result.success,
        message: result.success 
          ? `✅ Recordatorio enviado exitosamente a ${result.recipientEmail}`
          : `❌ Error enviando recordatorio: ${result.error}`,
        data: result
      };
    } catch (error: any) {
      console.error('Error enviando recordatorio:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Obtener reuniones próximas
   */
  async getUpcomingMeetings(args: {
    userId?: string;
    hoursAhead?: number;
  } = {}) {
    try {
      const { userId, hoursAhead = 3 } = args;
      const meetings = await this.automation.getUpcomingMeetings(userId, hoursAhead);

      return {
        success: true,
        message: `📊 Encontradas ${meetings.length} reuniones próximas`,
        data: { meetings, count: meetings.length }
      };
    } catch (error: any) {
      console.error('Error obteniendo reuniones:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Iniciar/detener automatización
   */
  async toggleAutomation(enabled: boolean) {
    try {
      if (enabled) {
        this.automation.start();
        return {
          success: true,
          message: '✅ Automatización de recordatorios iniciada'
        };
      } else {
        this.automation.stop();
        return {
          success: true,
          message: '⏹️ Automatización de recordatorios detenida'
        };
      }
    } catch (error: any) {
      console.error('Error controlando automatización:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Obtener estado de la automatización
   */
  async getAutomationStatus() {
    try {
      const status = this.automation.getStatus();

      return {
        success: true,
        message: 'Estado de automatización obtenido',
        data: status
      };
    } catch (error: any) {
      console.error('Error obteniendo estado:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Ejecutar verificación manual de recordatorios
   */
  async runManualCheck() {
    try {
      const result = await this.automation.runManualCheck();
      
      return {
        success: result.success,
        message: result.success 
          ? `✅ Verificación completada: ${result.processed} procesadas, ${result.errors} errores`
          : '❌ Error en verificación manual',
        data: result
      };
    } catch (error: any) {
      console.error('Error en verificación manual:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Iniciar servidor HTTP simple para pruebas
   */
  async startHTTPServer(port: number = 3001) {
    console.log(`🌐 Servidor HTTP iniciado en puerto ${port}`);
    console.log('📚 Métodos disponibles:');
    console.log('  - syncCalendarEvents(userId, timeMin?, timeMax?)');
    console.log('  - createCalendarEvent(userId, title, startDateTime, endDateTime, ...)');
    console.log('  - sendMeetingReminder(eventId, reminderType)');
    console.log('  - getUpcomingMeetings(userId?, hoursAhead?)');
    console.log('  - toggleAutomation(enabled)');
    console.log('  - getAutomationStatus()');
    console.log('  - runManualCheck()');
    
    // Por ahora solo mostramos que está disponible
    // En una implementación completa, aquí iría un servidor HTTP o MCP real
  }

  async run() {
    console.log('� Iniciando Servidor MCP Google Calendar...');
    
    // Verificar configuración
    console.log('🔧 Verificando configuración...');
    
    // Verificar conexión con email
    const emailOk = await this.email.verifyConnection();
    console.log(`📧 Email: ${emailOk ? '✅' : '❌'}`);
    
    // Iniciar servidor
    await this.startHTTPServer(config.server.port);
    
    console.log('✅ Servidor MCP Google Calendar listo');
    
    // Mantener el proceso activo
    process.stdin.resume();
  }
}

// Inicializar y ejecutar servidor
const server = new MCPGoogleCalendarServer();

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n� Cerrando servidor...');
  process.exit(0);
});

// Inicializar servidor si es ejecutado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  server.run().catch((error) => {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  });
}
