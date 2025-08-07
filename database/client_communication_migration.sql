-- MIGRACIÓN PARA SISTEMA DE COMUNICACIÓN CON CLIENTES
-- Añadir a la migración existente o ejecutar por separado

-- ==================== TABLAS PARA COMUNICACIÓN ====================

-- Tabla de tokens únicos para clientes
CREATE TABLE IF NOT EXISTS client_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    token VARCHAR(32) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ, -- NULL = sin expiración
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes entre cliente y freelancer
CREATE TABLE IF NOT EXISTS client_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Opcional: asociar a proyecto
    message TEXT NOT NULL,
    sender_type VARCHAR(10) CHECK (sender_type IN ('client', 'freelancer')) NOT NULL,
    attachments JSONB DEFAULT '[]', -- Array de URLs de archivos
    is_read BOOLEAN DEFAULT false,
    parent_message_id UUID REFERENCES client_messages(id) ON DELETE SET NULL, -- Para threading
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para notificaciones del sistema
CREATE TABLE IF NOT EXISTS client_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    message_id UUID REFERENCES client_messages(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('new_message', 'project_update', 'payment_reminder')) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ÍNDICES PARA PERFORMANCE ====================

-- Índices para client_tokens
CREATE INDEX IF NOT EXISTS idx_client_tokens_client_id ON client_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tokens_token ON client_tokens(token);
CREATE INDEX IF NOT EXISTS idx_client_tokens_active ON client_tokens(is_active);

-- Índices para client_messages
CREATE INDEX IF NOT EXISTS idx_client_messages_client_id ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_project_id ON client_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_sender ON client_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_client_messages_read ON client_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_client_messages_created_at ON client_messages(created_at);

-- Índices para client_notifications
CREATE INDEX IF NOT EXISTS idx_client_notifications_client_id ON client_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_sent ON client_notifications(is_sent);

-- ==================== RLS (ROW LEVEL SECURITY) ====================

-- Habilitar RLS
ALTER TABLE client_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para client_tokens (solo el freelancer puede gestionarlos)
DROP POLICY IF EXISTS "Freelancer can manage client tokens" ON client_tokens;
CREATE POLICY "Freelancer can manage client tokens" ON client_tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = client_tokens.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- Políticas para client_messages
DROP POLICY IF EXISTS "Freelancer can manage all messages" ON client_messages;
CREATE POLICY "Freelancer can manage all messages" ON client_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = client_messages.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- Política especial para acceso de clientes via token (sin autenticación)
DROP POLICY IF EXISTS "Public access via valid token" ON client_messages;
CREATE POLICY "Public access via valid token" ON client_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM client_tokens 
            WHERE client_tokens.client_id = client_messages.client_id 
            AND client_tokens.is_active = true
            AND (client_tokens.expires_at IS NULL OR client_tokens.expires_at > NOW())
        )
    );

-- Política para insertar mensajes desde cliente (via función)
DROP POLICY IF EXISTS "Clients can insert messages via token" ON client_messages;
CREATE POLICY "Clients can insert messages via token" ON client_messages
    FOR INSERT WITH CHECK (
        sender_type = 'client'
        AND EXISTS (
            SELECT 1 FROM client_tokens 
            WHERE client_tokens.client_id = client_messages.client_id 
            AND client_tokens.is_active = true
            AND (client_tokens.expires_at IS NULL OR client_tokens.expires_at > NOW())
        )
    );

-- Políticas para client_notifications
DROP POLICY IF EXISTS "Freelancer can manage notifications" ON client_notifications;
CREATE POLICY "Freelancer can manage notifications" ON client_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = client_notifications.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- ==================== FUNCIONES ÚTILES ====================

