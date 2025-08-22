import { NextRequest, NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientComponentClient();
    
    // Obtener sesión del usuario
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No authenticated user' },
        { status: 401 }
      );
    }

    console.log('Creating/updating subscription for user:', session.user.id);

    // Intentar insertar o actualizar la suscripción
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: session.user.id,
        is_subscribed: true,
        plan_type: 'pro',
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      
      // Si la tabla no existe, intentar crearla
      if (error.message.includes('does not exist')) {
        return NextResponse.json({
          error: 'Database table does not exist',
          message: 'Please create the user_subscriptions table in Supabase Dashboard',
          sql: `
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    plan_type VARCHAR(20) DEFAULT 'free',
    trial_end TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);
          `
        }, { status: 500 });
      }
      
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Subscription activated successfully' 
    });

  } catch (error) {
    console.error('Error activating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
