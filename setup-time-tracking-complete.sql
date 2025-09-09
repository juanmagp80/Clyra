-- 1. VERIFICAR SI EXISTE LA TABLA time_tracking_sessions
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'time_tracking_sessions'
);

-- 2. VERIFICAR LA ESTRUCTURA ACTUAL DE time_tracking_sessions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'time_tracking_sessions' 
ORDER BY ordinal_position;

-- 3. SI LA TABLA NO EXISTE, CREARLA CON ESTRUCTURA BÁSICA
CREATE TABLE IF NOT EXISTS time_tracking_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    billable_minutes INTEGER DEFAULT 0,
    productivity_score DECIMAL(3,1) DEFAULT 0.0,
    break_duration_minutes INTEGER DEFAULT 0,
    energy_level_before INTEGER DEFAULT 5,
    energy_level_after INTEGER DEFAULT 5,
    task_type TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT productivity_score_check CHECK (productivity_score >= 0 AND productivity_score <= 10),
    CONSTRAINT energy_before_check CHECK (energy_level_before >= 1 AND energy_level_before <= 10),
    CONSTRAINT energy_after_check CHECK (energy_level_after >= 1 AND energy_level_after <= 10),
    CONSTRAINT duration_positive_check CHECK (duration_minutes >= 0),
    CONSTRAINT billable_duration_check CHECK (billable_minutes >= 0 AND billable_minutes <= duration_minutes)
);

-- 4. CONFIGURAR RLS
ALTER TABLE time_tracking_sessions ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS RLS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'time_tracking_sessions' 
        AND policyname = 'Users can view their own tracking sessions'
    ) THEN
        CREATE POLICY "Users can view their own tracking sessions" 
        ON time_tracking_sessions FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'time_tracking_sessions' 
        AND policyname = 'Users can insert their own tracking sessions'
    ) THEN
        CREATE POLICY "Users can insert their own tracking sessions" 
        ON time_tracking_sessions FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'time_tracking_sessions' 
        AND policyname = 'Users can update their own tracking sessions'
    ) THEN
        CREATE POLICY "Users can update their own tracking sessions" 
        ON time_tracking_sessions FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id ON time_tracking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_start_time ON time_tracking_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_type ON time_tracking_sessions(task_type);

-- 7. INSERTAR DATOS DE PRUEBA PARA LOS ÚLTIMOS 30 DÍAS
-- IMPORTANTE: Cambiar 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' por tu user_id real

INSERT INTO time_tracking_sessions (
    user_id,
    start_time,
    end_time,
    duration_minutes,
    billable_minutes,
    productivity_score,
    break_duration_minutes,
    energy_level_before,
    energy_level_after,
    task_type,
    created_at
) VALUES 
-- Semana 1
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-02 09:00:00+00', '2025-09-02 12:00:00+00', 180, 165, 8.5, 15, 7, 8, 'desarrollo', '2025-09-02 12:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-02 14:00:00+00', '2025-09-02 17:30:00+00', 210, 190, 7.8, 20, 6, 7, 'reuniones', '2025-09-02 17:30:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-03 09:30:00+00', '2025-09-03 11:45:00+00', 135, 120, 9.2, 15, 8, 9, 'desarrollo', '2025-09-03 11:45:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-03 13:00:00+00', '2025-09-03 16:00:00+00', 180, 170, 8.0, 10, 7, 8, 'client_work', '2025-09-03 16:00:00+00'),

-- Semana 2  
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-05 08:45:00+00', '2025-09-05 12:15:00+00', 210, 195, 8.7, 15, 8, 9, 'desarrollo', '2025-09-05 12:15:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-05 14:30:00+00', '2025-09-05 17:00:00+00', 150, 135, 7.5, 15, 6, 7, 'admin', '2025-09-05 17:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-06 09:00:00+00', '2025-09-06 13:00:00+00', 240, 220, 9.0, 20, 8, 9, 'client_work', '2025-09-06 13:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-06 15:00:00+00', '2025-09-06 18:30:00+00', 210, 180, 6.8, 30, 5, 6, 'reuniones', '2025-09-06 18:30:00+00'),

-- Semana 3
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-09 09:15:00+00', '2025-09-09 12:45:00+00', 210, 195, 8.9, 15, 8, 9, 'desarrollo', '2025-09-09 12:45:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-09 14:00:00+00', '2025-09-09 16:30:00+00', 150, 140, 8.2, 10, 7, 8, 'client_work', '2025-09-09 16:30:00+00'),

-- Días con menor productividad
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-04 10:00:00+00', '2025-09-04 12:00:00+00', 120, 90, 5.5, 30, 4, 5, 'admin', '2025-09-04 12:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-04 15:00:00+00', '2025-09-04 17:00:00+00', 120, 80, 4.8, 40, 3, 4, 'reuniones', '2025-09-04 17:00:00+00'),

-- Sesiones de alta productividad
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-07 08:00:00+00', '2025-09-07 12:00:00+00', 240, 235, 9.5, 5, 9, 10, 'desarrollo', '2025-09-07 12:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-08 09:00:00+00', '2025-09-08 13:30:00+00', 270, 260, 9.8, 10, 9, 10, 'client_work', '2025-09-08 13:30:00+00')

ON CONFLICT (id) DO NOTHING;

-- 8. VERIFICAR QUE LOS DATOS SE INSERTARON CORRECTAMENTE
SELECT 
    COUNT(*) as total_sessions,
    ROUND(AVG(productivity_score), 2) as avg_productivity,
    SUM(duration_minutes) as total_minutes,
    SUM(billable_minutes) as total_billable_minutes,
    ROUND(AVG(billable_minutes::float / NULLIF(duration_minutes, 0) * 100), 2) as avg_billable_percentage
FROM time_tracking_sessions 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
AND start_time >= NOW() - INTERVAL '30 days';

-- 9. VER BREAKDOWN POR TIPO DE TAREA
SELECT 
    task_type,
    COUNT(*) as sessions,
    ROUND(AVG(productivity_score), 2) as avg_productivity,
    SUM(billable_minutes) as total_billable
FROM time_tracking_sessions 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
AND start_time >= NOW() - INTERVAL '30 days'
GROUP BY task_type
ORDER BY avg_productivity DESC;
