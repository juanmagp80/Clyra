-- Esquema para Google Calendar Integration
-- Ejecutar en Supabase SQL Editor

-- Tabla para tokens de Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    google_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para eventos sincronizados
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    google_user_email TEXT REFERENCES google_calendar_tokens(email) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    attendees JSONB DEFAULT '[]'::jsonb,
    google_event_id TEXT UNIQUE,
    calendar_id TEXT DEFAULT 'primary',
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para recordatorios enviados
CREATE TABLE IF NOT EXISTS meeting_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1_hour', '3_hours', '24_hours')),
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    email_response JSONB DEFAULT '{}'::jsonb
);

-- Tabla para logs de automatización
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'warning')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_event_id ON meeting_reminders(event_id);

-- Políticas RLS (Row Level Security)
-- IMPORTANTE: Estas políticas aseguran que cada usuario solo pueda acceder a sus propios datos

-- Habilitar RLS
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para google_calendar_tokens
CREATE POLICY "Usuarios pueden ver solo sus tokens" ON google_calendar_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus tokens" ON google_calendar_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus tokens" ON google_calendar_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus tokens" ON google_calendar_tokens FOR DELETE USING (auth.uid() = user_id);

-- Políticas para calendar_events
CREATE POLICY "Usuarios pueden ver solo sus eventos" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus eventos" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus eventos" ON calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus eventos" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Políticas para meeting_reminders
CREATE POLICY "Usuarios pueden ver solo sus recordatorios" ON meeting_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus recordatorios" ON meeting_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus recordatorios" ON meeting_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus recordatorios" ON meeting_reminders FOR DELETE USING (auth.uid() = user_id);

-- Políticas para automation_logs (acceso público para logs del sistema)
CREATE POLICY "Logs de automatización son públicos" ON automation_logs FOR SELECT USING (true);
CREATE POLICY "Sistema puede insertar logs" ON automation_logs FOR INSERT WITH CHECK (true);
