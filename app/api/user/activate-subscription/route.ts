import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 Activating subscription for authenticated user...');

        const supabase = await createServerSupabaseClient();
        
        // Obtener el usuario autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ No authenticated user:', authError);
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        console.log('👤 Authenticated user:', { id: user.id, email: user.email });

        const profileData = {
            subscription_status: 'active',
            subscription_plan: 'pro',
            stripe_customer_id: `cus_real_${user.id.substring(0, 8)}`,
            stripe_subscription_id: `sub_real_${user.id.substring(0, 8)}`,
            subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            trial_started_at: new Date().toISOString(),
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        };

        // Verificar si ya existe un perfil
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        let result;
        if (existingProfile) {
            console.log('🔄 Updating existing profile...');
            // Actualizar perfil existente
            const { data, error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', user.id)
                .select()
                .single();

            result = { data, error };
        } else {
            console.log('✨ Creating new profile...');
            // Crear nuevo perfil
            const { data, error } = await supabase
                .from('profiles')
                .insert([{
                    id: user.id,
                    email: user.email,
                    ...profileData,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            result = { data, error };
        }

        if (result.error) {
            console.error('❌ Error saving profile:', result.error);
            return NextResponse.json(
                { error: 'Error guardando perfil', details: result.error },
                { status: 500 }
            );
        }

        console.log('✅ Profile saved successfully:', result.data);
        
        return NextResponse.json({
            success: true,
            message: 'Suscripción PRO activada exitosamente',
            profile: result.data
        });
        
    } catch (error) {
        console.error('💥 Error general:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error },
            { status: 500 }
        );
    }
}
