import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    // Verificar si ya existe un producto para Taskelio PRO
    const products = await stripe.products.list({
      limit: 10,
    });

    let product = products.data.find(p => p.name === 'Taskelio PRO');

    // Si no existe, crear el producto
    if (!product) {
      product = await stripe.products.create({
        name: 'Taskelio PRO',
        description: 'CRM completo para freelancers - Acceso ilimitado con atención personalizada',
        images: [], // Puedes añadir imágenes aquí si tienes
      });
    }

    // Verificar si ya existe un precio para €10/mes
    const prices = await stripe.prices.list({
      product: product.id,
      limit: 10,
    });

    let price = prices.data.find(p => 
      p.unit_amount === 1000 && // €10 = 1000 centavos
      p.currency === 'eur' &&
      p.recurring?.interval === 'month'
    );

    // Si no existe, crear el precio
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1000, // €10 en centavos
        currency: 'eur',
        recurring: {
          interval: 'month',
        },
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
      },
      price: {
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
      },
    });

  } catch (error: any) {
    console.error('Error setting up Stripe product:', error);
    return NextResponse.json(
      { 
        error: 'Error setting up Stripe product',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
