#!/bin/bash

# Script para configurar el trial de un usuario OAuth existente

echo "🚀 Configurando trial para usuario OAuth..."

# Obtener las variables de entorno
source .env.local 2>/dev/null || echo "No se encontró .env.local"

# Verificar que las variables estén configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Variables de Supabase no configuradas"
    echo "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    exit 1
fi

echo "✅ Variables de Supabase configuradas"

# Crear script SQL temporal
cat > temp_setup_trial.sql << 'EOF'
-- Insertar usuario con trial si no existe
-- Reemplaza 'EMAIL_DEL_USUARIO' con el email real del usuario

DO $$
DECLARE
    user_email TEXT := 'EMAIL_PLACEHOLDER';  -- Cambiar por el email real
    user_id UUID;
    trial_start TIMESTAMP WITH TIME ZONE := NOW();
    trial_end TIMESTAMP WITH TIME ZONE := NOW() + INTERVAL '14 days';
BEGIN
    -- Buscar el usuario por email en auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'Usuario con email % no encontrado', user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuario encontrado: %', user_id;
    
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
        user_id,
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
    
    RAISE NOTICE 'Perfil actualizado para usuario %', user_id;
    
    -- Crear registro de uso si no existe
    INSERT INTO user_usage (
        user_id,
        clients_count,
        projects_count,
        storage_used_mb,
        emails_sent_month
    ) VALUES (
        user_id,
        0,
        0,
        0,
        0
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Registro de uso creado para usuario %', user_id;
    
    -- Registrar actividad
    INSERT INTO trial_activities (
        user_id,
        activity_type,
        activity_data
    ) VALUES (
        user_id,
        'trial_setup',
        jsonb_build_object(
            'source', 'manual_setup',
            'trial_days', 14,
            'setup_date', NOW()
        )
    );
    
    RAISE NOTICE 'Actividad registrada para usuario %', user_id;
    
    -- Mostrar estado final
    RAISE NOTICE 'Trial configurado exitosamente:';
    RAISE NOTICE '- Usuario: % (%)', user_email, user_id;
    RAISE NOTICE '- Trial inicia: %', trial_start;
    RAISE NOTICE '- Trial termina: %', trial_end;
    RAISE NOTICE '- Días restantes: %', EXTRACT(days FROM (trial_end - NOW()));
    
END $$;
EOF

echo ""
echo "📧 Ingresa el email del usuario que se registró con Google OAuth:"
read -p "Email: " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Error: Email no puede estar vacío"
    rm -f temp_setup_trial.sql
    exit 1
fi

# Reemplazar placeholder con email real
sed -i "s/EMAIL_PLACEHOLDER/$USER_EMAIL/g" temp_setup_trial.sql

echo ""
echo "🔄 Configurando trial para $USER_EMAIL..."

# Ejecutar el script SQL usando psql o mostrar instrucciones
echo ""
echo "📋 Opciones para ejecutar:"
echo ""
echo "1. Si tienes psql instalado y configurado:"
echo "   psql '$NEXT_PUBLIC_SUPABASE_URL' -f temp_setup_trial.sql"
echo ""
echo "2. Copia y pega el siguiente SQL en el SQL Editor de Supabase:"
echo "   https://app.supabase.com/project/[tu-proyecto]/sql"
echo ""
echo "========== SQL PARA COPIAR =========="
cat temp_setup_trial.sql
echo "===================================="
echo ""

# Limpiar archivo temporal
rm -f temp_setup_trial.sql

echo "✅ Script generado. Después de ejecutar el SQL, el banner de trial debería aparecer."
echo ""
echo "🔄 Para verificar, reinicia el servidor de desarrollo:"
echo "   npm run dev"
