-- Verificar constraints de la tabla budgets
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'budgets'::regclass
  AND contype = 'c'; -- check constraints

-- Ver estructura de la tabla budgets
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'budgets' 
ORDER BY ordinal_position;
