-- VERIFICAR QUÉ DATOS EXACTOS TENEMOS EN LA BD
-- Ejecutar esto para ver el problema

-- Ver todas las tareas con sus datos de tiempo
SELECT 
    'TASKS_CURRENT_DATA' as info,
    id,
    title,
    is_running,
    total_time_seconds,
    started_at,
    last_start,
    last_stop,
    created_at
FROM tasks 
ORDER BY created_at DESC;

-- Ver todas las entradas de tiempo
SELECT 
    'TIME_ENTRIES_DATA' as info,
    te.*,
    t.title as task_title
FROM time_entries te
LEFT JOIN tasks t ON te.task_id = t.id
ORDER BY te.created_at DESC;

-- Ver si hay algún trigger o función que esté interfiriendo
SELECT 
    'TRIGGERS_ON_TASKS' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'tasks';

-- Ver los valores por defecto de las columnas de tasks
SELECT 
    'TASKS_COLUMNS_DEFAULTS' as info,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('total_time_seconds', 'is_running', 'last_start', 'started_at')
ORDER BY ordinal_position;
