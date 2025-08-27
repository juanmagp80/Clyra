-- Script para actualizar la tabla meeting_reminders y agregar el campo success
-- Ejecutar en Supabase SQL Editor

-- Crear la tabla completa si no existe
CREATE TABLE IF NOT EXISTS meeting_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1_hour', '3_hours', '24_hours')),
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    email_response JSONB DEFAULT '{}'::jsonb
);

-- Agregar el campo success si no existe (para tablas existentes)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meeting_reminders' AND column_name = 'success'
    ) THEN
        ALTER TABLE meeting_reminders ADD COLUMN success BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Actualizar registros existentes si es necesario
UPDATE meeting_reminders 
SET success = CASE 
    WHEN status = 'sent' THEN true 
    WHEN status = 'failed' THEN false 
    ELSE true 
END
WHERE success IS NULL;

-- Habilitar RLS
ALTER TABLE meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Usuarios pueden ver solo sus recordatorios" ON meeting_reminders;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus recordatorios" ON meeting_reminders;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus recordatorios" ON meeting_reminders;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus recordatorios" ON meeting_reminders;

-- Crear políticas RLS
CREATE POLICY "Usuarios pueden ver solo sus recordatorios" ON meeting_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus recordatorios" ON meeting_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus recordatorios" ON meeting_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus recordatorios" ON meeting_reminders FOR DELETE USING (auth.uid() = user_id);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_event_id ON meeting_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_sent_at ON meeting_reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_success ON meeting_reminders(success);

-- Verificar que la tabla tiene la estructura correcta
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'meeting_reminders' 
ORDER BY ordinal_position;
