const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Necesitamos usar la clave de servicio para operaciones administrativas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createUserSubscriptionsTable() {
  try {
    console.log('🔧 Creando tabla user_subscriptions...');
    
    // Verificar si la tabla ya existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_subscriptions');

    if (tablesError) {
      console.error('Error verificando tablas:', tablesError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ La tabla user_subscriptions ya existe');
      
      // Verificar estructura
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .limit(1);
        
      if (!error) {
        console.log('✅ Tabla accesible y funcionando');
        return;
      }
    }

    console.log('❌ La tabla no existe o no es accesible. Necesitas crearla manualmente en Supabase.');
    console.log('');
    console.log('📋 SQL para ejecutar en Supabase Dashboard -> SQL Editor:');
    console.log('');
    console.log(`
-- Crear tabla user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'trial', 'pro')),
    trial_end TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);

-- Habilitar RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY "Users can manage their own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);
    `);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createUserSubscriptionsTable();
