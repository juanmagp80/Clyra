import { createCheckoutSession } from '@/lib/stripe-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl, userEmail } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
