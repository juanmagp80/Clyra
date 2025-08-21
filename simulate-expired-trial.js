const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function simulateExpiredTrial() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log('❌ No hay usuario autenticado');
        return;
    }

    console.log('🔴 Simulando trial expirado...');

    const expiredEnd = new Date();
    expiredEnd.setDate(expiredEnd.getDate() - 1); // Ayer

    await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            trial_ends_at: expiredEnd.toISOString(),
            subscription_status: 'trial'
        });

    console.log('✅ Trial configurado: EXPIRADO');
    console.log('🔄 Recarga /dashboard - el banner debe ser ROJO con "¡Trial expirado!"');
}

simulateExpiredTrial();
