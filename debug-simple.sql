-- Script de debug simplificado con SELECT para ver los resultados
-- e7ed7c8d-229a-42d1-8a44-37bcc64c440c

-- Primero verificar si el usuario existe
SELECT 'Usuario existe:', EXISTS(SELECT 1 FROM auth.users WHERE id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c');

-- Verificar datos actuales
SELECT 'Clientes existentes:' as tipo, COUNT(*) as cantidad FROM clients WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Proyectos existentes:', COUNT(*) FROM projects WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Eventos existentes:', COUNT(*) FROM calendar_events WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Tareas existentes:', COUNT(*) FROM tasks WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Presupuestos existentes:', COUNT(*) FROM budgets WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Facturas existentes:', COUNT(*) FROM invoices WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

-- Ahora intentar crear datos paso a paso
-- 1. Crear cliente
WITH new_client AS (
  INSERT INTO clients (id, user_id, name, email, company, phone, address, city, province, nif)
  VALUES (gen_random_uuid(), 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'TechCorp Solutions', 'ceo@techcorp.es', 'TechCorp Solutions SL', '+34 600 555 777', 'Calle Serrano 95', 'Madrid', 'Madrid', 'B88776655')
  RETURNING id, name
)
SELECT 'Cliente creado:' as resultado, name FROM new_client;

-- Verificar que se creó el cliente
SELECT 'Clientes después de inserción:' as verificacion, COUNT(*) as cantidad FROM clients WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
