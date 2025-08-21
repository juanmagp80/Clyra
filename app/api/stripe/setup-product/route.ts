import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Crear el producto en Stripe
    const product = await stripe.products.create({
      name: 'Clyra Pro',
      description: 'Acceso completo a todas las funcionalidades de Clyra',
    });

    // Crear el precio mensual de 12 euros
    const price = await stripe.prices.create({
      unit_amount: 1200, // 12 euros en centavos
      currency: 'eur',
      recurring: { interval: 'month' },
      product: product.id,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
      },
      price: {
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
      }
    });
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    return NextResponse.json(
      { error: 'Error creating product', details: error },
      { status: 500 }
    );
  }
}
