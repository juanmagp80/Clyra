-- Script SQL para crear la tabla company_settings en Supabase
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Crear tabla company_settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    nif TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT DEFAULT 'España' NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    registration_number TEXT,
    social_capital DECIMAL(12,2) DEFAULT 0,
    business_activity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_company UNIQUE(user_id)
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de seguridad
CREATE POLICY "Users can view own company settings" ON public.company_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company settings" ON public.company_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company settings" ON public.company_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company settings" ON public.company_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_nif ON public.company_settings(nif);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at_company_settings()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear trigger para updated_at
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at_company_settings();

-- 7. Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
