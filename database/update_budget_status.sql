-- Actualizar el tipo enum de status para presupuestos
ALTER TABLE budgets 
    DROP CONSTRAINT IF EXISTS budgets_status_check;

ALTER TABLE budgets
    ADD CONSTRAINT budgets_status_check 
    CHECK (status IN ('draft', 'sent', 'approved', 'rejected'));

-- Actualizar cualquier presupuesto con estado 'expired' a 'draft'
UPDATE budgets 
SET status = 'draft' 
WHERE status = 'expired';
