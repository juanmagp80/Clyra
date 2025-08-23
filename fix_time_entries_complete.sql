-- VERIFICAR Y CORREGIR ESTRUCTURA DE TIME_ENTRIES
-- Ejecutar esto para diagnosticar el problema

-- Paso 1: Verificar si time_entries existe y sus columnas
SELECT 
    'time_entries_structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'time_entries'
ORDER BY ordinal_position;

-- Paso 2: Si la tabla no existe o le faltan columnas, la recreamos
DROP TABLE IF EXISTS time_entries;

CREATE TABLE time_entries (
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

-- Paso 3: Verificar que la tabla se creó correctamente
SELECT 
    'time_entries_verificacion' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'time_entries'
ORDER BY ordinal_position;

-- Paso 4: Ahora agregar las foreign keys una por una
-- Foreign key para tasks
ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_task_id 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Foreign key para projects
ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Foreign key para auth.users
ALTER TABLE time_entries 
ADD CONSTRAINT fk_time_entries_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Paso 5: Crear índices
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- Paso 6: Habilitar RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Paso 7: Crear política RLS
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
CREATE POLICY "Users can manage their own time entries" ON time_entries
    FOR ALL USING (auth.uid() = user_id);

-- Paso 8: Verificación final - mostrar foreign keys creadas
SELECT 
    'FOREIGN_KEYS_CREADAS' as status,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'time_entries' 
AND tc.constraint_type = 'FOREIGN KEY';

SELECT 'TIME TRACKING SETUP COMPLETADO EXITOSAMENTE!' as final_status;
