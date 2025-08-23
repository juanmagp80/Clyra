-- Verificar la estructura actual de las tablas tasks y projects
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name IN ('tasks', 'projects', 'time_entries')
ORDER BY table_name, ordinal_position;
