const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testTrialStates() {
    console.log('🧪 SIMULANDO DIFERENTES ESTADOS DEL TRIAL\n');

    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log('❌ No hay usuario autenticado. Inicia sesión primero.');
        return;
    }

    console.log(`👤 Usuario: ${user.email}`);

    // 1. Estado normal (14 días)
    console.log('\n🟦 1. Configurando trial normal (14 días)...');
    const normalEnd = new Date();
    normalEnd.setDate(normalEnd.getDate() + 14);

    await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            trial_started_at: new Date().toISOString(),
            trial_ends_at: normalEnd.toISOString(),
            subscription_status: 'trial',
            subscription_plan: 'free'
        });
    console.log('✅ Trial configurado: 14 días');

    // 2. Estado crítico (2 días)
    console.log('\n🟠 2. Para probar estado crítico (2 días), usa:');
    console.log('   - Ve al navegador y recarga /dashboard');
    console.log('   - Banner debe ser AZUL con "14 días restantes"');

    console.log('\n🟠 Ejecuta este comando para simular 2 días restantes:');
    console.log('   node simulate-critical-trial.js');

    // 3. Estado expirado
    console.log('\n🔴 3. Para probar estado expirado, usa:');
    console.log('   node simulate-expired-trial.js');

    console.log('\n🎯 ESTADOS A PROBAR:');
    console.log('✅ Normal (14 días): Banner AZUL');
    console.log('⚠️  Crítico (≤3 días): Banner NARANJA/ROJO');
    console.log('❌ Expirado (0 días): Banner ROJO + "¡Trial expirado!"');

    console.log('\n🚀 Ve a http://localhost:3000/dashboard y verifica el banner!');
}

testTrialStates();
