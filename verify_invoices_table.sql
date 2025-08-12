-- VERIFICAR/CREAR ESTRUCTURA DE TABLA INVOICES
-- Ejecutar en el SQL Editor de Supabase

-- Paso 1: Verificar si la tabla invoices existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'invoices';

-- Paso 2: Ver la estructura actual de la tabla invoices (si existe)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 3: Si la tabla no tiene las columnas necesarias, agregarlas
-- (Solo ejecutar si faltan columnas)

-- Agregar columnas para datos del cliente (si no existen)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS client_nif VARCHAR(20),
ADD COLUMN IF NOT EXISTS client_address TEXT,
ADD COLUMN IF NOT EXISTS client_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS client_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS client_province VARCHAR(100);

-- Agregar columnas para datos de factura (si no existen)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS invoice_date DATE,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100),
ADD COLUMN IF NOT EXISTS items JSONB;

-- Paso 4: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);

-- Paso 5: Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND table_schema = 'public'
ORDER BY ordinal_position;
