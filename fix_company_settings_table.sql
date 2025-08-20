-- REPARAR TABLA company_settings - Agregar columnas faltantes
-- Ejecutar estos comandos UNO POR UNO en el SQL Editor de Supabase

-- PASO 1: Ver la estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'company_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Agregar las columnas que faltan (ejecutar solo las que no existan)

-- Agregar columna company_name si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT '';

-- Agregar columna nif si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS nif TEXT NOT NULL DEFAULT '';

-- Agregar columna address si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';

-- Agregar columna postal_code si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS postal_code TEXT NOT NULL DEFAULT '';

-- Agregar columna city si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';

-- Agregar columna province si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '';

-- Agregar columna country si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'España';

-- Agregar columna phone si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Agregar columna email si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Agregar columna website si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS website TEXT;

-- Agregar columna registration_number si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- Agregar columna social_capital si no existe
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS social_capital DECIMAL(12,2) DEFAULT 0;

-- Agregar columnas de timestamps si no existen
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- PASO 3: Crear índice único para user_id si no existe
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);

-- PASO 4: Habilitar RLS si no está habilitado
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear las políticas si no existen (ejecutar una por una)
-- Nota: Si ya existen, dará error pero no afectará el funcionamiento

-- Política para SELECT
CREATE POLICY "Users can view own company settings" ON public.company_settings
    FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT  
CREATE POLICY "Users can insert own company settings" ON public.company_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update own company settings" ON public.company_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete own company settings" ON public.company_settings
    FOR DELETE USING (auth.uid() = user_id);

-- PASO 6: Verificar la estructura final
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'company_settings' AND table_schema = 'public'
ORDER BY ordinal_position;
