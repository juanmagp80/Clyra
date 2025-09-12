-- La tabla budgets ya tiene las columnas necesarias:
-- budget_number (integer), budget_year (integer), budget_reference (varchar)
-- Vamos a usar budget_reference para el formato PREP-XXXX

-- Crear o reemplazar función para generar referencias de presupuesto
CREATE OR REPLACE FUNCTION generate_budget_reference()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    current_year INTEGER;
    budget_prefix TEXT := 'PREP-';
    formatted_reference TEXT;
BEGIN
    -- Solo generar referencia si no existe ya una
    IF NEW.budget_reference IS NULL OR NEW.budget_reference = '' THEN
        -- Obtener el año actual
        current_year := EXTRACT(YEAR FROM NOW());
        
        -- Establecer el año del presupuesto
        NEW.budget_year := current_year;
        
        -- Obtener el siguiente número secuencial para este usuario en el año actual
        SELECT COALESCE(MAX(budget_number), 0) + 1 
        INTO next_number
        FROM budgets 
        WHERE user_id = NEW.user_id 
        AND budget_year = current_year;
        
        -- Establecer el número
        NEW.budget_number := next_number;
        
        -- Formatear referencia con año y número (ej: PREP-2024-001)
        formatted_reference := budget_prefix || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
        
        NEW.budget_reference := formatted_reference;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- El trigger tr_generate_budget_reference ya existe, no necesitamos crearlo de nuevo

-- Actualizar presupuestos existentes sin referencias
DO $$
DECLARE 
    budget_record RECORD;
    next_number INTEGER;
    budget_year INTEGER;
    budget_prefix TEXT := 'PREP-';
    formatted_reference TEXT;
BEGIN
    -- Iterar sobre todos los presupuestos sin referencia, agrupados por usuario y año
    FOR budget_record IN 
        SELECT id, user_id, created_at, 
               EXTRACT(YEAR FROM created_at) as year_created
        FROM budgets 
        WHERE budget_reference IS NULL OR budget_reference = ''
        ORDER BY user_id, created_at ASC
    LOOP
        budget_year := budget_record.year_created;
        
        -- Obtener el siguiente número para este usuario en ese año
        SELECT COALESCE(MAX(budget_number), 0) + 1 
        INTO next_number
        FROM budgets 
        WHERE user_id = budget_record.user_id 
        AND budget_year = budget_year
        AND budget_reference IS NOT NULL
        AND budget_reference != '';
        
        -- Si no hay números previos para ese año, comenzar desde 1
        IF next_number IS NULL THEN
            next_number := 1;
        END IF;
        
        -- Formatear referencia
        formatted_reference := budget_prefix || budget_year || '-' || LPAD(next_number::TEXT, 3, '0');
        
        -- Actualizar el presupuesto
        UPDATE budgets 
        SET budget_number = next_number,
            budget_year = budget_year,
            budget_reference = formatted_reference
        WHERE id = budget_record.id;
        
    END LOOP;
END $$;

-- Crear índices para optimizar consultas de referencias de presupuesto
CREATE INDEX IF NOT EXISTS idx_budgets_budget_reference ON budgets(budget_reference);
CREATE INDEX IF NOT EXISTS idx_budgets_user_year_number ON budgets(user_id, budget_year, budget_number);

-- Verificar que todo funcionó correctamente
SELECT 
    user_id,
    budget_year,
    COUNT(*) as total_budgets,
    COUNT(budget_reference) as budgets_with_reference,
    MIN(budget_reference) as first_reference,
    MAX(budget_reference) as last_reference,
    MIN(budget_number) as first_number,
    MAX(budget_number) as last_number
FROM budgets 
GROUP BY user_id, budget_year
ORDER BY user_id, budget_year;
