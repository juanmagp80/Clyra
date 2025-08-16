CREATE TABLE IF NOT EXISTS meeting_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1_hour', '3_hours', '24_hours')),
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_event_id ON meeting_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_reminder_type ON meeting_reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_sent_at ON meeting_reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_success ON meeting_reminders(success);

-- Agregar columna google_event_id a calendar_events si no existe
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS google_event_id TEXT UNIQUE;

-- Índice para google_event_id
CREATE INDEX IF NOT EXISTS idx_calendar_events_google_event_id ON calendar_events(google_event_id);

-- Comentarios para documentación
COMMENT ON TABLE meeting_reminders IS 'Registro de recordatorios de reunión enviados';
COMMENT ON COLUMN meeting_reminders.reminder_type IS 'Tipo de recordatorio: 1_hour, 3_hours, 24_hours';
COMMENT ON COLUMN meeting_reminders.success IS 'Indica si el recordatorio se envió exitosamente';
COMMENT ON COLUMN calendar_events.google_event_id IS 'ID del evento en Google Calendar para sincronización';
