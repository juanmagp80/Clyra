-- Script para verificar la estructura de las tablas existentes
-- Ejecutar primero en Supabase SQL Editor para ver qué columnas existen

-- Ver estructura de la tabla clients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Ver estructura de la tabla projects
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Ver estructura de la tabla invoices
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'invoices' 
ORDER BY ordinal_position;
