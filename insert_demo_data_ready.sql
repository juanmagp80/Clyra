-- Script con datos de demostración para Clyra
-- Usuario: e7ed7c8d-229a-42d1-8a44-37bcc64c440c
-- ¡LISTO PARA EJECUTAR!

-- ==============================
-- INSERTAR CLIENTES
-- ==============================

INSERT INTO clients (user_id, name, email, phone, company, address, tag, created_at) VALUES
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'María González', 'maria@techcorp.com', '+34 600 123 456', 'TechCorp Solutions', 'Calle Mayor 123, 28013 Madrid', 'premium', NOW() - INTERVAL '30 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Carlos Rodríguez', 'carlos@innovatech.es', '+34 600 234 567', 'InnovaTech', 'Avenida Digital 45, 08002 Barcelona', 'startup', NOW() - INTERVAL '25 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Ana Martínez', 'ana@diseñocreativo.com', '+34 600 345 678', 'Diseño Creativo SL', 'Plaza del Arte 12, 46001 Valencia', 'frequent', NOW() - INTERVAL '20 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Roberto Silva', 'roberto@ecommercepro.com', '+34 600 456 789', 'E-commerce Pro', 'Calle Comercial 78, 41001 Sevilla', 'recurring', NOW() - INTERVAL '15 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Laura Fernández', 'laura@consultingplus.es', '+34 600 567 890', 'Consulting Plus', 'Paseo Empresarial 56, 48001 Bilbao', 'longterm', NOW() - INTERVAL '10 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'David López', 'david@startupvision.com', '+34 600 678 901', 'Startup Vision', 'Hub de Innovación 23, 29001 Málaga', 'budget', NOW() - INTERVAL '8 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Carmen Ruiz', 'carmen@fashiontrend.es', '+34 600 789 012', 'Fashion Trend', 'Calle de la Moda 89, 50001 Zaragoza', 'ecommerce', NOW() - INTERVAL '5 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Miguel Herrera', 'miguel@fooddelivery.com', '+34 600 890 123', 'Food Delivery Plus', 'Avenida Gastronómica 34, 03001 Alicante', 'mobile', NOW() - INTERVAL '3 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Isabel Torres', 'isabel@medicalcare.es', '+34 600 901 234', 'Medical Care Center', 'Plaza de la Salud 67, 47001 Valladolid', 'healthcare', NOW() - INTERVAL '2 days'),
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 'Alejandro Moreno', 'alex@realestatepro.com', '+34 600 012 345', 'Real Estate Pro', 'Calle Inmobiliaria 45, 14001 Córdoba', 'realestate', NOW() - INTERVAL '1 day');

-- ==============================
-- INSERTAR PROYECTOS
-- ==============================

INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date, created_at) VALUES
-- Proyectos para TechCorp Solutions (María González)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'María González' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'App Móvil Corporativa', 'Desarrollo de aplicación móvil para gestión interna de empleados con funcionalidades de comunicación y seguimiento de tareas.', 
 'active', 25000, '2025-01-15', '2025-04-15', NOW() - INTERVAL '25 days'),

-- Proyectos para InnovaTech (Carlos Rodríguez)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Carlos Rodríguez' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Plataforma E-learning', 'Sistema completo de aprendizaje online con videos, evaluaciones y certificaciones automatizadas.', 
 'active', 18000, '2025-02-01', '2025-06-01', NOW() - INTERVAL '20 days'),

-- Proyectos para Diseño Creativo (Ana Martínez)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Ana Martínez' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Rediseño Web Corporativo', 'Rediseño completo del sitio web con enfoque en UX/UI moderno y optimización SEO.', 
 'completed', 8500, '2025-01-10', '2025-02-28', NOW() - INTERVAL '18 days'),

-- Proyectos para E-commerce Pro (Roberto Silva)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Roberto Silva' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Integración Sistema Pagos', 'Implementación de múltiples métodos de pago y sistema de facturación automatizada.', 
 'active', 12000, '2025-02-15', '2025-04-30', NOW() - INTERVAL '15 days'),

-- Proyectos para Consulting Plus (Laura Fernández)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Laura Fernández' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Sistema CRM Personalizado', 'Desarrollo de CRM a medida para gestión de clientes y seguimiento de proyectos de consultoría.', 
 'active', 22000, '2025-01-20', '2025-07-20', NOW() - INTERVAL '12 days'),

-- Proyectos para Startup Vision (David López)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'David López' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'MVP Landing Page', 'Desarrollo de landing page y MVP para validación de idea de negocio.', 
 'completed', 4500, '2025-01-25', '2025-02-25', NOW() - INTERVAL '8 days'),

