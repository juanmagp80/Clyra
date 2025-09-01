-- SQL para RESTRINGIR el acceso a tareas - solo el propietario puede ver sus propias tareas
-- IMPORTANTE: Las tareas deben ser PRIVADAS, no públicas como las automatizaciones

-- 1. Eliminar políticas existentes que pueden estar permitiendo acceso público
DROP POLICY IF EXISTS "Public read access to tasks" ON tasks;
DROP POLICY IF EXISTS "All users can read all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only access their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- 2. Política RESTRICTIVA: Solo el propietario puede ver sus tareas
CREATE POLICY "Users can only see their own tasks"
    ON tasks
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Política para crear tareas (solo para usuarios autenticados)
CREATE POLICY "Authenticated users can create tasks"
    ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 4. Política para actualizar (solo el propietario)
CREATE POLICY "Users can update their own tasks"
    ON tasks
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Política para eliminar (solo el propietario)
CREATE POLICY "Users can delete their own tasks"
    ON tasks
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Verificar que RLS esté habilitado
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
