-- VERIFICAR Y COMPLETAR LA CONFIGURACIÓN DE company_settings
-- Ejecutar estos comandos UNO POR UNO para completar lo que falta

-- PASO 1: Verificar que la tabla existe y ver su estructura
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'company_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Verificar si existe el índice único
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'company_settings' AND schemaname = 'public';

-- PASO 3: Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'company_settings' AND schemaname = 'public';

-- PASO 4: Verificar las políticas existentes
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'company_settings' AND schemaname = 'public';

-- COMANDOS DE REPARACIÓN (Ejecutar solo si los anteriores muestran que falta algo)

-- Si falta el índice único:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);

-- Si RLS no está habilitado:
-- ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Si faltan las políticas, ejecutar UNA POR UNA:
-- CREATE POLICY "Users can view own company settings" ON public.company_settings FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own company settings" ON public.company_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own company settings" ON public.company_settings FOR UPDATE USING (auth.uid() = user_id);  
-- CREATE POLICY "Users can delete own company settings" ON public.company_settings FOR DELETE USING (auth.uid() = user_id);
