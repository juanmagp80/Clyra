import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
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

    console.log('Cancelling subscription for user:', userEmail);

    // Obtener información del usuario desde Supabase
    const supabase = await createServerSupabaseClient();
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, subscription_status')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!profile.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No se encontró una suscripción activa para este usuario' },
        { status: 400 }
      );
    }

    // Cancelar la suscripción en Stripe (al final del período actual)
    const cancelledSubscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    console.log('Subscription cancelled in Stripe:', cancelledSubscription.id);

    // Actualizar el estado en Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        cancel_at_period_end: true,
        subscription_current_period_end: new Date(cancelledSubscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', userEmail);

    if (updateError) {
      console.error('Error updating profile after cancellation:', updateError);
    }

    // Registrar la actividad
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('trial_activities')
        .insert({
          user_id: user.id,
          activity_type: 'subscription_cancelled',
          activity_data: {
            stripe_subscription_id: profile.stripe_subscription_id,
            cancelled_at: new Date().toISOString(),
            cancel_at_period_end: true,
            current_period_end: new Date(cancelledSubscription.current_period_end * 1000).toISOString()
          }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      subscription: {
        id: cancelledSubscription.id,
        status: cancelledSubscription.status,
        cancel_at_period_end: cancelledSubscription.cancel_at_period_end,
        current_period_end: new Date(cancelledSubscription.current_period_end * 1000).toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    
    // Manejar errores específicos de Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Suscripción no válida o ya cancelada' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error cancelando suscripción',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
