const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listUsers() {
    console.log('👥 USUARIOS REGISTRADOS:\n');

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email, full_name, subscription_status, trial_ends_at')
        .limit(10);

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('📝 No hay usuarios registrados aún');
        console.log('💡 Ve a http://localhost:3000 y regístrate primero');
        return;
    }

    profiles.forEach((profile, index) => {
        const trialStatus = profile.subscription_status || 'sin configurar';
        const trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleDateString() : 'No configurado';

        console.log(`${index + 1}. 📧 ${profile.email || 'Sin email'}`);
        console.log(`   👤 ${profile.full_name || 'Sin nombre'}`);
        console.log(`   🎯 Estado: ${trialStatus}`);
        console.log(`   📅 Trial expira: ${trialEnd}`);
        console.log('   ---');
    });

    console.log('\n🚀 Para configurar trial a cualquier usuario:');
    console.log('   node setup-trial-by-email.js');
}

listUsers();
