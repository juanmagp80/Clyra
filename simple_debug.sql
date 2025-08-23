-- Ver datos actuales de las tareas
SELECT 
    id,
    title,
    is_running,
    total_time_seconds,
    last_start,
    created_at
FROM tasks 
ORDER BY created_at DESC
LIMIT 10;
