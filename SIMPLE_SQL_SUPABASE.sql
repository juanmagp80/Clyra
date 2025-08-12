-- SQL SIMPLIFICADO PARA SUPABASE
-- Ejecutar estos comandos UNO POR UNO en el SQL Editor de Supabase

-- PASO 1: Crear la tabla company_settings
CREATE TABLE public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    nif TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT DEFAULT 'España',
    phone TEXT,
    email TEXT,
    website TEXT,
    registration_number TEXT,
    social_capital DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 2: Crear índice único para user_id
CREATE UNIQUE INDEX idx_company_settings_user_id ON public.company_settings(user_id);

-- PASO 3: Habilitar RLS (Row Level Security)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear política para SELECT (Ver propios datos)
CREATE POLICY "Users can view own company settings" ON public.company_settings
    FOR SELECT USING (auth.uid() = user_id);

-- PASO 5: Crear política para INSERT (Insertar propios datos)
CREATE POLICY "Users can insert own company settings" ON public.company_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PASO 6: Crear política para UPDATE (Actualizar propios datos)
CREATE POLICY "Users can update own company settings" ON public.company_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- PASO 7: Crear política para DELETE (Eliminar propios datos)
CREATE POLICY "Users can delete own company settings" ON public.company_settings
    FOR DELETE USING (auth.uid() = user_id);
