const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTrialBannerLogic() {
    try {
        console.log('🐛 Debug: ¿Por qué sigue apareciendo el TrialBanner?\n');
        
        // Consultar el estado actual
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'amazonjgp80@gmail.com')
            .single();

        if (error) {
            console.error('❌ Error al consultar el perfil:', error);
            return;
        }

        console.log('📊 Datos raw de la base de datos:');
        console.log('=================================');
        console.log('subscription_status:', profile.subscription_status);
        console.log('subscription_plan:', profile.subscription_plan);
        console.log('subscription_current_period_end:', profile.subscription_current_period_end);
        
        // Simular la lógica del hook useTrialStatus
        const hasActiveSubscription =
            (profile?.subscription_status === 'active') && (
                !profile?.subscription_current_period_end ||
                new Date(profile.subscription_current_period_end) > new Date()
            );

        const now = new Date();
        const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
        const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

        const isExpired = (profile?.subscription_status === 'trial' && daysRemaining <= 0) || 
                         (profile?.subscription_status === 'expired');

        const canUseFeatures = hasActiveSubscription || (!isExpired && (profile?.subscription_status === 'trial'));

        console.log('\n🧮 Lógica calculada (simulando useTrialStatus):');
        console.log('===============================================');
        console.log('hasActiveSubscription:', hasActiveSubscription);
        console.log('isExpired:', isExpired);
        console.log('canUseFeatures:', canUseFeatures);
        console.log('status:', profile?.subscription_status);
        console.log('daysRemaining:', daysRemaining);

        console.log('\n🎯 Lógica del TrialBanner:');
        console.log('==========================');
        console.log('Condición: status === "active" ||', profile?.subscription_status === 'active');
        console.log('Condición: canUseFeatures ||', canUseFeatures);
        console.log('Resultado final: shouldHideBanner =', 
            profile?.subscription_status === 'active' || canUseFeatures);

        if (profile?.subscription_status === 'active' || canUseFeatures) {
            console.log('\n✅ CORRECTO: El banner NO debería mostrarse');
        } else {
            console.log('\n❌ PROBLEMA: El banner SÍ se está mostrando cuando no debería');
        }

        console.log('\n🔍 Posibles causas si sigue apareciendo:');
        console.log('========================================');
        console.log('1. Cache del navegador - Hacer hard refresh (Ctrl+Shift+R)');
        console.log('2. El userEmail no se está pasando correctamente al TrialBanner');
        console.log('3. El componente no se está re-renderizando después del cambio');
        console.log('4. Error en el hook useTrialStatus en el frontend');

        console.log('\n💡 Soluciones a probar:');
        console.log('=======================');
        console.log('1. Hard refresh de la página (Ctrl+Shift+R)');
        console.log('2. Logout y login de nuevo');
        console.log('3. Limpiar cookies y localStorage');
        console.log('4. Verificar que userEmail se pasa correctamente al TrialBanner');
        
    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

debugTrialBannerLogic();
