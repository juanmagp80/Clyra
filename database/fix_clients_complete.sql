    -- SCRIPT PARA CORREGIR COMPLETAMENTE LA TABLA CLIENTS
    -- Ejecutar este script en Supabase SQL Editor

    -- 1. Verificar la estructura actual de la tabla clients
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'clients' 
    ORDER BY ordinal_position;

    -- 2. Agregar la columna user_id si no existe
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clients' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            CREATE INDEX idx_clients_user_id ON clients(user_id);
            
            -- Si hay clientes existentes, asignarles el primer usuario disponible
            UPDATE clients 
            SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) 
            WHERE user_id IS NULL;
            
            -- Hacer la columna NOT NULL después de asignar valores
            ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
            
            RAISE NOTICE 'Columna user_id agregada y configurada correctamente';
        ELSE
            RAISE NOTICE 'Columna user_id ya existe';
        END IF;
    END $$;

    -- 2.1. Agregar la columna updated_at si no existe
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clients' AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE clients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
            
            -- Actualizar registros existentes con la fecha actual
            UPDATE clients SET updated_at = NOW() WHERE updated_at IS NULL;
            
            RAISE NOTICE 'Columna updated_at agregada y configurada correctamente';
        ELSE
            RAISE NOTICE 'Columna updated_at ya existe';
        END IF;
    END $$;

    -- 2.2. Crear función y trigger para updated_at automático
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
    CREATE TRIGGER update_clients_updated_at
        BEFORE UPDATE ON clients
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- 3. Deshabilitar RLS temporalmente para limpiar políticas
    ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

    -- 4. Eliminar todas las políticas existentes
    DROP POLICY IF EXISTS "Users can view own clients" ON clients;
    DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
    DROP POLICY IF EXISTS "Users can update own clients" ON clients;
    DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
    DROP POLICY IF EXISTS "Authenticated users can manage their clients" ON clients;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON clients;
    DROP POLICY IF EXISTS "Enable read access for all users" ON clients;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON clients;

    -- 5. Habilitar RLS nuevamente
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

    -- 6. Crear políticas nuevas y simples
    CREATE POLICY "Users can view own clients" ON clients
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own clients" ON clients
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own clients" ON clients
        FOR UPDATE USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own clients" ON clients
        FOR DELETE USING (auth.uid() = user_id);

    -- 7. Verificar que las políticas se crearon correctamente
    SELECT 
        policyname,
        cmd,
        permissive,
        roles,
        qual,
        with_check
    FROM pg_policies 
    WHERE tablename = 'clients'
    ORDER BY policyname;

    -- 8. Crear función para insertar cliente con user_id automático
    CREATE OR REPLACE FUNCTION insert_client_with_user_id(
        p_name VARCHAR(255),
        p_email VARCHAR(255) DEFAULT NULL,
        p_phone VARCHAR(50) DEFAULT NULL,
        p_company VARCHAR(255) DEFAULT NULL,
        p_address TEXT DEFAULT NULL,
        p_tag VARCHAR(100) DEFAULT NULL
    )
    RETURNS UUID AS $$
    DECLARE
        new_client_id UUID;
        current_user_id UUID;
    BEGIN
        -- Obtener el ID del usuario actual
        current_user_id := auth.uid();
        
        IF current_user_id IS NULL THEN
            RAISE EXCEPTION 'Usuario no autenticado';
        END IF;
        
        -- Insertar el cliente con el user_id del usuario actual
        INSERT INTO clients (user_id, name, email, phone, company, address, tag)
        VALUES (current_user_id, p_name, p_email, p_phone, p_company, p_address, p_tag)
        RETURNING id INTO new_client_id;
        
        RETURN new_client_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 9. Dar permisos para ejecutar la función
    GRANT EXECUTE ON FUNCTION insert_client_with_user_id TO authenticated;

    -- 10. Mostrar la estructura final de la tabla
    SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns 
    WHERE table_name = 'clients' 
    ORDER BY ordinal_position;

    SELECT 'Tabla clients configurada correctamente! ✅' as resultado;
    SELECT 'Ya puedes crear clientes sin problemas de permisos' as info;
