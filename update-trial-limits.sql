-- Actualizar límites del trial para ser ilimitados durante 14 días

UPDATE subscription_plans 
SET 
    max_clients = -1,     -- -1 significa ilimitado
    max_projects = -1,    -- -1 significa ilimitado  
    max_storage_gb = -1,  -- -1 significa ilimitado
    features = jsonb_build_object(
        'trial_days', 14,
        'unlimited_during_trial', true,
        'support', 'email',
        'unlimited_clients', true,
        'unlimited_projects', true,
        'unlimited_storage', true,
        'all_features', true
    )
WHERE name = 'Trial Gratuito';

-- Verificar la actualización
SELECT 
    'Plan actualizado' as status,
    name,
    max_clients,
    max_projects, 
    max_storage_gb,
    features
FROM subscription_plans 
WHERE name = 'Trial Gratuito';
