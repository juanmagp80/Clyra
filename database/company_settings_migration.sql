-- Tabla para configuración fiscal de la empresa
-- Tabla para almacenar la configuración fiscal de cada empresa/usuario

CREATE TABLE IF NOT EXISTS company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Datos fiscales obligatorios
    company_name TEXT NOT NULL,
    nif TEXT NOT NULL, -- NIF/CIF
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'España',
    
    -- Datos adicionales opcionales
    registration_number TEXT, -- Registro Mercantil
    social_capital DECIMAL(10,2), -- Capital Social
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Configuración de facturación
    invoice_series TEXT DEFAULT 'A', -- Serie por defecto
    next_invoice_number INTEGER DEFAULT 1, -- Próximo número de factura
    current_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()), -- Año actual para secuencia
    
    -- Configuración de impuestos por defecto
    default_vat_rate DECIMAL(5,2) DEFAULT 21.00, -- IVA por defecto
    default_retention_rate DECIMAL(5,2) DEFAULT 0.00, -- Retención IRPF por defecto
    
    -- Control de versiones y auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT unique_user_company UNIQUE (user_id),
    CONSTRAINT valid_postal_code CHECK (postal_code ~ '^\d{5}$'),
    CONSTRAINT valid_vat_rate CHECK (default_vat_rate >= 0 AND default_vat_rate <= 100),
    CONSTRAINT valid_retention_rate CHECK (default_retention_rate >= 0 AND default_retention_rate <= 100)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_nif ON company_settings(nif);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE OR REPLACE TRIGGER trigger_update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_company_settings_updated_at();

-- Función para obtener el siguiente número de factura
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_user_id UUID, p_year INTEGER DEFAULT NULL, p_series TEXT DEFAULT 'A')
RETURNS INTEGER AS $$
DECLARE
    current_year INTEGER;
    next_number INTEGER;
BEGIN
    current_year := COALESCE(p_year, EXTRACT(YEAR FROM NOW())::INTEGER);
    
    -- Obtener y actualizar el siguiente número de factura
    UPDATE company_settings 
    SET 
        next_invoice_number = CASE 
            WHEN current_year = current_year THEN next_invoice_number + 1
            ELSE 1 -- Resetear para nuevo año
        END,
        current_year = current_year
    WHERE user_id = p_user_id
    RETURNING next_invoice_number - 1 INTO next_number;
    
    -- Si no hay configuración de empresa, devolver 1
    IF next_number IS NULL THEN
        next_number := 1;
    END IF;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y modificar su propia configuración
CREATE OR REPLACE POLICY "Users can view own company settings" 
ON company_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE OR REPLACE POLICY "Users can insert own company settings" 
ON company_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE POLICY "Users can update own company settings" 
ON company_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE OR REPLACE POLICY "Users can delete own company settings" 
ON company_settings FOR DELETE 
USING (auth.uid() = user_id);

-- Actualizar tabla de facturas para incluir campos requeridos por normativa española
-- Si la tabla invoices existe, agregar las columnas necesarias
DO $$
BEGIN
    -- Verificar si la tabla invoices existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
        
        -- Agregar columnas si no existen
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'invoice_number') THEN
            ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'series') THEN
            ALTER TABLE invoices ADD COLUMN series TEXT DEFAULT 'A';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'issue_date') THEN
            ALTER TABLE invoices ADD COLUMN issue_date DATE DEFAULT CURRENT_DATE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'service_date') THEN
            ALTER TABLE invoices ADD COLUMN service_date DATE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_nif') THEN
            ALTER TABLE invoices ADD COLUMN client_nif TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_address') THEN
            ALTER TABLE invoices ADD COLUMN client_address TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_postal_code') THEN
            ALTER TABLE invoices ADD COLUMN client_postal_code TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_city') THEN
            ALTER TABLE invoices ADD COLUMN client_city TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_country') THEN
            ALTER TABLE invoices ADD COLUMN client_country TEXT DEFAULT 'España';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'subtotal') THEN
            ALTER TABLE invoices ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'tax_rate') THEN
            ALTER TABLE invoices ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 21.00;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'tax_amount') THEN
            ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'retention_rate') THEN
            ALTER TABLE invoices ADD COLUMN retention_rate DECIMAL(5,2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'retention_amount') THEN
            ALTER TABLE invoices ADD COLUMN retention_amount DECIMAL(10,2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_method') THEN
            ALTER TABLE invoices ADD COLUMN payment_method TEXT DEFAULT 'Transferencia bancaria';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'qr_data') THEN
            ALTER TABLE invoices ADD COLUMN qr_data TEXT;
        END IF;
        
        -- Agregar restricciones si no existen
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_name = 'invoices' AND constraint_name = 'unique_invoice_number_year') THEN
            ALTER TABLE invoices ADD CONSTRAINT unique_invoice_number_year UNIQUE (invoice_number, EXTRACT(YEAR FROM issue_date));
        END IF;
        
        -- Índices para optimización
        CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
        CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
        CREATE INDEX IF NOT EXISTS idx_invoices_client_nif ON invoices(client_nif);
        
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON TABLE company_settings IS 'Configuración fiscal de la empresa para cumplimiento de normativa española';
COMMENT ON COLUMN company_settings.nif IS 'NIF/CIF de la empresa (validado)';
COMMENT ON COLUMN company_settings.invoice_series IS 'Serie de facturación por defecto (A, B, C, etc.)';
COMMENT ON COLUMN company_settings.next_invoice_number IS 'Próximo número secuencial de factura';
COMMENT ON FUNCTION get_next_invoice_number IS 'Obtiene el siguiente número de factura secuencial por año y serie';
