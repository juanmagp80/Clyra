-- Tabla para almacenar consentimientos de cookies por usuario
-- Permite sincronizar preferencias entre dispositivos y cumplir con RGPD

CREATE TABLE IF NOT EXISTS user_cookie_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{"necessary": true, "analytics": false, "marketing": false, "functional": false}',
    version VARCHAR(10) NOT NULL DEFAULT '1.0',
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_consent UNIQUE(user_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_cookie_consents_user_id ON user_cookie_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cookie_consents_updated_at ON user_cookie_consents(updated_at);

-- RLS (Row Level Security)
ALTER TABLE user_cookie_consents ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y modificar sus propios consentimientos
CREATE POLICY "Users can manage own cookie consents" ON user_cookie_consents
    FOR ALL USING (auth.uid() = user_id);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_user_cookie_consents_updated_at ON user_cookie_consents;
CREATE TRIGGER update_user_cookie_consents_updated_at
    BEFORE UPDATE ON user_cookie_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE user_cookie_consents IS 'Almacena los consentimientos de cookies de los usuarios para cumplir con RGPD';
COMMENT ON COLUMN user_cookie_consents.preferences IS 'Preferencias de cookies en formato JSON: {"necessary": true, "analytics": false, "marketing": false, "functional": false}';
COMMENT ON COLUMN user_cookie_consents.version IS 'Versión de la política de cookies aceptada';
COMMENT ON COLUMN user_cookie_consents.user_agent IS 'User agent del navegador para referencia';

-- Insertar datos de ejemplo (opcional - comentar en producción)
-- INSERT INTO user_cookie_consents (user_id, preferences, version, user_agent) 
-- VALUES 
-- (auth.uid(), '{"necessary": true, "analytics": true, "marketing": false, "functional": true}', '1.0', 'Mozilla/5.0...')
-- ON CONFLICT (user_id) DO NOTHING;
