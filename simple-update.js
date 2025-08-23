// Script simple para actualizar suscripción
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.8yajSVnLGwmwCz2S0SZ3Xkbfb8PlLHX7AUC_6Gd_7zU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateToPro() {
    console.log('🔄 Iniciando actualización...');
    
    const userEmail = 'amazonjgp80@gmail.com';
    
    try {
        // Primero ver qué perfiles existen
        console.log('📋 Consultando perfiles existentes...');
        const { data: allProfiles, error: listError } = await supabase
            .from('profiles')
            .select('*');
            
        if (listError) {
            console.error('❌ Error listando perfiles:', listError);
            return;
        }
        
        console.log('📊 Perfiles encontrados:', allProfiles?.length || 0);
        if (allProfiles) {
            allProfiles.forEach(profile => {
                console.log(`   - ${profile.email} (${profile.subscription_status}/${profile.subscription_plan})`);
            });
        }
        
        // Buscar perfil específico por email
        const userProfile = allProfiles?.find(p => p.email === userEmail);
        
        if (userProfile) {
            console.log('👤 Perfil encontrado, actualizando...');
            const { data: updated, error: updateError } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'active',
                    subscription_plan: 'pro',
                    subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', userProfile.id)
                .select();
                
            if (updateError) {
                console.error('❌ Error actualizando:', updateError);
            } else {
                console.log('✅ ¡Actualización exitosa!');
                console.log('🎉 Datos actualizados:', updated[0]);
            }
        } else {
            console.log('⚠️ Perfil no encontrado para:', userEmail);
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    }
    
    console.log('✨ Proceso completado');
}

updateToPro();
