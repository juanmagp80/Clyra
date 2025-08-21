-- Crear tabla para configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial para el monitoreo
INSERT INTO system_config (key, value, description)
VALUES 
('meeting_monitor_active', 'false', 'Estado del monitoreo automático de reuniones'),
('meeting_monitor_last_execution', '', 'Última ejecución del monitoreo automático')
ON CONFLICT (key) DO NOTHING;

-- Configurar RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso completo con service role
CREATE POLICY "Allow service role full access on system_config"
ON system_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Política para solo lectura a usuarios autenticados
CREATE POLICY "Allow authenticated read on system_config"
ON system_config
FOR SELECT
TO authenticated
USING (true);
