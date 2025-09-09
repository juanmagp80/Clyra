    -- Verificar si los datos se crearon correctamente para tu usuario
    -- e7ed7c8d-229a-42d1-8a44-37bcc64c440c

    -- 1. Verificar eventos de calendario
    SELECT 
        'calendar_events' as tabla,
        COUNT(*) as cantidad,
        MIN(start_time) as primer_evento,
        MAX(start_time) as ultimo_evento,
        SUM(time_tracked)/3600 as horas_totales,
        SUM(actual_revenue) as ingresos_totales
    FROM calendar_events 
    WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
    AND start_time >= CURRENT_DATE - INTERVAL '90 days';

    -- 2. Verificar tareas
    SELECT 
        'tasks' as tabla,
        COUNT(*) as cantidad,
        SUM(total_time_seconds)/3600 as horas_totales
    FROM tasks 
    WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
    AND status = 'completed'
    AND completed_at >= CURRENT_DATE - INTERVAL '90 days';

    -- 3. Verificar facturas
    SELECT 
        'invoices' as tabla,
        COUNT(*) as cantidad,
        SUM(total_amount) as total_facturado,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as pagadas
    FROM invoices 
    WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

    -- 4. Verificar presupuestos
    SELECT 
        'budgets' as tabla,
        COUNT(*) as cantidad,
        SUM(total_amount) as total_presupuestado,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprobados
    FROM budgets 
    WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

    -- 5. Verificar clientes
    SELECT 
        'clients' as tabla,
        COUNT(*) as cantidad,
        string_agg(name, ', ') as nombres_clientes
    FROM clients 
    WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

    -- 6. Verificar mensajes
    SELECT 
        'client_messages' as tabla,
        COUNT(*) as cantidad,
        COUNT(CASE WHEN sender_type = 'client' THEN 1 END) as de_cliente,
        COUNT(CASE WHEN sender_type = 'freelancer' THEN 1 END) as de_freelancer
    FROM client_messages cm
    JOIN clients c ON cm.client_id = c.id
    WHERE c.user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
