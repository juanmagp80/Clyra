-- Migración para añadir columna success_rate a la tabla automations
-- Ejecutar en tu base de datos Supabase

-- Añadir la columna success_rate si no existe
ALTER TABLE automations 
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 1.00;

-- Comentario sobre la columna
COMMENT ON COLUMN automations.success_rate IS 'Tasa de éxito de la automatización (0.0 a 1.0)';

-- Crear índice para mejorar rendimiento en consultas de filtrado por éxito
CREATE INDEX IF NOT EXISTS idx_automations_success_rate 
ON automations(success_rate) 
WHERE success_rate IS NOT NULL;

-- Actualizar automatizaciones existentes con success_rate por defecto
UPDATE automations 
SET success_rate = 1.00 
WHERE success_rate IS NULL;

-- Crear función para actualizar success_rate automáticamente
CREATE OR REPLACE FUNCTION update_automation_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE automations
    SET success_rate = CASE 
        WHEN execution_count = 0 THEN 1.00
        ELSE LEAST(1.00, GREATEST(0.00, 
            (SELECT COUNT(*) FROM automation_executions 
             WHERE automation_id = NEW.automation_id AND success = true)::decimal / 
            NULLIF(execution_count, 0)
        ))
    END
    WHERE id = NEW.automation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar success_rate cuando cambien las ejecuciones
DROP TRIGGER IF EXISTS trigger_update_success_rate ON automation_executions;
CREATE TRIGGER trigger_update_success_rate
    AFTER INSERT OR UPDATE OR DELETE ON automation_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_success_rate();
