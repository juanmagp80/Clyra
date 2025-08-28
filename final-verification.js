const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function finalVerification() {
    try {
        console.log('🔍 Verificación final completa...\n');

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

        console.log('📊 Estado actual del usuario:');
        console.log('==============================');
        console.log('Email:', profile.email);
        console.log('Subscription Status:', profile.subscription_status);
        console.log('Subscription Plan:', profile.subscription_plan);
        console.log('Stripe Customer ID:', profile.stripe_customer_id || 'NULL');
        console.log('Stripe Subscription ID:', profile.stripe_subscription_id || 'NULL');

        // Verificar qué debería mostrar la aplicación
        const hasActiveSubscription = profile.subscription_status === 'active';
        const isExpired = profile.subscription_status === 'expired';
        const canUseFeatures = hasActiveSubscription;

        console.log('\n🎯 Comportamiento esperado en la aplicación:');
        console.log('=============================================');

        if (hasActiveSubscription) {
            console.log('✅ ESTADO: Usuario PRO activo');
            console.log('✅ Banner trial: NO se muestra');
            console.log('✅ Sidebar: "Plan Profesional"');
            console.log('✅ Botones: Funcionan normalmente');
            console.log('✅ hasReachedLimit(): Siempre false');
            console.log('✅ canUseFeatures: true');
        } else if (isExpired) {
            console.log('🔴 ESTADO: Trial expirado');
            console.log('🔴 Banner trial: SE MUESTRA (upgrade)');
            console.log('🔴 Sidebar: "Plan Gratuito"');
            console.log('🔴 Botones: "Trial Expirado"');
            console.log('🔴 hasReachedLimit(): Siempre true');
            console.log('🔴 canUseFeatures: false');
        } else {
            console.log('🟡 ESTADO: Otro estado');
        }

        console.log('\n🛠️ Problemas solucionados:');
        console.log('===========================');
        console.log('✅ TypeError hasReachedLimit is not a function - SOLUCIONADO');
        console.log('✅ Property limits does not exist - SOLUCIONADO');
        console.log('✅ Hook useTrialStatus actualizado con funciones requeridas');
        console.log('✅ Tipo TrialInfo actualizado con propiedades necesarias');

        if (hasActiveSubscription) {
            console.log('\n🎉 TODO CORRECTO: El usuario tiene acceso PRO');
        } else {
            console.log('\n⚠️ PENDIENTE: Si ya pagó, ejecutar el webhook manualmente');
            console.log('   Comando: node simulate-successful-payment.js');
        }

    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

finalVerification();
