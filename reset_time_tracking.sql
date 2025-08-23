-- SCRIPT PARA RESETEAR TODOS LOS DATOS DE TIME TRACKING
-- Ejecutar esto si quieres empezar con tiempo limpio

-- Paso 1: Resetear todas las tareas (quitar tiempos y estados de running)
UPDATE tasks 
SET 
    is_running = FALSE,
    total_time_seconds = 0,
    started_at = NULL,
    last_start = NULL,
    last_stop = NULL
WHERE total_time_seconds IS NOT NULL OR is_running = TRUE;

-- Paso 2: Eliminar todas las entradas de tiempo
DELETE FROM time_entries;

-- Paso 3: Verificar que todo se reseteo
SELECT 
    'tasks_after_reset' as table_name,
    id,
    title,
    is_running,
    total_time_seconds,
    last_start
FROM tasks 
WHERE project_id = (SELECT id FROM projects LIMIT 1)
ORDER BY created_at;

SELECT 'time_entries_count_after_reset' as info, COUNT(*) as count FROM time_entries;

SELECT 'RESET COMPLETADO - Todos los cronómetros están en 0' as status;
