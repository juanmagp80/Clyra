-- Setup simplificado y directo para amazonjgp80@gmail.com
-- Este script asegura que aparezca el banner inmediatamente

-- Primero, buscar el ID del usuario
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Obtener ID del usuario
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'amazonjgp80@gmail.com';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario amazonjgp80@gmail.com no encontrado';
    END IF;
    
    RAISE NOTICE 'Usuario encontrado: %', target_user_id;
    
    -- Eliminar datos existentes para empezar limpio
    DELETE FROM trial_activities WHERE user_id = target_user_id;
    DELETE FROM user_usage WHERE user_id = target_user_id;
    DELETE FROM profiles WHERE id = target_user_id;
    
    -- Crear perfil con trial activo
    INSERT INTO profiles (
        id,
        email,
        subscription_status,
        subscription_plan,
        trial_started_at,
        trial_ends_at,
        created_at,
        updated_at
    ) VALUES (
        target_user_id,
        'amazonjgp80@gmail.com',
        'trial',
        'free',
        NOW(),
        NOW() + INTERVAL '14 days',
        NOW(),
        NOW()
    );
    
    -- Crear registro de uso inicial
    INSERT INTO user_usage (
        user_id,
        clients_count,
        projects_count,
        storage_used_mb,
        emails_sent_month,
        created_at,
        updated_at
    ) VALUES (
        target_user_id,
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
    );
    
    -- Registrar actividad de trial
    INSERT INTO trial_activities (
        user_id,
        activity_type,
        activity_data,
        created_at
    ) VALUES (
        target_user_id,
        'trial_started',
        jsonb_build_object(
            'source', 'manual_setup_clean',
            'email', 'amazonjgp80@gmail.com',
            'trial_days', 14
        ),
        NOW()
    );
    
    RAISE NOTICE 'Trial configurado exitosamente para amazonjgp80@gmail.com';
    RAISE NOTICE 'Estado: trial activo con 14 días restantes';
    
END $$;

-- Verificar que todo está correcto
SELECT 
    'Verificación final' as status,
    p.subscription_status,
    p.subscription_plan,
    EXTRACT(days FROM (p.trial_ends_at - NOW()))::INTEGER as days_remaining,
    u.clients_count,
    u.projects_count
FROM profiles p
LEFT JOIN user_usage u ON p.id = u.user_id
WHERE p.email = 'amazonjgp80@gmail.com';
