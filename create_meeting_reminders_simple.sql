-- Script simplificado para crear la tabla meeting_reminders
-- Ejecutar en Supabase SQL Editor

-- Primero, intentar eliminar la tabla si existe para empezar limpio
DROP TABLE IF EXISTS meeting_reminders CASCADE;

-- Crear la tabla desde cero
CREATE TABLE meeting_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1_hour', '3_hours', '24_hours')),
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    email_response JSONB DEFAULT '{}'::jsonb
);

-- Crear índices
CREATE INDEX idx_meeting_reminders_event_id ON meeting_reminders(event_id);
CREATE INDEX idx_meeting_reminders_user_id ON meeting_reminders(user_id);
CREATE INDEX idx_meeting_reminders_sent_at ON meeting_reminders(sent_at);
CREATE INDEX idx_meeting_reminders_success ON meeting_reminders(success);

-- Habilitar RLS
ALTER TABLE meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Usuarios pueden ver solo sus recordatorios" ON meeting_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus recordatorios" ON meeting_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus recordatorios" ON meeting_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus recordatorios" ON meeting_reminders FOR DELETE USING (auth.uid() = user_id);

-- Verificar la estructura
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'meeting_reminders' 
ORDER BY ordinal_position;
