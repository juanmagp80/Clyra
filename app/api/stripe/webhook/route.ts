import { stripe } from '@/lib/stripe';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature provided' },
            { status: 400 }
        );
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
        );
    }

    const supabase = createSupabaseClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                console.log('🎉 Checkout session completed:', session.id);

                if (session.mode === 'subscription') {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);
                    const customer = await stripe.customers.retrieve(session.customer) as any;
                    
                    console.log('📧 Customer email:', customer.email);
                    console.log('💳 Subscription:', subscription.id);

                    if (customer.email) {
                        // Actualizar la tabla profiles directamente con el email
                        const { data: updateResult, error: updateError } = await supabase
                            .from('profiles')
                            .update({
                                subscription_status: 'active',
                                subscription_plan: 'pro',
                                stripe_customer_id: session.customer,
                                stripe_subscription_id: subscription.id,
                                subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                                cancel_at_period_end: false,
                                updated_at: new Date().toISOString()
                            })
                            .eq('email', customer.email)
                            .select();

                        if (updateError) {
                            console.error('❌ Error actualizando perfil:', updateError);
                        } else {
                            console.log('✅ Perfil actualizado exitosamente:', updateResult);
                        }
                    }
                }
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                console.log('🔄 Subscription updated/deleted:', subscription.id, 'Status:', subscription.status);

                // Actualizar el perfil basado en el stripe_subscription_id
                const { data: updateResult, error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: subscription.status === 'active' ? 'active' : 'cancelled',
                        subscription_plan: subscription.status === 'active' ? 'pro' : 'free',
                        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end || false,
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', subscription.id)
                    .select();
                    
                if (updateError) {
                    console.error('❌ Error actualizando suscripción:', updateError);
                } else {
                    console.log('✅ Suscripción actualizada:', updateResult);
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                console.log('💰 Payment succeeded for subscription:', invoice.subscription);

                if (invoice.subscription) {
                    const { data: updateResult, error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'active',
                            subscription_plan: 'pro',
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', invoice.subscription)
                        .select();
                        
                    if (updateError) {
                        console.error('❌ Error actualizando pago:', updateError);
                    } else {
                        console.log('✅ Pago procesado:', updateResult);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                console.log('❌ Payment failed for subscription:', invoice.subscription);

                if (invoice.subscription) {
                    const { data: updateResult, error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'cancelled',
                            subscription_plan: 'free',
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', invoice.subscription)
                        .select();
                        
                    if (updateError) {
                        console.error('❌ Error actualizando pago fallido:', updateError);
                    } else {
                        console.log('✅ Pago fallido procesado:', updateResult);
                    }
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
        );
    }
}