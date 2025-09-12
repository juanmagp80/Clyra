-- Script simple para configurar numeración de presupuestos
-- Tu tabla ya tiene las columnas necesarias, solo actualizamos la función

-- 1. Crear/actualizar función para referencias de presupuesto
CREATE OR REPLACE FUNCTION generate_budget_reference()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    current_year INTEGER;
BEGIN
    IF NEW.budget_reference IS NULL OR NEW.budget_reference = '' THEN
        current_year := EXTRACT(YEAR FROM NOW());
        NEW.budget_year := current_year;
        
        SELECT COALESCE(MAX(budget_number), 0) + 1 
        INTO next_number
        FROM budgets 
        WHERE user_id = NEW.user_id AND budget_year = current_year;
        
        NEW.budget_number := next_number;
        NEW.budget_reference := 'PREP-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. El trigger ya existe, no necesitas crearlo

-- 3. Actualizar presupuestos existentes sin referencia
WITH numbered_budgets AS (
    SELECT 
        id,
        EXTRACT(YEAR FROM created_at) as year_created,
        ROW_NUMBER() OVER (PARTITION BY user_id, EXTRACT(YEAR FROM created_at) ORDER BY created_at) as row_num
    FROM budgets 
    WHERE budget_reference IS NULL OR budget_reference = ''
)
UPDATE budgets 
SET budget_reference = 'PREP-' || nb.year_created || '-' || LPAD(nb.row_num::TEXT, 3, '0'),
    budget_number = nb.row_num,
    budget_year = nb.year_created
FROM numbered_budgets nb
WHERE budgets.id = nb.id;
