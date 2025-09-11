-- Agregar campos para la numeración de presupuestos
ALTER TABLE budgets 
    ADD COLUMN IF NOT EXISTS budget_number INTEGER,
    ADD COLUMN IF NOT EXISTS budget_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
    ADD COLUMN IF NOT EXISTS budget_reference VARCHAR(20);

-- Crear secuencia para los números de presupuesto (reinicia cada año)
CREATE SEQUENCE IF NOT EXISTS budget_number_seq;

-- Función para generar la referencia del presupuesto
CREATE OR REPLACE FUNCTION generate_budget_reference()
RETURNS TRIGGER AS $$
DECLARE
    current_year INTEGER;
    formatted_number VARCHAR(10);
BEGIN
    -- Obtener el año actual
    current_year := EXTRACT(YEAR FROM NEW.created_at);
    
    -- Si es un nuevo año, reiniciar la secuencia
    IF NEW.budget_year != current_year OR NEW.budget_year IS NULL THEN
        -- Encontrar el último número usado para este año
        SELECT COALESCE(MAX(budget_number), 0) INTO formatted_number
        FROM budgets
        WHERE budget_year = current_year;
        
        -- Reiniciar la secuencia al último número usado + 1
        PERFORM setval('budget_number_seq', formatted_number);
        
        -- Establecer el año
        NEW.budget_year = current_year;
    END IF;

    -- Asignar el siguiente número
    NEW.budget_number := nextval('budget_number_seq');
    
    -- Generar la referencia con formato PRES-AÑO-NÚMERO (ej: PRES-2025-001)
    NEW.budget_reference := 'PRES-' || current_year || '-' || LPAD(NEW.budget_number::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar automáticamente el número y referencia al crear un presupuesto
DROP TRIGGER IF EXISTS tr_generate_budget_reference ON budgets;
CREATE TRIGGER tr_generate_budget_reference
    BEFORE INSERT ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION generate_budget_reference();

-- Actualizar presupuestos existentes con números y referencias
WITH numbered_budgets AS (
    SELECT 
        id,
        created_at,
        EXTRACT(YEAR FROM created_at) as year,
        ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM created_at) ORDER BY created_at) as new_number
    FROM budgets
    WHERE budget_reference IS NULL
)
UPDATE budgets b
SET 
    budget_number = nb.new_number,
    budget_year = nb.year::INTEGER,
    budget_reference = 'PRES-' || nb.year || '-' || LPAD(nb.new_number::TEXT, 3, '0')
FROM numbered_budgets nb
WHERE b.id = nb.id;

-- Actualizar la secuencia al último número usado del año actual
SELECT setval('budget_number_seq', 
    COALESCE(
        (SELECT MAX(budget_number) 
         FROM budgets 
         WHERE budget_year = EXTRACT(YEAR FROM NOW())::INTEGER),
        0
    ));
