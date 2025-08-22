-- Script para verificar si las tablas y funciones del sistema de comunicación existen

-- Verificar si existe la tabla client_tokens
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'client_tokens'
        ) 
        THEN 'client_tokens: ✅ Existe'
        ELSE 'client_tokens: ❌ No existe'
    END as status;

-- Verificar si existe la tabla client_messages
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'client_messages'
        ) 
        THEN 'client_messages: ✅ Existe'
        ELSE 'client_messages: ❌ No existe'
    END as status;

-- Verificar si existe la tabla client_notifications
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'client_notifications'
        ) 
        THEN 'client_notifications: ✅ Existe'
        ELSE 'client_notifications: ❌ No existe'
    END as status;

-- Verificar si existe la función generate_client_token
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'generate_client_token'
        ) 
        THEN 'generate_client_token: ✅ Existe'
        ELSE 'generate_client_token: ❌ No existe'
    END as status;

-- Verificar si existe la función validate_client_token
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'validate_client_token'
        ) 
        THEN 'validate_client_token: ✅ Existe'
        ELSE 'validate_client_token: ❌ No existe'
    END as status;
