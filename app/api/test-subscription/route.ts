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

    // Usar el service role key para operaciones administrativas
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
    
    // Buscar el usuario por email en la tabla auth.users
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      
      // Si no encuentra en auth.users, intentar una consulta diferente
      // Crear suscripción con un ID temporal basado en el email
      const tempUserId = Buffer.from(userEmail).toString('base64').substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');
      
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: tempUserId, // ID temporal
          stripe_customer_id: 'cus_test_manual',
          stripe_subscription_id: 'sub_test_manual_' + Date.now(),
          status: 'active',
          price_id: 'price_test_12eur',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
        })
        .select();

      if (subError) {
        console.error('Error creating temp subscription:', subError);
        return NextResponse.json(
          { error: 'Error creating temp subscription: ' + subError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        subscription,
        message: 'Test subscription created with temporary user ID',
        note: 'User not found in auth.users, using temporary ID'
      });
    }

    // Si encuentra el usuario, crear la suscripción normalmente
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userData.id,
        stripe_customer_id: 'cus_test_manual',
        stripe_subscription_id: 'sub_test_manual_' + Date.now(),
        status: 'active',
        price_id: 'price_test_12eur',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
      })
      .select();

    if (subError) {
      console.error('Error creating subscription:', subError);
      return NextResponse.json(
        { error: 'Error creating subscription: ' + subError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      subscription,
      user: userData,
      message: 'Test subscription created successfully'
    });

  } catch (error) {
    console.error('Error in test-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
