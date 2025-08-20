-- VERIFICAR Y COMPLETAR CONFIGURACIÓN (Ignorar errores de políticas existentes)
-- Ejecutar estos comandos uno por uno en Supabase SQL Editor

-- PASO 1: Verificar que todas las columnas existan
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'company_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'company_settings' AND schemaname = 'public';

-- PASO 3: Verificar que las políticas existan
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'company_settings' AND schemaname = 'public';

-- PASO 4: Verificar que puedas insertar datos (esto debería funcionar sin errores si todo está bien)
-- NO EJECUTES ESTE PASO, solo es para referencia:
-- SELECT auth.uid() as current_user_id;

-- PASO 5: Si el PASO 1 muestra que faltan columnas, ejecuta solo las que necesites:

-- Solo si falta company_name:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT '';

-- Solo si falta nif:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS nif TEXT NOT NULL DEFAULT '';

-- Solo si falta address:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';

-- Solo si falta postal_code:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS postal_code TEXT NOT NULL DEFAULT '';

-- Solo si falta city:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';

-- Solo si falta province:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '';

-- Solo si falta country:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'España';

-- Solo si falta phone:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS phone TEXT;

-- Solo si falta email:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS email TEXT;

-- Solo si falta website:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS website TEXT;

-- Solo si falta registration_number:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- Solo si falta social_capital:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS social_capital DECIMAL(12,2) DEFAULT 0;

-- Solo si faltan timestamps:
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- PASO 6: Resultado esperado del PASO 1:
-- Deberías ver estas columnas:
-- id, user_id, company_name, nif, address, postal_code, city, province, country, 
-- phone, email, website, registration_number, social_capital, created_at, updated_at
