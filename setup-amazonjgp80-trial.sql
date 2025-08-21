-- Configurar trial para amazonjgp80@gmail.com

DO $$
DECLARE
    user_email TEXT := 'amazonjgp80@gmail.com';
    target_user_id UUID;
    trial_start TIMESTAMP WITH TIME ZONE := NOW();
    trial_end TIMESTAMP WITH TIME ZONE := NOW() + INTERVAL '14 days';
BEGIN
    -- Buscar el usuario por email en auth.users
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'Usuario con email % no encontrado', user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuario encontrado: %', target_user_id;
    
    -- Crear o actualizar perfil
    INSERT INTO profiles (
        id, 
        email, 
        subscription_status, 
        subscription_plan, 
        trial_started_at, 
        trial_ends_at,
        created_at
    ) VALUES (
        target_user_id,
        user_email,
        'trial',
        'free',
        trial_start,
        trial_end,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        subscription_status = 'trial',
        subscription_plan = 'free',
        trial_started_at = COALESCE(profiles.trial_started_at, trial_start),
        trial_ends_at = CASE 
            WHEN profiles.trial_ends_at IS NULL THEN trial_end
            ELSE profiles.trial_ends_at
        END,
        updated_at = NOW();
    
    RAISE NOTICE 'Perfil actualizado para usuario %', target_user_id;
    
    -- Crear registro de uso si no existe
    INSERT INTO user_usage (
        user_id,
        clients_count,
        projects_count,
        storage_used_mb,
        emails_sent_month
    ) VALUES (
        target_user_id,
        0,
        0,
        0,
        0
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Registro de uso creado para usuario %', target_user_id;
    
    -- Registrar actividad
    INSERT INTO trial_activities (
        user_id,
        activity_type,
        activity_data
    ) VALUES (
        target_user_id,
        'trial_setup',
        jsonb_build_object(
            'source', 'manual_setup_oauth',
            'email', user_email,
            'trial_days', 14,
            'setup_date', NOW()
        )
    );
    
    RAISE NOTICE 'Actividad registrada para usuario %', target_user_id;
    
    -- Mostrar estado final
    RAISE NOTICE 'Trial configurado exitosamente:';
    RAISE NOTICE '- Usuario: % (%)', user_email, target_user_id;
    RAISE NOTICE '- Trial inicia: %', trial_start;
    RAISE NOTICE '- Trial termina: %', trial_end;
    RAISE NOTICE '- Días restantes: %', EXTRACT(days FROM (trial_end - NOW()));
    
END $$;
