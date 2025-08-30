-- Script para activar todas las automatizaciones
-- Esto hace que todas las automatizaciones estén siempre activas por defecto

UPDATE automations 
SET is_active = true 
WHERE is_active = false;

-- Verificar el resultado
SELECT 
    name,
    trigger_type,
    is_active,
    execution_count
FROM automations 
ORDER BY created_at DESC;
