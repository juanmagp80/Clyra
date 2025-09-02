-- Tabla principal de presupuestos
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 21.00, -- IVA por defecto 21%
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    -- Metadatos adicionales
    notes TEXT,
    terms_conditions TEXT,
    
    -- Campos para seguimiento
    viewed_by_client_at TIMESTAMPTZ,
    client_ip_address INET
);

-- Tabla de items del presupuesto
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    type VARCHAR(20) DEFAULT 'hours' CHECK (type IN ('hours', 'fixed', 'milestone')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON budgets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);

-- RLS (Row Level Security)
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para budgets
DROP POLICY IF EXISTS "Users can manage own budgets" ON budgets;
CREATE POLICY "Users can manage own budgets" ON budgets
    FOR ALL USING (auth.uid() = user_id);

-- Políticas de seguridad para budget_items
DROP POLICY IF EXISTS "Users can manage own budget items" ON budget_items;
CREATE POLICY "Users can manage own budget items" ON budget_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM budgets 
            WHERE budgets.id = budget_items.budget_id 
            AND budgets.user_id = auth.uid()
        )
    );

-- Función para actualizar el total del presupuesto
CREATE OR REPLACE FUNCTION update_budget_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el total del presupuesto cuando se modifican los items
    UPDATE budgets 
    SET 
        total_amount = (
            SELECT COALESCE(SUM(total), 0) 
            FROM budget_items 
            WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente el total
DROP TRIGGER IF EXISTS trigger_update_budget_total_insert ON budget_items;
CREATE TRIGGER trigger_update_budget_total_insert
    AFTER INSERT ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_budget_total();

DROP TRIGGER IF EXISTS trigger_update_budget_total_update ON budget_items;
CREATE TRIGGER trigger_update_budget_total_update
    AFTER UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_budget_total();

DROP TRIGGER IF EXISTS trigger_update_budget_total_delete ON budget_items;
CREATE TRIGGER trigger_update_budget_total_delete
    AFTER DELETE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_budget_total();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para budgets
DROP TRIGGER IF EXISTS trigger_update_budgets_updated_at ON budgets;
CREATE TRIGGER trigger_update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE budgets IS 'Tabla principal para almacenar presupuestos de los usuarios';
COMMENT ON TABLE budget_items IS 'Items individuales de cada presupuesto';
COMMENT ON COLUMN budgets.status IS 'Estado del presupuesto: draft, sent, approved, rejected, expired';
COMMENT ON COLUMN budget_items.type IS 'Tipo de item: hours (por horas), fixed (precio fijo), milestone (hito)';
COMMENT ON COLUMN budget_items.total IS 'Campo calculado automáticamente: quantity * unit_price';
