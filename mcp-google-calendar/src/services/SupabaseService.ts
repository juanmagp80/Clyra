import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { CalendarEvent, Client, GoogleCalendarEvent } from '../types/index.js';

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );
  }

  /**
   * Sincronizar eventos de Google Calendar con Supabase
   */
  async syncEvents(userId: string, googleEvents: GoogleCalendarEvent[]): Promise<CalendarEvent[]> {
    const syncedEvents: CalendarEvent[] = [];

    for (const googleEvent of googleEvents) {
      try {
        // Verificar si el evento ya existe
        const { data: existingEvent } = await this.supabase
          .from('calendar_events')
          .select('*')
          .eq('google_event_id', googleEvent.id)
          .eq('user_id', userId)
          .single();

        const eventData = {
          google_event_id: googleEvent.id,
          user_id: userId,
          title: googleEvent.summary,
          description: googleEvent.description,
          start_time: googleEvent.start.dateTime,
          end_time: googleEvent.end.dateTime,
          location: googleEvent.location,
          type: 'meeting' as const,
          status: 'scheduled' as const,
          updated_at: new Date().toISOString(),
        };

        let result;

        if (existingEvent) {
          // Actualizar evento existente
          const { data, error } = await this.supabase
            .from('calendar_events')
            .update(eventData)
            .eq('id', existingEvent.id)
            .select()
            .single();

          if (error) throw error;
          result = data;
        } else {
          // Crear nuevo evento
          const { data, error } = await this.supabase
            .from('calendar_events')
            .insert({
              ...eventData,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          result = data;
        }

        syncedEvents.push(result);
      } catch (error) {
        console.error(`Error sincronizando evento ${googleEvent.id}:`, error);
      }
    }

    return syncedEvents;
  }

  /**
   * Crear un evento en Supabase
   */
  async createEvent(eventData: {
    googleEventId?: string;
    userId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    clientId?: string;
    type: string;
    status: string;
  }): Promise<CalendarEvent> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .insert({
        google_event_id: eventData.googleEventId,
        user_id: eventData.userId,
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        location: eventData.location,
        client_id: eventData.clientId,
        type: eventData.type,
        status: eventData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando evento en Supabase: ${error.message}`);
    }

    return {
      id: data.id,
      googleEventId: data.google_event_id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      clientId: data.client_id,
      type: data.type,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Obtener eventos próximos que necesitan recordatorios
   */
  async getUpcomingMeetings(
    userId?: string,
    hoursAhead: number = 3
  ): Promise<(CalendarEvent & { client?: Client })[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    let query = this.supabase
      .from('calendar_events')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone,
          company
        )
      `)
      .eq('type', 'meeting')
      .eq('status', 'scheduled')
      .gte('start_time', now.toISOString())
      .lte('start_time', futureTime.toISOString())
      .order('start_time');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error obteniendo reuniones próximas: ${error.message}`);
    }

    return data?.map((event: any) => ({
      id: event.id,
      googleEventId: event.google_event_id,
      userId: event.user_id,
      title: event.title,
      description: event.description,
      startTime: event.start_time,
      endTime: event.end_time,
      location: event.location,
      clientId: event.client_id,
      type: event.type,
      status: event.status,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      client: event.clients ? {
        id: event.clients.id,
        name: event.clients.name,
        email: event.clients.email,
        phone: event.clients.phone,
        company: event.clients.company,
        userId: event.user_id,
      } : undefined,
    })) || [];
  }

  /**
   * Obtener un evento específico por ID
   */
  async getEvent(eventId: string): Promise<CalendarEvent & { client?: Client } | null> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone,
          company
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw new Error(`Error obteniendo evento: ${error.message}`);
    }

    return {
      id: data.id,
      googleEventId: data.google_event_id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      clientId: data.client_id,
      type: data.type,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      client: data.clients ? {
        id: data.clients.id,
        name: data.clients.name,
        email: data.clients.email,
        phone: data.clients.phone,
        company: data.clients.company,
        userId: data.user_id,
      } : undefined,
    };
  }

  /**
   * Registrar que se envió un recordatorio
   */
  async recordReminderSent(params: {
    eventId: string;
    reminderType: string;
    recipientEmail: string;
    success: boolean;
    error?: string;
  }) {
    const { error } = await this.supabase
      .from('meeting_reminders')
      .insert({
        event_id: params.eventId,
        reminder_type: params.reminderType,
        recipient_email: params.recipientEmail,
        sent_at: new Date().toISOString(),
        success: params.success,
        error_message: params.error,
      });

    if (error) {
      console.error('Error registrando recordatorio enviado:', error);
    }
  }

  /**
   * Verificar si ya se envió un recordatorio para un evento y tipo específico
   */
  async wasReminderSent(eventId: string, reminderType: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('meeting_reminders')
      .select('id')
      .eq('event_id', eventId)
      .eq('reminder_type', reminderType)
      .eq('success', true)
      .limit(1);

    if (error) {
      console.error('Error verificando recordatorio enviado:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Obtener estadísticas de recordatorios
   */
  async getReminderStats(date?: Date) {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await this.supabase
      .from('meeting_reminders')
      .select('success')
      .gte('sent_at', startOfDay.toISOString())
      .lte('sent_at', endOfDay.toISOString());

    if (error) {
      console.error('Error obteniendo estadísticas de recordatorios:', error);
      return { sent: 0, errors: 0 };
    }

    const sent = data?.filter(r => r.success).length || 0;
    const errors = data?.filter(r => !r.success).length || 0;

    return { sent, errors };
  }
}
