-- Verificar fechas de los eventos creados
SELECT 
  'Eventos por fecha:' as tipo,
  DATE(start_time) as fecha,
  COUNT(*) as cantidad,
  SUM(time_tracked) / 3600.0 as total_horas
FROM calendar_events 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
GROUP BY DATE(start_time)
ORDER BY fecha DESC;

-- Verificar cuántos eventos están en los últimos 90 días
SELECT 
  'Eventos últimos 90 días:' as tipo,
  COUNT(*) as cantidad,
  SUM(time_tracked) / 3600.0 as total_horas
FROM calendar_events 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
  AND start_time >= CURRENT_DATE - INTERVAL '90 days';

-- Verificar fecha actual vs fechas de eventos
SELECT 
  CURRENT_DATE as fecha_actual,
  CURRENT_DATE - INTERVAL '90 days' as hace_90_dias,
  MIN(start_time) as evento_mas_antiguo,
  MAX(start_time) as evento_mas_reciente
FROM calendar_events 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
