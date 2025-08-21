import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, userEmail, successUrl, cancelUrl } = await request.json();

    console.log('Creating checkout session for:', { priceId, userEmail });

    if (!priceId || !userEmail) {
      console.error('Missing required fields:', { priceId, userEmail });
      return NextResponse.json(
        { error: 'Price ID and user email are required' },
        { status: 400 }
      );
    }

    // Buscar o crear cliente en Stripe
    let customer: Stripe.Customer;
    
    try {
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('Found existing customer:', customer.id);
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            created_from: 'taskelio_app',
          },
        });
        console.log('Created new customer:', customer.id);
      }
    } catch (stripeError: any) {
      console.error('Error with Stripe customer:', stripeError);
      return NextResponse.json(
        { error: 'Error creating/finding customer', message: stripeError.message },
        { status: 500 }
      );
    }

    // Crear sesión de checkout
    try {
      const baseUrl = successUrl?.startsWith('http') 
        ? successUrl.split('/').slice(0, 3).join('/')
        : 'http://localhost:3000';

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${baseUrl}/payment/cancel`,
        metadata: {
          user_email: userEmail,
          created_from: 'taskelio_app',
        },
        billing_address_collection: 'auto',
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            user_email: userEmail,
            created_from: 'taskelio_app',
          },
        },
      });

      console.log('Created checkout session:', session.id);
      return NextResponse.json({ sessionId: session.id });

    } catch (sessionError: any) {
      console.error('Error creating checkout session:', sessionError);
      return NextResponse.json(
        { error: 'Error creating checkout session', message: sessionError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected error creating checkout session',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
