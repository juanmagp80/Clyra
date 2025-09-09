-- SQL SIMPLIFICADO PARA ai_insights
-- Como la tabla ya existe con la estructura correcta, solo verificamos

-- 1. VERIFICAR ESTRUCTURA ACTUAL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_insights' 
ORDER BY ordinal_position;

-- 2. LA TABLA YA ESTÁ BIEN CREADA - Solo asegurar RLS si no está
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR POLÍTICAS EXISTENTES
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'ai_insights';

-- 4. CREAR POLÍTICAS SOLO SI NO EXISTEN (estas pueden ya existir)
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_insights' 
        AND policyname = 'Users can view their own insights'
    ) THEN
        CREATE POLICY "Users can view their own insights" 
        ON ai_insights FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_insights' 
        AND policyname = 'Users can insert their own insights'
    ) THEN
        CREATE POLICY "Users can insert their own insights" 
        ON ai_insights FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_insights' 
        AND policyname = 'Users can update their own insights'
    ) THEN
        CREATE POLICY "Users can update their own insights" 
        ON ai_insights FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. VERIFICAR QUE TODO ESTÁ BIEN
SELECT 'ai_insights table structure verified' as status;
