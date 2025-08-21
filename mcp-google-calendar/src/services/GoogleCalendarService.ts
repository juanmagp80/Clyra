import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';
import { GoogleCalendarEvent } from '../types/index.js';

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Configurar tokens de autenticación para un usuario
   */
  async setUserCredentials(userId: string, tokens: any) {
    this.oauth2Client.setCredentials(tokens);
    
    // Aquí podrías guardar los tokens en base de datos para persistencia
    // Por ahora, los guardamos en memoria
  }

  /**
   * Obtener URL de autorización para OAuth
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Intercambiar código de autorización por tokens
   */
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Obtener eventos del calendar de Google
   */
  async getEvents(params: {
    userId: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }): Promise<GoogleCalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: params.timeMin || new Date().toISOString(),
        timeMax: params.timeMax,
        maxResults: params.maxResults || 250,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items?.map((event: any) => ({
        id: event.id,
        summary: event.summary || '',
        description: event.description,
        start: {
          dateTime: event.start.dateTime || event.start.date,
          timeZone: event.start.timeZone,
        },
        end: {
          dateTime: event.end.dateTime || event.end.date,
          timeZone: event.end.timeZone,
        },
        location: event.location,
        attendees: event.attendees?.map((attendee: any) => ({
          email: attendee.email,
          displayName: attendee.displayName,
        })) || [],
      })) || [];
    } catch (error) {
      console.error('Error obteniendo eventos de Google Calendar:', error);
      throw new Error(`Error obteniendo eventos: ${error}`);
    }
  }

  /**
   * Crear un evento en Google Calendar
   */
  async createEvent(params: {
    userId: string;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    location?: string;
    attendees?: string[];
  }): Promise<GoogleCalendarEvent> {
    try {
      const event = {
        summary: params.title,
        description: params.description,
        start: {
          dateTime: params.startDateTime,
          timeZone: config.automation.timezone,
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: config.automation.timezone,
        },
        location: params.location,
        attendees: params.attendees?.map(email => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 }, // 1 hora antes
            { method: 'popup', minutes: 15 }, // 15 minutos antes
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        start: {
          dateTime: response.data.start.dateTime,
          timeZone: response.data.start.timeZone,
        },
        end: {
          dateTime: response.data.end.dateTime,
          timeZone: response.data.end.timeZone,
        },
        location: response.data.location,
        attendees: response.data.attendees?.map((attendee: any) => ({
          email: attendee.email,
          displayName: attendee.displayName,
        })) || [],
      };
    } catch (error) {
      console.error('Error creando evento en Google Calendar:', error);
      throw new Error(`Error creando evento: ${error}`);
    }
  }

  /**
   * Actualizar un evento en Google Calendar
   */
  async updateEvent(eventId: string, updates: Partial<GoogleCalendarEvent>) {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: {
          summary: updates.summary,
          description: updates.description,
          start: updates.start,
          end: updates.end,
          location: updates.location,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error actualizando evento en Google Calendar:', error);
      throw new Error(`Error actualizando evento: ${error}`);
    }
  }

  /**
   * Eliminar un evento de Google Calendar
   */
  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error eliminando evento de Google Calendar:', error);
      throw new Error(`Error eliminando evento: ${error}`);
    }
  }

  /**
   * Verificar conectividad con Google Calendar
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.calendar.calendarList.list();
      return true;
    } catch (error) {
      console.error('Error verificando conexión con Google Calendar:', error);
      return false;
    }
  }
}
