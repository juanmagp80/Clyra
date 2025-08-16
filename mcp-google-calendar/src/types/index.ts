export interface CalendarEvent {
  id: string;
  googleEventId?: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  clientId?: string;
  type: 'meeting' | 'appointment' | 'call' | 'other';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  userId: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

export interface MeetingReminder {
  eventId: string;
  reminderType: '1_hour' | '3_hours' | '24_hours';
  sentAt: string;
  recipientEmail: string;
  success: boolean;
  error?: string;
}

export interface AutomationStatus {
  isRunning: boolean;
  lastRun?: string;
  remindersToday: number;
  errors: number;
}
