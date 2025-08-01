-- SQL para configurar la tabla tasks y RLS (ejecutar en Supabase SQL Editor)

-- Crear la tabla tasks si no existe
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    assigned_to TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Habilitar RLS en la tabla tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Users can view tasks from their own projects" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks in their own projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks from their own projects" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks from their own projects" ON tasks;

-- Política para que los usuarios solo vean tareas de sus propios proyectos
CREATE POLICY "Users can view tasks from their own projects" ON tasks
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios puedan insertar tareas en sus propios proyectos
CREATE POLICY "Users can insert tasks in their own projects" ON tasks
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios puedan actualizar tareas de sus propios proyectos
CREATE POLICY "Users can update tasks from their own projects" ON tasks
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios puedan eliminar tareas de sus propios proyectos
CREATE POLICY "Users can delete tasks from their own projects" ON tasks
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
