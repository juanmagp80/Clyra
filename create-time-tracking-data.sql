-- DATOS DE PRUEBA PARA TIME_TRACKING_SESSIONS
-- Nota: Reemplaza 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' con tu user_id real si es diferente

-- 1. VERIFICAR LA ESTRUCTURA DE time_tracking_sessions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'time_tracking_sessions' 
ORDER BY ordinal_position;

-- 2. INSERTAR DATOS DE PRUEBA PARA LOS ÚLTIMOS 30 DÍAS
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
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-08 09:00:00+00', '2025-09-08 13:30:00+00', 270, 260, 9.8, 10, 9, 10, 'client_work', '2025-09-08 13:30:00+00');

-- 3. VERIFICAR QUE LOS DATOS SE INSERTARON CORRECTAMENTE
SELECT 
    COUNT(*) as total_sessions,
    AVG(productivity_score) as avg_productivity,
    SUM(duration_minutes) as total_minutes,
    SUM(billable_minutes) as total_billable_minutes,
    ROUND(AVG(billable_minutes::float / duration_minutes * 100), 2) as avg_billable_percentage
FROM time_tracking_sessions 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
AND start_time >= NOW() - INTERVAL '30 days';

-- 4. VER BREAKDOWN POR TIPO DE TAREA
SELECT 
    task_type,
    COUNT(*) as sessions,
    AVG(productivity_score) as avg_productivity,
    SUM(billable_minutes) as total_billable
FROM time_tracking_sessions 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
AND start_time >= NOW() - INTERVAL '30 days'
GROUP BY task_type
ORDER BY avg_productivity DESC;
