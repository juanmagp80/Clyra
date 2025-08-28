// Script para simular la actualización de suscripción después del pago
// Ejecuta este script para marcar tu usuario como PRO

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.8yajSVnLGwmwCz2S0SZ3Xkbfb8PlLHX7AUC_6Gd_7zU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSubscriptionToPro() {
    console.log('🔄 Actualizando suscripción a PRO...');

    const userEmail = 'amazonjgp80@gmail.com'; // Cambia por tu email si es diferente

    try {
        // Primero, buscar el usuario en auth.users por email
        const { data: authUsers, error: authError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', userEmail);

        if (authError) {
            console.error('❌ Error buscando usuario en auth:', authError);
            return;
        }

        if (!authUsers || authUsers.length === 0) {
            console.error('❌ No se encontró usuario autenticado con email:', userEmail);
            return;
        }

        const userId = authUsers[0].id;
        console.log('✅ Usuario encontrado:', userId);

        // Actualizar el perfil a PRO con suscripción activa
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'active',
                subscription_plan: 'pro',
                subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                updated_at: new Date().toISOString()
            })
            .eq('email', userEmail)
            .select();

        if (error) {
            console.error('❌ Error actualizando suscripción:', error);
        } else if (data && data.length > 0) {
            console.log('✅ Suscripción actualizada exitosamente a PRO');
            console.log('📊 Datos actualizados:', data[0]);
            console.log('🎉 Ya puedes recargar la página y verás tu estado PRO!');
        } else {
            console.log('⚠️ No se encontró el perfil. Creando perfil...');

            // Si no existe, crear el perfil
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: userId, // Usar el ID del usuario autenticado
                    email: userEmail,
                    subscription_status: 'active',
                    subscription_plan: 'pro',
                    subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    trial_started_at: new Date().toISOString(),
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select();

            if (createError) {
                console.error('❌ Error creando perfil:', createError);
            } else {
                console.log('✅ Perfil PRO creado exitosamente:', newProfile);
                console.log('🎉 Ya puedes recargar la página y verás tu estado PRO!');
            }
        }

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

updateSubscriptionToPro();
