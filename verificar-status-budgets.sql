-- Verificar valores de status existentes en budgets
SELECT DISTINCT status, COUNT(*) as cantidad
FROM budgets 
GROUP BY status
ORDER BY cantidad DESC;

-- Ver algunos registros de ejemplo
SELECT status, title, created_at 
FROM budgets 
ORDER BY created_at DESC 
LIMIT 5;
