import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
});

export async function POST(req: NextRequest) {
    try {
        const { customerId, subscriptionId } = await req.json();

        if (!customerId && !subscriptionId) {
            return NextResponse.json(
                { error: 'Se requiere customerId o subscriptionId' },
                { status: 400 }
            );
        }

        let subscriptions: Stripe.Subscription[] = [];

        if (subscriptionId) {
            // Verificar suscripción específica
            try {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
                    expand: ['customer', 'items.data.price.product']
                });
                subscriptions = [subscription];
            } catch (error) {
                console.error('Error obteniendo suscripción específica:', error);
            }
        } else if (customerId) {
            // Obtener todas las suscripciones del cliente
            const response = await stripe.subscriptions.list({
                customer: customerId,
                status: 'all',
                limit: 10,
                expand: ['data.customer', 'data.items.data.price.product']
            });
            subscriptions = response.data;
        }

        // También obtener información del cliente
        let customer = null;
        if (customerId) {
            try {
                customer = await stripe.customers.retrieve(customerId);
            } catch (error) {
                console.error('Error obteniendo cliente:', error);
            }
        }

        const result = {
            customer,
            subscriptions: subscriptions.map(sub => {
                const subWithPeriod = sub as Stripe.Subscription & {
                    current_period_start: number;
                    current_period_end: number;
                };
                
                return {
                    id: subWithPeriod.id,
                    status: subWithPeriod.status,
                    current_period_start: new Date(subWithPeriod.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subWithPeriod.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: subWithPeriod.cancel_at_period_end,
                    canceled_at: subWithPeriod.canceled_at ? new Date(subWithPeriod.canceled_at * 1000).toISOString() : null,
                    created: new Date(subWithPeriod.created * 1000).toISOString(),
                    items: subWithPeriod.items.data.map(item => ({
                        price_id: item.price.id,
                        product_id: typeof item.price.product === 'string' ? item.price.product : item.price.product.id,
                        amount: item.price.unit_amount,
                        currency: item.price.currency,
                        interval: item.price.recurring?.interval
                    }))
                };
            }),
            hasActiveSubscription: subscriptions.some(sub => sub.status === 'active'),
            activeSubscriptions: subscriptions.filter(sub => sub.status === 'active').length
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error verificando suscripción en Stripe:', error);
        return NextResponse.json(
            { error: 'Error verificando suscripción' },
            { status: 500 }
        );
    }
}
