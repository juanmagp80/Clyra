-- Verificar valores de status existentes en invoices
SELECT DISTINCT status, COUNT(*) as cantidad
FROM invoices 
GROUP BY status
ORDER BY cantidad DESC;

-- Ver algunos registros de ejemplo
SELECT status, title, created_at 
FROM invoices 
ORDER BY created_at DESC 
LIMIT 5;
