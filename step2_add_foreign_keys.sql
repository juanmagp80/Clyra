-- PASO 2: AGREGAR FOREIGN KEYS AL SISTEMA DE TIME TRACKING
-- Ejecutar después de step1_add_columns_only.sql

-- Agregar foreign key para projects (ya sabemos que su PK es 'id')
ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Agregar foreign key para auth.users
ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Para tasks sabemos que su primary key es 'id'
ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_task_id 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- Habilitar RLS para time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Crear política RLS para time_entries
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
CREATE POLICY "Users can manage their own time entries" ON time_entries
    FOR ALL USING (auth.uid() = user_id);

-- Agregar comentarios a la tabla time_entries
COMMENT ON TABLE time_entries IS 'Registro detallado de sesiones de tiempo trabajado en tareas';
COMMENT ON COLUMN time_entries.task_id IS 'ID de la tarea asociada';
COMMENT ON COLUMN time_entries.project_id IS 'ID del proyecto asociado';
COMMENT ON COLUMN time_entries.user_id IS 'ID del usuario que trabajó';
COMMENT ON COLUMN time_entries.start_time IS 'Momento de inicio de la sesión';
COMMENT ON COLUMN time_entries.end_time IS 'Momento de fin de la sesión (NULL si está en curso)';
COMMENT ON COLUMN time_entries.duration_seconds IS 'Duración de la sesión en segundos';
COMMENT ON COLUMN time_entries.description IS 'Descripción opcional de lo trabajado en esta sesión';

-- Verificación final
SELECT 'TIME TRACKING MIGRATION COMPLETADA' as status;

-- Mostrar las foreign keys creadas
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'time_entries' 
AND tc.constraint_type = 'FOREIGN KEY';
