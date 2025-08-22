import { createCheckoutSession } from '@/lib/stripe-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    const { priceId, successUrl, cancelUrl, userEmail } = body;

    if (!priceId) {
      console.error('Missing priceId');
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      console.error('Missing userEmail');
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session for:', { priceId, userEmail, successUrl, cancelUrl });

    // Para simplificar, vamos a usar un enfoque temporal
    // En producción deberías verificar la autenticación del usuario

    // Generar un ID temporal para el usuario basado en el email
    const userId = Buffer.from(userEmail).toString('base64').substring(0, 20);

    // Crear sesión de checkout en Stripe
    const session = await createCheckoutSession(
      priceId,
      successUrl,
      cancelUrl,
      userId,
      userEmail
    );

    console.log('Stripe session created:', { id: session.id, url: session.url });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
