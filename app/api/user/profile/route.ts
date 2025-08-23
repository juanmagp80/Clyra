import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('👤 Getting user profile...');

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    const supabaseAdmin = createSupabaseAdmin();
    
    let profile;
    let profileError;

    if (email) {
      // Buscar por email usando admin client
      console.log('🔍 Fetching profile by email:', email);
      const result = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      profile = result.data;
      profileError = result.error;
    } else {
      // Buscar por usuario autenticado (método original)
      const { createServerSupabaseClient } = await import('@/src/lib/supabase-server');
      const supabase = await createServerSupabaseClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ No authenticated user:', authError);
        return NextResponse.json(
          { error: 'Usuario no autenticado y no se proporcionó email' },
          { status: 401 }
        );
      }

      console.log('🔍 Fetching profile for authenticated user:', user.id);

      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
    }

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Profile not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Error obteniendo perfil', details: profileError },
        { status: 500 }
      );
    }

    console.log('✅ Profile found:', { 
      email: profile.email, 
      plan: profile.subscription_plan, 
      status: profile.subscription_status 
    });
    
    return NextResponse.json({
      success: true,
      profile: profile
    });
    
  } catch (error) {
    console.error('💥 Error general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error },
      { status: 500 }
    );
  }
}
