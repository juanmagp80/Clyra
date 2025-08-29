import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('Syncing subscription for user:', userEmail);

    // Buscar cliente en Stripe
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No Stripe customer found',
        hasActiveSubscription: false,
      });
    }

    const customer = customers.data[0];

    // Buscar suscripciones activas
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(sub => {
      const subWithPeriod = sub as Stripe.Subscription & {
        current_period_end: number;
      };
      return sub.status === 'active' && 
        new Date(subWithPeriod.current_period_end * 1000) > new Date();
    });

    // Obtener usuario de Supabase
    const supabase = await createServerSupabaseClient();
    
    if (activeSubscription) {
      console.log('Found active subscription:', activeSubscription.id);

      // Actualizar perfil del usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: 'pro',
          stripe_customer_id: customer.id,
          stripe_subscription_id: activeSubscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq('email', userEmail);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      } else {
        console.log('✅ Profile updated successfully');
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription synced successfully',
        hasActiveSubscription: true,
        subscription: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          current_period_end: (activeSubscription as any).current_period_end,
        },
      });
    } else {
      console.log('No active subscription found');
      return NextResponse.json({
        success: true,
        message: 'No active subscription found',
        hasActiveSubscription: false,
      });
    }

  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { 
        error: 'Error syncing subscription',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
