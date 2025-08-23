-- MIGRACIÓN SIMPLIFICADA - Solo agregar columnas primero
-- Ejecutar esto PASO A PASO

-- PASO 1: Agregar columnas de tiempo a la tabla tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_running BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_start TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_stop TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS phase_order INTEGER DEFAULT NULL;

-- PASO 2: Agregar columna template_data a projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT NULL;

-- PASO 3: Crear tabla time_entries SIN foreign keys
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

-- PASO 4: Ver qué columnas tiene cada tabla
SELECT 'VERIFICACIÓN DE ESTRUCTURA DE TABLAS:' as info;

-- Ver todas las columnas de tasks
SELECT 
    'tasks' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Ver todas las columnas de projects  
SELECT 
    'projects' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Ver las constraints de tasks
SELECT 
    'tasks_constraints' as tabla,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'tasks';

-- Ver las constraints de projects
SELECT 
    'projects_constraints' as tabla,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'projects';
