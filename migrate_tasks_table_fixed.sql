-- Migración para agregar user_id a tasks y ajustar RLS (CORREGIDA)

-- Paso 1: Agregar columna user_id a tasks (permitir NULL temporalmente)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID;

-- Paso 2: Actualizar tareas existentes asignando user_id basado en el proyecto
-- Esto asume que todas las tareas pertenecen al usuario que creó el proyecto
UPDATE tasks 
SET user_id = (
    SELECT projects.user_id 
    FROM projects 
    WHERE projects.id = tasks.project_id
) 
WHERE user_id IS NULL AND project_id IS NOT NULL;

-- Paso 3: Para tareas sin project_id, asignar al primer usuario disponible
-- (esto es un fallback para datos inconsistentes)
UPDATE tasks 
SET user_id = (
    SELECT id FROM auth.users LIMIT 1
)
WHERE user_id IS NULL;

-- Paso 4: Ahora que todos los registros tienen user_id, hacer la columna obligatoria
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

-- Paso 5: Agregar constraint de foreign key
ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Paso 6: Crear índice para user_id
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Paso 7: Actualizar constraints de status para incluir más estados
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('pending', 'in_progress', 'paused', 'completed', 'archived'));

-- Paso 8: Agregar columna priority si no existe
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Paso 9: Renombrar name a title si existe la columna name
DO $$ 
BEGIN
    -- Verificar si existe la columna 'name' y no existe 'title'
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'title'
    ) THEN
        ALTER TABLE tasks RENAME COLUMN name TO title;
    END IF;
END $$;

-- Paso 10: Agregar campos adicionales si no existen
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Paso 11: Limpiar políticas RLS existentes
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks from their own projects" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks in their own projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks from their own projects" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks from their own projects" ON tasks;

-- Paso 12: Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Paso 13: Crear políticas RLS basadas en user_id directamente
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (user_id = auth.uid());