-- Función para generar token único
CREATE OR REPLACE FUNCTION generate_client_token(client_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    token_value TEXT;
    token_exists BOOLEAN;
BEGIN
    LOOP
        -- Generar token de 32 caracteres alfanuméricos
        token_value := encode(gen_random_bytes(24), 'base64');
        token_value := translate(token_value, '+/=', 'ABC');
        token_value := substring(token_value, 1, 32);
        
        -- Verificar si el token ya existe
        SELECT EXISTS(SELECT 1 FROM client_tokens WHERE token = token_value) INTO token_exists;
        
        -- Si no existe, salir del loop
        IF NOT token_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Insertar el nuevo token
    INSERT INTO client_tokens (client_id, token) VALUES (client_uuid, token_value);
    
    RETURN token_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar token y obtener cliente
CREATE OR REPLACE FUNCTION validate_client_token(token_value TEXT)
RETURNS TABLE(
    client_id UUID,
    client_name TEXT,
    client_company TEXT,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name::TEXT,
        COALESCE(c.company, '')::TEXT,
        (ct.is_active AND (ct.expires_at IS NULL OR ct.expires_at > NOW())) as is_valid
    FROM client_tokens ct
    JOIN clients c ON c.id = ct.client_id
    WHERE ct.token = token_value;
    
    -- Actualizar last_used_at si el token es válido
    UPDATE client_tokens 
    SET last_used_at = NOW() 
    WHERE token = token_value 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para enviar mensaje desde cliente
CREATE OR REPLACE FUNCTION send_client_message(
    token_value TEXT,
    message_text TEXT,
    project_uuid UUID DEFAULT NULL,
    attachments_json JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    client_uuid UUID;
    message_id UUID;
    is_token_valid BOOLEAN;
BEGIN
    -- Validar token
    SELECT client_id, is_valid INTO client_uuid, is_token_valid
    FROM validate_client_token(token_value);
    
    IF NOT is_token_valid OR client_uuid IS NULL THEN
        RAISE EXCEPTION 'Token inválido o expirado';
    END IF;
    
    -- Insertar mensaje
    INSERT INTO client_messages (
        client_id, 
        project_id, 
        message, 
        sender_type, 
        attachments
    ) VALUES (
        client_uuid, 
        project_uuid, 
        message_text, 
        'client', 
        attachments_json
    ) RETURNING id INTO message_id;
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== TRIGGERS ====================

-- Función para actualizar updated_at (crear solo si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at en client_tokens
DROP TRIGGER IF EXISTS update_client_tokens_updated_at ON client_tokens;
CREATE TRIGGER update_client_tokens_updated_at 
    BEFORE UPDATE ON client_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at en client_messages
DROP TRIGGER IF EXISTS update_client_messages_updated_at ON client_messages;
CREATE TRIGGER update_client_messages_updated_at 
    BEFORE UPDATE ON client_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== COMENTARIOS ====================

COMMENT ON TABLE client_tokens IS 'Tokens únicos para acceso de clientes sin registro';
COMMENT ON TABLE client_messages IS 'Mensajes bidireccionales entre cliente y freelancer';
COMMENT ON TABLE client_notifications IS 'Notificaciones del sistema para clientes';

COMMENT ON FUNCTION generate_client_token(UUID) IS 'Genera token único para un cliente';
COMMENT ON FUNCTION validate_client_token(TEXT) IS 'Valida token y retorna información del cliente';
COMMENT ON FUNCTION send_client_message(TEXT, TEXT, UUID, JSONB) IS 'Envía mensaje desde cliente usando token';

-- ==================== DATOS DE EJEMPLO ====================

-- Insertar algunos tokens de ejemplo (opcional)
-- Solo ejecutar si quieres datos de prueba
/*
DO $$
DECLARE
    test_client_id UUID;
    test_token TEXT;
BEGIN
    -- Obtener un cliente existente o crear uno de prueba
    SELECT id INTO test_client_id FROM clients LIMIT 1;
    
    IF test_client_id IS NOT NULL THEN
        -- Generar token para el cliente
        SELECT generate_client_token(test_client_id) INTO test_token;
        
        -- Mostrar el token generado
        RAISE NOTICE 'Token de prueba generado: %', test_token;
        RAISE NOTICE 'URL de acceso: https://tuclyra.com/client-portal/%', test_token;
    END IF;
END $$;
*/

-- ==================== FINALIZADO ====================

SELECT 'Migración de comunicación con clientes completada! 🎉' as resultado;
SELECT 'Ahora puedes generar tokens únicos para que los clientes accedan sin registro' as info;
