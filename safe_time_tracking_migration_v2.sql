-- MIGRACIÓN SEGURA DE TIME TRACKING - VERSIÓN CORREGIDA
-- Esta versión verifica la estructura real de las tablas antes de crear foreign keys

-- PASO 1: Agregar columnas de tiempo a la tabla tasks (sin referencias)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_running BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_start TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_stop TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS phase_order INTEGER DEFAULT NULL;

-- Agregar comentarios para documentar las columnas
COMMENT ON COLUMN tasks.is_running IS 'Indica si la tarea está actualmente en ejecución (cronómetro activo)';
COMMENT ON COLUMN tasks.total_time_seconds IS 'Tiempo total trabajado en la tarea en segundos';
COMMENT ON COLUMN tasks.started_at IS 'Timestamp de cuando se inició la tarea por primera vez';
COMMENT ON COLUMN tasks.last_start IS 'Timestamp de la última vez que se inició el cronómetro';
COMMENT ON COLUMN tasks.last_stop IS 'Timestamp de la última vez que se detuvo el cronómetro';
COMMENT ON COLUMN tasks.phase_order IS 'Orden de la fase a la que pertenece la tarea (1, 2, 3, etc)';

-- PASO 2: Agregar columna template_data a projects si no existe
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT NULL;

COMMENT ON COLUMN projects.template_data IS 'Datos del template usado para crear el proyecto (fases, entregables, pricing)';

-- PASO 3: Crear tabla time_entries SIN foreign keys primero
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration_seconds INTEGER DEFAULT 0,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PASO 4: Verificar qué columnas existen en cada tabla antes de crear foreign keys
DO $$
DECLARE
    tasks_pk_column TEXT;
    projects_pk_column TEXT;
BEGIN
    -- Encontrar la columna primary key de tasks
    SELECT column_name INTO tasks_pk_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'tasks' 
        AND tc.constraint_type = 'PRIMARY KEY'
    LIMIT 1;
    
    -- Encontrar la columna primary key de projects
    SELECT column_name INTO projects_pk_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'projects' 
        AND tc.constraint_type = 'PRIMARY KEY'
    LIMIT 1;
    
    -- Mostrar información de debugging
    RAISE NOTICE 'Tasks PK column: %', COALESCE(tasks_pk_column, 'NOT FOUND');
    RAISE NOTICE 'Projects PK column: %', COALESCE(projects_pk_column, 'NOT FOUND');
    
    -- Crear foreign key para tasks solo si encontramos la PK
    IF tasks_pk_column IS NOT NULL THEN
        BEGIN
            EXECUTE format('ALTER TABLE time_entries 
                ADD CONSTRAINT fk_time_entries_task_id 
                FOREIGN KEY (task_id) REFERENCES tasks(%I) ON DELETE CASCADE', tasks_pk_column);
            RAISE NOTICE 'Foreign key para tasks creada exitosamente';
        EXCEPTION 
            WHEN duplicate_object THEN
                RAISE NOTICE 'Foreign key para tasks ya existe';
            WHEN OTHERS THEN
                RAISE NOTICE 'Error creando foreign key para tasks: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No se pudo crear foreign key para tasks - no se encontró primary key';
    END IF;
    
    -- Crear foreign key para projects solo si encontramos la PK
    IF projects_pk_column IS NOT NULL THEN
        BEGIN
            EXECUTE format('ALTER TABLE time_entries 
                ADD CONSTRAINT fk_time_entries_project_id 
                FOREIGN KEY (project_id) REFERENCES projects(%I) ON DELETE CASCADE', projects_pk_column);
            RAISE NOTICE 'Foreign key para projects creada exitosamente';
        EXCEPTION 
            WHEN duplicate_object THEN
                RAISE NOTICE 'Foreign key para projects ya existe';
            WHEN OTHERS THEN
                RAISE NOTICE 'Error creando foreign key para projects: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No se pudo crear foreign key para projects - no se encontró primary key';
    END IF;
    
    -- Crear foreign key para auth.users (esta debería ser estándar)
    BEGIN
        ALTER TABLE time_entries 
        ADD CONSTRAINT fk_time_entries_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key para auth.users creada exitosamente';
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'Foreign key para auth.users ya existe';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error creando foreign key para auth.users: %', SQLERRM;
    END;
    
END $$;

-- PASO 5: Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- PASO 6: Habilitar RLS para time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- PASO 7: Crear política RLS para time_entries
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
CREATE POLICY "Users can manage their own time entries" ON time_entries
    FOR ALL USING (auth.uid() = user_id);

-- PASO 8: Agregar comentarios a la tabla time_entries
COMMENT ON TABLE time_entries IS 'Registro detallado de sesiones de tiempo trabajado en tareas';
COMMENT ON COLUMN time_entries.task_id IS 'ID de la tarea asociada';
COMMENT ON COLUMN time_entries.project_id IS 'ID del proyecto asociado';
COMMENT ON COLUMN time_entries.user_id IS 'ID del usuario que trabajó';
COMMENT ON COLUMN time_entries.start_time IS 'Momento de inicio de la sesión';
COMMENT ON COLUMN time_entries.end_time IS 'Momento de fin de la sesión (NULL si está en curso)';
COMMENT ON COLUMN time_entries.duration_seconds IS 'Duración de la sesión en segundos';
COMMENT ON COLUMN time_entries.description IS 'Descripción opcional de lo trabajado en esta sesión';

-- PASO 9: Mostrar resultado final
SELECT 'MIGRACIÓN COMPLETADA - Verificar estructura:' as status;

-- Mostrar las nuevas columnas en tasks
SELECT 
    'tasks' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('is_running', 'total_time_seconds', 'started_at', 'last_start', 'last_stop', 'phase_order')

UNION ALL

-- Mostrar template_data en projects
SELECT 
    'projects' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name = 'template_data'

UNION ALL

-- Mostrar todas las columnas de time_entries
SELECT 
    'time_entries' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'time_entries'
ORDER BY table_name, column_name;
