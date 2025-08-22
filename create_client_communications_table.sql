-- Crear tabla client_communications para registrar comunicaciones
CREATE TABLE IF NOT EXISTS client_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email', 'call', 'meeting', etc.
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'failed', 'pending'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_client_communications_user_id ON client_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_type ON client_communications(type);
CREATE INDEX IF NOT EXISTS idx_client_communications_created_at ON client_communications(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias comunicaciones
CREATE POLICY client_communications_user_policy ON client_communications
    FOR ALL USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE client_communications IS 'Registro de todas las comunicaciones con clientes (emails, llamadas, etc.)';
COMMENT ON COLUMN client_communications.type IS 'Tipo de comunicación: email, call, meeting, etc.';
COMMENT ON COLUMN client_communications.status IS 'Estado de la comunicación: sent, failed, pending';
