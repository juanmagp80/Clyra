import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('🎯 Webhook de Stripe - Inicio del procesamiento');
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  console.log('📋 Webhook details:', {
    hasSignature: !!signature,
    bodyLength: body.length,
    signature: signature?.substring(0, 20) + '...'
  });

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    console.log('🔐 Verificando firma del webhook...');
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Firma verificada correctamente');
  } catch (error: any) {
    console.error('❌ Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin();

  try {
    console.log('🎯 Webhook de Stripe recibido:', {
      type: event.type,
      id: event.id
    });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, supabase);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription, supabase);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, supabase);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, supabase);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, supabase: any) {
  console.log('🔄 Procesando cambio de suscripción de Stripe:', {
    subscriptionId: subscription.id,
    metadata: subscription.metadata,
    status: subscription.status,
    customerId: subscription.customer
  });

  // Buscar usuario por customer_id o email en metadata
  let targetEmail = subscription.metadata?.customer_email;
  let userId = subscription.metadata?.user_id;
  
  console.log('🔍 Buscando usuario con metadata:', {
    targetEmail,
    userId,
    customerId: subscription.customer
  });

  // Si no tenemos email en metadata, intentar obtenerlo del customer de Stripe
  if (!targetEmail && subscription.customer) {
    try {
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (customer && !customer.deleted && customer.email) {
        targetEmail = customer.email;
        console.log('📧 Email obtenido del customer de Stripe:', targetEmail);
      }
    } catch (error) {
      console.error('❌ Error obteniendo customer de Stripe:', error);
    }
  }

  if (!targetEmail) {
    console.error('❌ No se pudo determinar el email del usuario para la suscripción', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      metadata: subscription.metadata
    });
    return;
  }

  console.log('📝 Actualizando perfil para:', targetEmail);

  // Actualizar el perfil del usuario con el estado de suscripción real
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
      subscription_plan: 'pro',
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      subscription_current_period_start: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : null,
      subscription_current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('email', targetEmail);

  if (error) {
    console.error('❌ Error actualizando perfil del usuario:', error);
    throw error;
  } else {
    console.log('✅ Perfil actualizado exitosamente:', {
      email: targetEmail,
      status: subscription.status,
      plan: 'pro',
      subscriptionId: subscription.id
    });
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription, supabase: any) {
  console.log('🚫 Procesando cancelación de suscripción:', subscription.id);
  
  // Actualizar perfil por stripe_subscription_id
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Error cancelando suscripción en perfil:', error);
  } else {
    console.log('✅ Suscripción cancelada exitosamente:', subscription.id);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  const subscriptionId = (invoice as any).subscription;
  
  if (subscriptionId) {
    console.log('✅ Procesando pago exitoso para suscripción:', subscriptionId);
    
    // Actualizar estado de suscripción a activo en profiles
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('❌ Error actualizando perfil después del pago:', error);
    } else {
      console.log('✅ Perfil actualizado después del pago exitoso:', subscriptionId);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const subscriptionId = (invoice as any).subscription;
  
  if (subscriptionId) {
    console.log('❌ Procesando fallo de pago para suscripción:', subscriptionId);
    
    // Marcar suscripción como past_due en profiles
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('❌ Error actualizando perfil después del fallo de pago:', error);
    } else {
      console.log('⚠️ Perfil marcado como atrasado después del fallo de pago:', subscriptionId);
    }
  }
}
