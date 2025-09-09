-- SCRIPT PARA VERIFICAR ESTRUCTURA REAL DE time_tracking_sessions
-- Y CREAR DATOS DE PRUEBA COMPATIBLES

-- 1. VERIFICAR SI EXISTE LA TABLA
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'time_tracking_sessions'
);

-- 2. VERIFICAR LA ESTRUCTURA REAL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'time_tracking_sessions' 
ORDER BY ordinal_position;

-- 3. INSERTAR DATOS DE PRUEBA COMPLETOS (USANDO ESTRUCTURA REAL)
-- IMPORTANTE: Cambiar el user_id por tu user_id real

INSERT INTO time_tracking_sessions (
    user_id,
    start_time,
    end_time,
    duration_minutes,
    billable_minutes,
    break_minutes,
    notes,
    mood_before,
    mood_after,
    energy_before,
    energy_after,
    focus_quality,
    interruptions,
    productivity_score,
    tasks_completed,
    hourly_rate,
    total_earned,
    billable_rate,
    environment_type,
    time_of_day,
    day_of_week,
    is_optimal_time,
    auto_tracked,
    created_at
) VALUES 
-- Semana 1 - Días productivos
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-02 09:00:00+00', '2025-09-02 12:00:00+00', 180, 165, 15, 'Sesión de desarrollo muy productiva', 4, 5, 4, 5, 5, 1, 8, 3, 50.00, 137.50, 50.00, 'home_office', 'morning', 1, true, false, '2025-09-02 12:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-02 14:00:00+00', '2025-09-02 17:30:00+00', 210, 190, 20, 'Reuniones y trabajo con cliente', 3, 4, 3, 4, 4, 2, 7, 2, 45.00, 142.50, 45.00, 'client_office', 'afternoon', 1, false, false, '2025-09-02 17:30:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-03 09:30:00+00', '2025-09-03 11:45:00+00', 135, 120, 15, 'Coding session - alta concentración', 5, 5, 5, 5, 5, 0, 9, 4, 55.00, 110.00, 55.00, 'home_office', 'morning', 2, true, false, '2025-09-03 11:45:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-03 13:00:00+00', '2025-09-03 16:00:00+00', 180, 170, 10, 'Trabajo proyecto cliente importante', 4, 4, 4, 4, 4, 1, 8, 3, 50.00, 141.67, 50.00, 'coworking', 'afternoon', 2, false, false, '2025-09-03 16:00:00+00'),

-- Semana 2 - Variedad de productividad
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-05 08:45:00+00', '2025-09-05 12:15:00+00', 210, 195, 15, 'Sesión matutina muy efectiva', 4, 5, 5, 5, 5, 1, 9, 5, 52.00, 169.00, 52.00, 'home_office', 'morning', 4, true, false, '2025-09-05 12:15:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-05 14:30:00+00', '2025-09-05 17:00:00+00', 150, 135, 15, 'Tareas administrativas', 3, 3, 3, 4, 3, 3, 7, 2, 40.00, 90.00, 40.00, 'home_office', 'afternoon', 4, false, false, '2025-09-05 17:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-06 09:00:00+00', '2025-09-06 13:00:00+00', 240, 220, 20, 'Sprint de desarrollo largo', 4, 5, 4, 5, 4, 2, 9, 6, 55.00, 201.67, 55.00, 'home_office', 'morning', 5, true, false, '2025-09-06 13:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-06 15:00:00+00', '2025-09-06 18:30:00+00', 210, 180, 30, 'Reuniones múltiples - cansancio', 2, 3, 2, 3, 3, 5, 6, 1, 45.00, 135.00, 45.00, 'client_office', 'afternoon', 5, false, false, '2025-09-06 18:30:00+00'),

-- Días con menor productividad
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-04 10:00:00+00', '2025-09-04 12:00:00+00', 120, 90, 30, 'Día con muchas distracciones', 2, 2, 2, 3, 2, 6, 5, 1, 40.00, 60.00, 40.00, 'home_office', 'morning', 3, false, false, '2025-09-04 12:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-04 15:00:00+00', '2025-09-04 17:00:00+00', 120, 80, 40, 'Reuniones poco productivas', 2, 2, 2, 2, 2, 4, 4, 0, 35.00, 46.67, 35.00, 'client_office', 'afternoon', 3, false, false, '2025-09-04 17:00:00+00'),

-- Semana 3 - Trabajo actual
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-09 09:15:00+00', '2025-09-09 12:45:00+00', 210, 195, 15, 'Lunes productivo - nuevos proyectos', 4, 5, 4, 5, 5, 1, 9, 4, 50.00, 162.50, 50.00, 'home_office', 'morning', 1, true, false, '2025-09-09 12:45:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-09 14:00:00+00', '2025-09-09 16:30:00+00', 150, 140, 10, 'Continuación trabajo importante', 4, 4, 4, 4, 4, 1, 8, 3, 50.00, 116.67, 50.00, 'home_office', 'afternoon', 1, false, false, '2025-09-09 16:30:00+00'),

-- Sesiones de alta productividad
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-07 08:00:00+00', '2025-09-07 12:00:00+00', 240, 235, 5, 'Flow state perfecto - desarrollo complejo', 5, 5, 5, 5, 5, 0, 10, 8, 60.00, 235.00, 60.00, 'home_office', 'morning', 6, true, false, '2025-09-07 12:00:00+00'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', '2025-09-08 09:00:00+00', '2025-09-08 13:30:00+00', 270, 260, 10, 'Sesión épica de coding', 5, 5, 5, 5, 5, 0, 10, 10, 58.00, 251.11, 58.00, 'home_office', 'morning', 0, true, false, '2025-09-08 13:30:00+00')

ON CONFLICT (id) DO NOTHING;

-- 4. VERIFICAR QUE LOS DATOS SE INSERTARON CORRECTAMENTE
SELECT 
    COUNT(*) as total_sessions,
    ROUND(AVG(productivity_score::numeric), 2) as avg_productivity,
    SUM(duration_minutes) as total_minutes,
    SUM(billable_minutes) as total_billable_minutes,
    ROUND((AVG(billable_minutes::numeric / NULLIF(duration_minutes, 0)) * 100), 2) as avg_billable_percentage
FROM time_tracking_sessions 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
AND start_time >= NOW() - INTERVAL '30 days';

-- 5. RESUMEN DE ESTADÍSTICAS POR DÍA
SELECT 
    DATE(start_time) as work_date,
    COUNT(*) as sessions,
    SUM(duration_minutes) as total_minutes,
    ROUND(AVG(productivity_score::numeric), 2) as avg_productivity,
    SUM(billable_minutes) as billable_minutes
FROM time_tracking_sessions 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
AND start_time >= NOW() - INTERVAL '30 days'
GROUP BY DATE(start_time)
ORDER BY work_date DESC;
