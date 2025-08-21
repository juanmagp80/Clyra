import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Verificar el estado de la suscripción usando la nueva función
    const { data: subscriptionCheck, error: checkError } = await supabase
      .rpc('check_user_subscription', {
        user_email: userEmail
      });

    if (checkError) {
      console.error('Error checking subscription:', checkError);
      return NextResponse.json(
        { error: 'Error checking subscription: ' + checkError.message },
        { status: 500 }
      );
    }

    // También obtener datos directos de la tabla
    const { data: directSubscription, error: directError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        status,
        current_period_start,
        current_period_end,
        stripe_subscription_id
      `)
      .eq('user_id', subscriptionCheck.user_id)
      .single();

    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    return NextResponse.json({
      success: true,
      userEmail,
      subscriptionCheck,
      directSubscription,
      userData,
      directError: directError?.message || null,
      userError: userError?.message || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in debug-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