-- Proyectos para Fashion Trend (Carmen Ruiz)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Carmen Ruiz' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Tienda Online Fashion', 'E-commerce especializado en moda con catálogo dinámico y sistema de recomendaciones.', 
 'active', 15000, '2025-02-20', '2025-05-20', NOW() - INTERVAL '6 days'),

-- Proyectos para Food Delivery (Miguel Herrera)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Miguel Herrera' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'App Delivery v2.0', 'Actualización mayor de la aplicación con tracking en tiempo real y sistema de calificaciones.', 
 'active', 20000, '2025-03-01', '2025-06-15', NOW() - INTERVAL '4 days'),

-- Proyectos para Medical Care (Isabel Torres)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Isabel Torres' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Portal Pacientes', 'Sistema web para gestión de citas, historiales médicos y comunicación paciente-doctor.', 
 'paused', 16000, '2025-02-10', '2025-05-10', NOW() - INTERVAL '3 days'),

-- Proyectos para Real Estate Pro (Alejandro Moreno)
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Alejandro Moreno' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Portal Inmobiliario', 'Plataforma web para búsqueda avanzada de propiedades con tours virtuales y sistema de citas.', 
 'active', 28000, '2025-03-05', '2025-08-05', NOW() - INTERVAL '1 day'),

-- Proyectos adicionales completados
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'María González' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Consultoría Digital', 'Asesoramiento en transformación digital y optimización de procesos.', 
 'completed', 6000, '2024-12-01', '2025-01-15', NOW() - INTERVAL '30 days'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', (SELECT id FROM clients WHERE name = 'Carlos Rodríguez' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'), 
 'Mantenimiento Web', 'Mantenimiento y optimización de rendimiento del sitio web existente.', 
 'completed', 3500, '2024-12-15', '2025-01-30', NOW() - INTERVAL '22 days');

-- ==============================
-- INSERTAR FACTURAS
-- ==============================

INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, tax_rate, tax_amount, total_amount, status, issue_date, due_date, notes, created_at) VALUES
-- Facturas para proyectos completados
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'Ana Martínez' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'Rediseño Web Corporativo' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-001', 'Rediseño Web Corporativo - Pago Final', 'Factura final por rediseño completo del sitio web corporativo', 
 8500, 21, 1785, 10285, 'paid', '2025-02-28', '2025-03-30', 'Proyecto completado satisfactoriamente', NOW() - INTERVAL '5 days'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'David López' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'MVP Landing Page' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-002', 'MVP y Landing Page', 'Desarrollo de MVP y landing page para validación de negocio', 
 4500, 21, 945, 5445, 'paid', '2025-02-25', '2025-03-27', 'Entrega en tiempo y forma', NOW() - INTERVAL '3 days'),

-- Facturas pendientes para proyectos activos
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'María González' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'App Móvil Corporativa' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-003', 'App Móvil - Primer Pago (40%)', 'Primer pago por desarrollo de aplicación móvil corporativa', 
 10000, 21, 2100, 12100, 'sent', '2025-03-01', '2025-04-01', 'Pago correspondiente a entregable 1', NOW() - INTERVAL '2 days'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'Carlos Rodríguez' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'Plataforma E-learning' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-004', 'E-learning Platform - Avance 30%', 'Factura por avance del 30% en desarrollo de plataforma', 
 5400, 21, 1134, 6534, 'sent', '2025-03-05', '2025-04-05', 'Entregables: diseño y arquitectura', NOW() - INTERVAL '1 day'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'Roberto Silva' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'Integración Sistema Pagos' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-005', 'Integración Pagos - Fase 1', 'Primera fase de integración de sistema de pagos', 
 6000, 21, 1260, 7260, 'draft', '2025-03-08', '2025-04-08', 'Análisis e integración de pasarela principal', NOW()),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'Laura Fernández' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'Sistema CRM Personalizado' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-006', 'CRM Personalizado - Inicio', 'Factura inicial por desarrollo de CRM personalizado', 
 8800, 21, 1848, 10648, 'draft', '2025-03-10', '2025-04-10', 'Incluye análisis de requerimientos y diseño', NOW()),

-- Facturas vencidas
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'Carmen Ruiz' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'Tienda Online Fashion' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-007', 'E-commerce Fashion - Anticipo', 'Anticipo del 50% para inicio de desarrollo', 
 7500, 21, 1575, 9075, 'overdue', '2025-02-20', '2025-03-22', 'Pendiente de pago desde hace 2 semanas', NOW() - INTERVAL '14 days'),

