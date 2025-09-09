-- Script completo de creación de datos con SELECT para ver resultados
-- e7ed7c8d-229a-42d1-8a44-37bcc64c440c

-- Paso 1: Crear un proyecto con cliente
WITH new_project AS (
  INSERT INTO projects (id, name, description, client_id, user_id, status, budget, start_date, end_date)
  SELECT 
    gen_random_uuid(),
    'App Fintech Mobile Avanzada',
    'Aplicación bancaria con pagos digitales, criptomonedas y IA',
    c.id,
    'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
    'active',
    75000.00,
    CURRENT_DATE - INTERVAL '90 days',
    CURRENT_DATE + INTERVAL '45 days'
  FROM clients c 
  WHERE c.user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
  LIMIT 1
  RETURNING id, name, client_id
)
SELECT 'Proyecto creado:' as resultado, name as proyecto, id as project_id, client_id FROM new_project;

-- Paso 2: Crear eventos de calendario (trabajo intensivo)
WITH project_data AS (
  SELECT p.id as project_id, p.client_id 
  FROM projects p 
  WHERE p.user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
  AND p.name = 'App Fintech Mobile Avanzada'
  LIMIT 1
),
calendar_inserts AS (
  INSERT INTO calendar_events (
    user_id, title, description, start_time, end_time, type,
    client_id, project_id, is_billable, hourly_rate, actual_revenue,
    time_tracked, status, productivity_score, efficiency_rating
  )
  SELECT 
    'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
    'Desarrollo Fintech Día ' || generate_series,
    'Sesión intensiva de desarrollo backend y frontend',
    CURRENT_TIMESTAMP - INTERVAL '90 days' + (generate_series * INTERVAL '3 days') + INTERVAL '9 hours',
    CURRENT_TIMESTAMP - INTERVAL '90 days' + (generate_series * INTERVAL '3 days') + INTERVAL '17 hours',
    'development',
    pd.client_id,
    pd.project_id,
    true,
    95.00,
    760.00,
    28800, -- 8 horas
    'completed',
    CASE WHEN generate_series % 3 = 0 THEN 10 ELSE 8 + (generate_series % 3) END,
    CASE WHEN generate_series % 2 = 0 THEN 10 ELSE 9 END
  FROM project_data pd, generate_series(1, 25) -- 25 sesiones de trabajo
  RETURNING id
)
SELECT 'Eventos creados:' as resultado, COUNT(*) as cantidad FROM calendar_inserts;

-- Paso 3: Crear tareas del proyecto
WITH project_data AS (
  SELECT p.id as project_id 
  FROM projects p 
  WHERE p.user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
  AND p.name = 'App Fintech Mobile Avanzada'
  LIMIT 1
),
task_data AS (
  VALUES 
    ('Arquitectura de Seguridad Bancaria', 'Implementación de protocolos de seguridad avanzados', 'completed', 'high', 43200, 'architecture'),
    ('API Gateway y Microservicios', 'Desarrollo de APIs RESTful y GraphQL', 'completed', 'high', 36000, 'backend'),
    ('Integración con Bancos', 'Conexión con APIs bancarias españolas', 'completed', 'medium', 28800, 'integration'),
    ('Sistema de Pagos Móviles', 'Implementación de Apple Pay y Google Pay', 'completed', 'high', 32400, 'frontend'),
    ('Dashboard Administrativo', 'Panel de control para gestión financiera', 'completed', 'medium', 25200, 'frontend'),
    ('Sistema de Notificaciones', 'Push notifications y email alerts', 'in_progress', 'medium', 18000, 'backend'),
    ('Tests Automatizados', 'Suite completa de testing', 'completed', 'high', 21600, 'testing'),
    ('Deploy y DevOps', 'CI/CD y infraestructura cloud', 'completed', 'high', 14400, 'devops'),
    ('Documentación Técnica', 'Documentación completa del proyecto', 'in_progress', 'low', 10800, 'documentation'),
    ('Análisis de Performance', 'Optimización y monitoring', 'completed', 'medium', 16200, 'optimization')
),
task_inserts AS (
  INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category)
  SELECT 
    pd.project_id,
    td.column1, -- title
    td.column2, -- description
    td.column3, -- status
    td.column4, -- priority
    'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
    CASE WHEN td.column3 = 'completed' 
         THEN CURRENT_TIMESTAMP - INTERVAL '30 days' + (random() * INTERVAL '25 days')
         ELSE NULL 
    END,
    td.column5::INTEGER, -- total_time_seconds
    td.column6 -- category
  FROM project_data pd, task_data td
  RETURNING id
)
SELECT 'Tareas creadas:' as resultado, COUNT(*) as cantidad FROM task_inserts;

