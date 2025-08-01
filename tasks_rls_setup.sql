-- SQL para configurar RLS en la tabla tasks

-- Habilitar RLS en la tabla tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

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

-- Insertar algunas tareas de ejemplo (reemplaza 'PROJECT_ID_AQUI' con un ID real de proyecto)
-- INSERT INTO tasks (project_id, name, description, status) VALUES
-- ('PROJECT_ID_AQUI', 'Diseño de la interfaz', 'Crear mockups y wireframes del proyecto', 'completed'),
-- ('PROJECT_ID_AQUI', 'Desarrollo del frontend', 'Implementar la interfaz usando React', 'in_progress'),
-- ('PROJECT_ID_AQUI', 'Configuración del backend', 'Configurar servidor y base de datos', 'in_progress'),
-- ('PROJECT_ID_AQUI', 'Testing y QA', 'Realizar pruebas de funcionalidad', 'pending'),
-- ('PROJECT_ID_AQUI', 'Deployment', 'Subir a producción', 'pending');
