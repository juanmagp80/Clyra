-- SCRIPT PARA INSERTAR CLIENTES DE EJEMPLO
-- Ejecutar solo si no tienes clientes en tu base de datos

-- Verificar si el usuario actual tiene clientes
-- Si no los tiene, insertar algunos de ejemplo

DO $$
DECLARE
    current_user_id UUID;
    client_count INTEGER;
    client1_id UUID;
    client2_id UUID;
    client3_id UUID;
BEGIN
    -- Obtener el ID del usuario autenticado
    SELECT auth.uid() INTO current_user_id;
    
    -- Verificar si el usuario tiene clientes
    SELECT COUNT(*) INTO client_count 
    FROM clients 
    WHERE user_id = current_user_id;
    
    -- Solo insertar si no hay clientes
    IF client_count = 0 THEN
        -- Insertar clientes de ejemplo
        INSERT INTO clients (user_id, name, company, email, phone) VALUES
        (current_user_id, 'María González', 'TechStart SL', 'maria@techstart.com', '+34 600 123 456'),
        (current_user_id, 'Carlos Rodríguez', 'Innovate Corp', 'carlos@innovate.com', '+34 650 789 012'),
        (current_user_id, 'Ana Martínez', 'Digital Solutions', 'ana@digitalsol.com', '+34 700 345 678')
        RETURNING id INTO client1_id;
        
        -- Mensaje de confirmación
        RAISE NOTICE 'Se han insertado % clientes de ejemplo para el usuario %', 3, current_user_id;
        RAISE NOTICE 'Ahora puedes generar tokens de comunicación para estos clientes.';
    ELSE
        RAISE NOTICE 'El usuario ya tiene % clientes. No se insertarán ejemplos.', client_count;
    END IF;
END $$;

-- Mostrar todos los clientes del usuario actual
SELECT 
    name as "Nombre",
    company as "Empresa",
    email as "Email",
    phone as "Teléfono",
    created_at as "Creado"
FROM clients 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
