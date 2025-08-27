-- MIGRACIÓN: Agregar campos NIF, Ciudad y Provincia a tabla clients
-- Ejecutar en el SQL Editor de Supabase

-- Paso 1: Agregar las nuevas columnas
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS nif VARCHAR(20),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS province VARCHAR(100);

-- Paso 2: Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_clients_nif ON public.clients(nif);
CREATE INDEX IF NOT EXISTS idx_clients_city ON public.clients(city);
CREATE INDEX IF NOT EXISTS idx_clients_province ON public.clients(province);

-- Paso 3: Verificar la estructura actualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 4: Verificar algunos registros existentes
SELECT 
    id,
    name,
    company,
    city,
    province,
    nif,
    created_at
FROM public.clients 
ORDER BY created_at DESC 
LIMIT 10;