-- Paso 4: Crear presupuestos
WITH client_data AS (
  SELECT c.id as client_id
  FROM clients c 
  WHERE c.user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
  LIMIT 1
),
budget_inserts AS (
  INSERT INTO budgets (user_id, client_id, title, description, status, total_amount, approved_at, sent_at, created_at)
  SELECT 
    'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
    cd.client_id,
    budget_titles.title,
    budget_titles.description,
    budget_titles.status,
    budget_titles.amount,
    CASE WHEN budget_titles.status = 'sent' 
         THEN CURRENT_TIMESTAMP - INTERVAL '60 days' + (random() * INTERVAL '20 days')
         ELSE NULL 
    END,
    CURRENT_TIMESTAMP - INTERVAL '70 days' + (random() * INTERVAL '10 days'),
    CURRENT_TIMESTAMP - INTERVAL '75 days' + (random() * INTERVAL '5 days')
  FROM client_data cd,
  (VALUES 
    ('Fintech MVP Completo', 'Aplicación móvil bancaria básica', 'sent', 45000.00),
    ('Módulo de Criptomonedas', 'Integración con exchanges crypto', 'sent', 25000.00),
    ('Sistema de Analytics', 'Dashboard de métricas financieras', 'draft', 15000.00),
    ('App Versión Premium', 'Funcionalidades avanzadas de trading', 'draft', 35000.00)
  ) AS budget_titles(title, description, status, amount)
  RETURNING id
)
SELECT 'Presupuestos creados:' as resultado, COUNT(*) as cantidad FROM budget_inserts;

-- Paso 5: Crear facturas
WITH project_client_data AS (
  SELECT p.id as project_id, p.client_id, p.user_id
  FROM projects p 
  WHERE p.user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
  AND p.name = 'App Fintech Mobile Avanzada'
  LIMIT 1
),
invoice_inserts AS (
  INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, total_amount, status, issue_date, due_date, paid_date)
  SELECT 
    pcd.user_id,
    pcd.client_id,
    pcd.project_id,
    'FINTECH-' || LPAD(generate_series::text, 3, '0'),
    'Factura Fintech ' || generate_series,
    'Desarrollo aplicación fintech - Fase ' || generate_series,
    15000.00,
    15000.00,
    CASE WHEN generate_series <= 2 THEN 'paid' ELSE 'sent' END,
    CURRENT_DATE - INTERVAL '60 days' + (generate_series * INTERVAL '15 days'),
    CURRENT_DATE - INTERVAL '45 days' + (generate_series * INTERVAL '15 days'),
    CASE WHEN generate_series <= 2 
         THEN CURRENT_DATE - INTERVAL '40 days' + (generate_series * INTERVAL '15 days')
         ELSE NULL 
    END
  FROM project_client_data pcd, generate_series(1, 3)
  RETURNING id
)
SELECT 'Facturas creadas:' as resultado, COUNT(*) as cantidad FROM invoice_inserts;

-- Verificación final
SELECT 'RESUMEN FINAL:' as tipo, '' as detalle
UNION ALL
SELECT 'Clientes totales:', COUNT(*)::text FROM clients WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Proyectos totales:', COUNT(*)::text FROM projects WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Eventos calendario:', COUNT(*)::text FROM calendar_events WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Tareas totales:', COUNT(*)::text FROM tasks WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Presupuestos totales:', COUNT(*)::text FROM budgets WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
UNION ALL
SELECT 'Facturas totales:', COUNT(*)::text FROM invoices WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
