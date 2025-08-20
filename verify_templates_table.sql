-- Script para verificar si la tabla de templates existe y tiene datos
-- Ejecutar en Supabase SQL Editor

-- Verificar si la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'project_templates'
);

-- Si existe, verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'project_templates' 
ORDER BY ordinal_position;

-- Ver los datos existentes
SELECT id, name, category, description, is_public, usage_count, created_at
FROM project_templates
ORDER BY created_at DESC;

-- Contar por categoría
SELECT category, COUNT(*) as count
FROM project_templates
GROUP BY category;

-- Ver si hay templates públicos
SELECT COUNT(*) as public_templates
FROM project_templates
WHERE is_public = true;