-- Facturas recientes
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'Miguel Herrera' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'App Delivery v2.0' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-008', 'App Delivery 2.0 - Sprint 1', 'Primer sprint de desarrollo de nueva versión', 
 4000, 21, 840, 4840, 'sent', '2025-03-07', '2025-04-07', 'Features: tracking y notificaciones', NOW()),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'Alejandro Moreno' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'Portal Inmobiliario' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-009', 'Portal Inmobiliario - Planificación', 'Fase de planificación y análisis de requerimientos', 
 5600, 21, 1176, 6776, 'paid', '2025-03-05', '2025-04-05', 'Incluye wireframes y especificaciones técnicas', NOW()),

-- Facturas de mantenimiento y servicios adicionales
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM clients WHERE name = 'María González' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM projects WHERE name = 'Consultoría Digital' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'INV-2025-010', 'Consultoría Digital - Enero', 'Servicios de consultoría digital del mes de enero', 
 6000, 21, 1260, 7260, 'paid', '2025-01-31', '2025-02-28', 'Incluye auditoría y plan de mejoras', NOW() - INTERVAL '7 days');

-- ==============================
-- INSERTAR ENTRADAS DE TIEMPO (TIME TRACKING)
-- ==============================

INSERT INTO time_entries (user_id, project_id, client_id, description, duration_minutes, hourly_rate, is_billable, created_at) VALUES
-- Tiempo esta semana
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM projects WHERE name = 'App Móvil Corporativa' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM clients WHERE name = 'María González' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'Desarrollo de autenticación y login', 240, 65, true, NOW() - INTERVAL '1 day'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM projects WHERE name = 'Plataforma E-learning' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM clients WHERE name = 'Carlos Rodríguez' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'Diseño de interfaz de cursos', 180, 60, true, NOW() - INTERVAL '2 days'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM projects WHERE name = 'Portal Inmobiliario' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM clients WHERE name = 'Alejandro Moreno' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'Análisis de requerimientos funcionales', 120, 70, true, NOW() - INTERVAL '3 days'),

-- Tiempo del mes
('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM projects WHERE name = 'Sistema CRM Personalizado' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM clients WHERE name = 'Laura Fernández' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'Configuración de base de datos', 300, 75, true, NOW() - INTERVAL '7 days'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM projects WHERE name = 'App Delivery v2.0' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM clients WHERE name = 'Miguel Herrera' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'Implementación de tracking GPS', 480, 80, true, NOW() - INTERVAL '10 days'),

('e7ed7c8d-229a-42d1-8a44-37bcc64c440c', 
 (SELECT id FROM projects WHERE name = 'Tienda Online Fashion' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 (SELECT id FROM clients WHERE name = 'Carmen Ruiz' AND user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'),
 'Integración con proveedores de moda', 360, 65, true, NOW() - INTERVAL '12 days');

-- ==============================
-- VERIFICAR DATOS INSERTADOS
-- ==============================

-- Mostrar resumen de lo que se ha insertado
SELECT 'CLIENTES' as tabla, COUNT(*) as total FROM clients WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'PROYECTOS' as tabla, COUNT(*) as total FROM projects WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'FACTURAS' as tabla, COUNT(*) as total FROM invoices WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'TIEMPO' as tabla, COUNT(*) as total FROM time_entries WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

-- Mostrar desglose por estados
SELECT 'Proyectos por estado:' as info, status, COUNT(*) as cantidad 
FROM projects WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' GROUP BY status
UNION ALL
SELECT 'Facturas por estado:' as info, status, COUNT(*) as cantidad 
FROM invoices WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' GROUP BY status;

-- ==============================
-- MENSAJE FINAL
-- ==============================

DO $$
BEGIN
    RAISE NOTICE '✅ DATOS INSERTADOS CORRECTAMENTE PARA USUARIO: e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMEN:';
    RAISE NOTICE '   • 10 clientes con direcciones completas';
    RAISE NOTICE '   • 12 proyectos (8 activos, 3 completados, 1 pausado)';
    RAISE NOTICE '   • 10 facturas (4 pagadas, 4 enviadas, 2 borradores, 1 vencida)';
    RAISE NOTICE '   • 6 entradas de tiempo con tarifas por hora';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 AHORA PUEDES:';
    RAISE NOTICE '   • Ir a /dashboard para ver el resumen';
    RAISE NOTICE '   • Visitar /dashboard/clients para ver los clientes con direcciones';
    RAISE NOTICE '   • Revisar /dashboard/projects para ver los proyectos';
    RAISE NOTICE '   • Comprobar /dashboard/invoices para ver las facturas';
    RAISE NOTICE '   • Probar el nuevo formulario de clientes con campo dirección';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 ¡LISTO PARA PROBAR TU APLICACIÓN CON DATOS REALISTAS!';
END $$;
