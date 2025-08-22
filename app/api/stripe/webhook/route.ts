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

                if (session.mode === 'subscription') {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);

                    const userId = session.client_reference_id;

                    if (userId) {
                        // Actualizar la tabla user_subscriptions
                        await supabase
                            .from('user_subscriptions')
                            .upsert({
                                user_id: userId,
                                is_subscribed: true,
                                plan_type: 'pro',
                                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                                stripe_customer_id: session.customer,
                                stripe_subscription_id: subscription.id,
                            }, {
                                onConflict: 'user_id'
                            });
                            
                        console.log('Suscripción actualizada para usuario:', userId);
                    }
                }
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;

                await supabase
                    .from('user_subscriptions')
                    .update({
                        is_subscribed: subscription.status === 'active',
                        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        plan_type: subscription.status === 'active' ? 'pro' : 'free',
                    })
                    .eq('stripe_subscription_id', subscription.id);
                    
                console.log('Suscripción actualizada:', subscription.id, 'Estado:', subscription.status);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;

                if (invoice.subscription) {
                    await supabase
                        .from('user_subscriptions')
                        .update({
                            is_subscribed: true,
                            plan_type: 'pro',
                        })
                        .eq('stripe_subscription_id', invoice.subscription);
                        
                    console.log('Pago exitoso para suscripción:', invoice.subscription);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;

                if (invoice.subscription) {
                    await supabase
                        .from('user_subscriptions')
                        .update({
                            is_subscribed: false,
                            plan_type: 'free',
                        })
                        .eq('stripe_subscription_id', invoice.subscription);
                        
                    console.log('Pago fallido para suscripción:', invoice.subscription);
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