-- SQL mínimo para solucionar el error 406 de subscription_plans
-- Ejecuta esto en Supabase > SQL Editor

-- Crear tabla subscription_plans básica
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    max_clients INTEGER DEFAULT 10,
    max_projects INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 1,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
DROP POLICY IF EXISTS "Everyone can view plans" ON subscription_plans;
CREATE POLICY "Everyone can view plans" ON subscription_plans
    FOR SELECT USING (true);

-- Insertar planes básicos
INSERT INTO subscription_plans (name, max_clients, max_projects, max_storage_gb, price_monthly, features)
VALUES 
    ('Free', 5, 5, 1, 0, '["Básico", "5 clientes", "5 proyectos"]'),
    ('Pro', 50, 50, 10, 9.99, '["Todo de Free", "50 clientes", "50 proyectos", "10GB storage"]'),
    ('Premium', 500, 500, 100, 29.99, '["Todo de Pro", "500 clientes", "500 proyectos", "100GB storage"]')
ON CONFLICT (name) DO NOTHING;

-- Verificar que se creó correctamente
SELECT * FROM subscription_plans;
