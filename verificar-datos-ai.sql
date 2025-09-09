-- Verificar datos específicos para el análisis de IA
-- e7ed7c8d-229a-42d1-8a44-37bcc64c440c

-- Verificar eventos de calendario con tiempo trabajado
SELECT 
  'Eventos con tiempo:' as tipo,
  COUNT(*) as cantidad,
  SUM(time_tracked) as total_segundos,
  ROUND(SUM(time_tracked) / 3600.0, 2) as total_horas,
  SUM(actual_revenue) as revenue_total
FROM calendar_events 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
  AND time_tracked > 0
  AND start_time >= CURRENT_DATE - INTERVAL '90 days';

-- Verificar tareas con tiempo
SELECT 
  'Tareas con tiempo:' as tipo,
  COUNT(*) as cantidad,
  SUM(total_time_seconds) as total_segundos,
  ROUND(SUM(total_time_seconds) / 3600.0, 2) as total_horas
FROM tasks 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
  AND total_time_seconds > 0;

-- Verificar facturas recientes
SELECT 
  'Facturas últimos 90 días:' as tipo,
  COUNT(*) as cantidad,
  SUM(total_amount) as total_facturado
FROM invoices 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
  AND issue_date >= CURRENT_DATE - INTERVAL '90 days';

-- Ver algunos eventos específicos
SELECT 
  title,
  start_time,
  time_tracked / 3600.0 as horas,
  actual_revenue,
  productivity_score
FROM calendar_events 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
  AND time_tracked > 0
ORDER BY start_time DESC
LIMIT 5;
