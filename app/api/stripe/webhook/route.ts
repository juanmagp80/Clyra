import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('🎉 Checkout session completed:', session.id);

                if (session.customer && session.subscription) {
                    // Buscar el usuario por email del cliente
                    const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
                    
                    if (customer.email) {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('email', customer.email)
                            .single();

                        if (profileError) {
                            console.error('Error finding user profile:', profileError);
                            break;
                        }

                        // Actualizar el perfil del usuario con la información de suscripción
                        const { error: updateError } = await supabase
                            .from('profiles')
                            .update({
                                subscription_status: 'active',
                                subscription_plan: 'pro',
                                stripe_customer_id: session.customer,
                                stripe_subscription_id: session.subscription,
                                updated_at: new Date().toISOString()
                            })
                            .eq('email', customer.email);

                        if (updateError) {
                            console.error('Error updating user profile:', updateError);
                        } else {
                            console.log('✅ User profile updated successfully for:', customer.email);
                        }

                        // Registrar la actividad
                        await supabase
                            .from('trial_activities')
                            .insert({
                                user_id: profile.id,
                                activity_type: 'subscription_activated',
                                activity_data: {
                                    stripe_customer_id: session.customer,
                                    stripe_subscription_id: session.subscription,
                                    amount_paid: session.amount_total,
                                    currency: session.currency
                                }
                            });
                    }
                }
                break;
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('📝 Subscription created:', subscription.id);

                // Buscar el perfil por stripe_customer_id
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('stripe_customer_id', subscription.customer)
                    .single();

                if (profileError) {
                    console.error('Error finding user profile by customer ID:', profileError);
                    break;
                }

                // Actualizar la información de suscripción
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        subscription_plan: 'pro',
                        stripe_subscription_id: subscription.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_customer_id', subscription.customer);

                if (updateError) {
                    console.error('Error updating subscription info:', updateError);
                } else {
                    console.log('✅ Subscription info updated for customer:', subscription.customer);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('🔄 Subscription updated:', subscription.id);

                let status: string;
                if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
                    status = 'active';
                } else if (subscription.cancel_at_period_end) {
                    status = 'cancelled'; // Cancelado pero activo hasta el final del período
                } else if (subscription.status === 'canceled') {
                    status = 'expired'; // Completamente cancelado
                } else {
                    status = subscription.status === 'active' ? 'active' : 'expired';
                }

                // Actualizar el estado de la suscripción
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', subscription.id);

                if (updateError) {
                    console.error('Error updating subscription status:', updateError);
                } else {
                    console.log('✅ Subscription status updated:', subscription.id, 'to', status);
                    if (subscription.cancel_at_period_end) {
                        console.log('📅 Subscription will cancel at:', new Date(subscription.current_period_end * 1000).toISOString());
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('❌ Subscription cancelled:', subscription.id);

                // Marcar suscripción como cancelada
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'cancelled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', subscription.id);

                if (updateError) {
                    console.error('Error marking subscription as cancelled:', updateError);
                } else {
                    console.log('✅ Subscription marked as cancelled:', subscription.id);
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('💰 Payment succeeded for invoice:', invoice.id);

                if (invoice.subscription) {
                    // Asegurar que la suscripción esté marcada como activa
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'active',
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', invoice.subscription);

                    if (updateError) {
                        console.error('Error updating subscription after payment:', updateError);
                    } else {
                        console.log('✅ Subscription confirmed active after payment:', invoice.subscription);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('❌ Payment failed for invoice:', invoice.id);

                if (invoice.subscription) {
                    // Marcar suscripción como problema de pago
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'expired',
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', invoice.subscription);

                    if (updateError) {
                        console.error('Error updating subscription after payment failure:', updateError);
                    } else {
                        console.log('✅ Subscription marked as expired due to payment failure:', invoice.subscription);
                    }
                }
                break;
            }

            default:
                console.log('🔔 Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
