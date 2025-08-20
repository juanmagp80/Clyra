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
    
    // Ejecutar SQL directamente para crear la suscripción
    const sqlQuery = `
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        status,
        price_id,
        current_period_start,
        current_period_end,
        cancel_at_period_end
      )
      SELECT 
        id as user_id,
        'cus_test_manual' as stripe_customer_id,
        'sub_test_manual_${Date.now()}' as stripe_subscription_id,
        'active' as status,
        'price_test_12eur' as price_id,
        NOW() as current_period_start,
        NOW() + INTERVAL '1 month' as current_period_end,
        false as cancel_at_period_end
      FROM auth.users 
      WHERE email = $1
      ON CONFLICT (stripe_subscription_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        current_period_end = EXCLUDED.current_period_end
      RETURNING *;
    `;

    const { data: subscription, error: subError } = await supabase.rpc('exec_sql', {
      sql_query: sqlQuery,
      params: [userEmail]
    });

    if (subError) {
      console.error('Error with SQL query, trying alternative approach:', subError);
      
      // Enfoque alternativo: usar una función SQL personalizada
      const { data: result, error: funcError } = await supabase
        .rpc('create_test_subscription', {
          user_email: userEmail
        });

      if (funcError) {
        console.error('Error with function approach:', funcError);
        return NextResponse.json(
          { error: 'Could not create subscription. Make sure the SQL functions are created in Supabase.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        result,
        message: 'Test subscription created via function',
        instruction: 'Please refresh your dashboard to see the changes'
      });
    }

    return NextResponse.json({ 
      success: true, 
      subscription,
      message: 'Test subscription created successfully via SQL',
      instruction: 'Please refresh your dashboard to see the changes'
    });

  } catch (error) {
    console.error('Error in create-manual-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
