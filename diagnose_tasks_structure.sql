-- Verificar la estructura de la tabla tasks
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Verificar las constraints existentes en tasks
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'tasks';

-- Verificar si existe alguna columna que sirva como primary key
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'tasks'
AND (column_name LIKE '%id%' OR is_nullable = 'NO')
ORDER BY ordinal_position;
