-- Script simple para insertar datos de prueba
-- Reemplaza 'YOUR_USER_ID' con tu UUID real

-- ==============================
-- OBTENER TU USER ID
-- ==============================
-- Ejecuta esta consulta primero para obtener tu user_id:
-- SELECT id FROM auth.users WHERE email = 'tu_email@ejemplo.com';

-- ==============================
-- INSERTAR CLIENTES RÁPIDO
-- ==============================

INSERT INTO clients (user_id, name, email, phone, company, address, tag, created_at) VALUES
('YOUR_USER_ID', 'TechCorp Solutions', 'maria@techcorp.com', '+34 600 123 456', 'TechCorp', 'Calle Mayor 123, Madrid', 'premium', NOW() - INTERVAL '30 days'),
('YOUR_USER_ID', 'InnovaTech Startup', 'carlos@innovatech.es', '+34 600 234 567', 'InnovaTech', 'Avenida Digital 45, Barcelona', 'startup', NOW() - INTERVAL '25 days'),
('YOUR_USER_ID', 'Diseño Creativo', 'ana@diseño.com', '+34 600 345 678', 'Diseño SL', 'Plaza del Arte 12, Valencia', 'frequent', NOW() - INTERVAL '20 days'),
('YOUR_USER_ID', 'E-commerce Pro', 'roberto@ecommerce.com', '+34 600 456 789', 'E-commerce', 'Calle Comercial 78, Sevilla', 'recurring', NOW() - INTERVAL '15 days'),
('YOUR_USER_ID', 'Fashion Trend', 'carmen@fashion.es', '+34 600 789 012', 'Fashion Co', 'Calle de la Moda 89, Zaragoza', 'ecommerce', NOW() - INTERVAL '5 days');

-- ==============================
-- INSERTAR PROYECTOS RÁPIDO
-- ==============================

-- Obtener IDs de clientes (ejecutar después de insertar clientes)
INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date, created_at) VALUES
('YOUR_USER_ID', (SELECT id FROM clients WHERE name = 'TechCorp Solutions' LIMIT 1), 'App Móvil Corporativa', 'Desarrollo de app móvil para gestión interna', 'active', 25000, '2025-01-15', '2025-04-15', NOW() - INTERVAL '25 days'),
('YOUR_USER_ID', (SELECT id FROM clients WHERE name = 'InnovaTech Startup' LIMIT 1), 'Plataforma E-learning', 'Sistema de aprendizaje online completo', 'active', 18000, '2025-02-01', '2025-06-01', NOW() - INTERVAL '20 days'),
('YOUR_USER_ID', (SELECT id FROM clients WHERE name = 'Diseño Creativo' LIMIT 1), 'Rediseño Web', 'Rediseño completo del sitio web', 'completed', 8500, '2025-01-10', '2025-02-28', NOW() - INTERVAL '18 days'),
('YOUR_USER_ID', (SELECT id FROM clients WHERE name = 'E-commerce Pro' LIMIT 1), 'Sistema de Pagos', 'Integración de múltiples métodos de pago', 'active', 12000, '2025-02-15', '2025-04-30', NOW() - INTERVAL '15 days'),
('YOUR_USER_ID', (SELECT id FROM clients WHERE name = 'Fashion Trend' LIMIT 1), 'Tienda Online', 'E-commerce especializado en moda', 'paused', 15000, '2025-02-20', '2025-05-20', NOW() - INTERVAL '6 days');

-- ==============================
-- INSERTAR FACTURAS RÁPIDO
-- ==============================

INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, amount, tax_rate, tax_amount, total_amount, status, issue_date, due_date, created_at) VALUES
-- Factura pagada
('YOUR_USER_ID', 
 (SELECT id FROM clients WHERE name = 'Diseño Creativo' LIMIT 1),
 (SELECT id FROM projects WHERE name = 'Rediseño Web' LIMIT 1),
 'INV-2025-001', 'Rediseño Web Corporativo', 8500, 21, 1785, 10285, 'paid', '2025-02-28', '2025-03-30', NOW() - INTERVAL '5 days'),

-- Factura enviada
('YOUR_USER_ID', 
 (SELECT id FROM clients WHERE name = 'TechCorp Solutions' LIMIT 1),
 (SELECT id FROM projects WHERE name = 'App Móvil Corporativa' LIMIT 1),
 'INV-2025-002', 'App Móvil - Primer Pago', 10000, 21, 2100, 12100, 'sent', '2025-03-01', '2025-04-01', NOW() - INTERVAL '2 days'),

-- Factura borrador
('YOUR_USER_ID', 
 (SELECT id FROM clients WHERE name = 'E-commerce Pro' LIMIT 1),
 (SELECT id FROM projects WHERE name = 'Sistema de Pagos' LIMIT 1),
 'INV-2025-003', 'Integración Pagos - Fase 1', 6000, 21, 1260, 7260, 'draft', '2025-03-08', '2025-04-08', NOW()),

-- Factura vencida
('YOUR_USER_ID', 
 (SELECT id FROM clients WHERE name = 'Fashion Trend' LIMIT 1),
 (SELECT id FROM projects WHERE name = 'Tienda Online' LIMIT 1),
 'INV-2025-004', 'E-commerce Fashion - Anticipo', 7500, 21, 1575, 9075, 'overdue', '2025-02-20', '2025-03-22', NOW() - INTERVAL '14 days'),

-- Factura completada adicional
('YOUR_USER_ID', 
 (SELECT id FROM clients WHERE name = 'InnovaTech Startup' LIMIT 1),
 (SELECT id FROM projects WHERE name = 'Plataforma E-learning' LIMIT 1),
 'INV-2025-005', 'E-learning - Avance 30%', 5400, 21, 1134, 6534, 'sent', '2025-03-05', '2025-04-05', NOW() - INTERVAL '1 day');

-- ==============================
-- VERIFICAR DATOS INSERTADOS
-- ==============================

-- Contar registros insertados
SELECT 'Clientes' as tabla, COUNT(*) as total FROM clients WHERE user_id = 'YOUR_USER_ID'
UNION ALL
SELECT 'Proyectos' as tabla, COUNT(*) as total FROM projects WHERE user_id = 'YOUR_USER_ID' 
UNION ALL
SELECT 'Facturas' as tabla, COUNT(*) as total FROM invoices WHERE user_id = 'YOUR_USER_ID';

-- Ver resumen por estado
SELECT 'Proyectos por estado' as info, status, COUNT(*) as cantidad 
FROM projects WHERE user_id = 'YOUR_USER_ID' GROUP BY status
UNION ALL
SELECT 'Facturas por estado' as info, status, COUNT(*) as cantidad 
FROM invoices WHERE user_id = 'YOUR_USER_ID' GROUP BY status;
