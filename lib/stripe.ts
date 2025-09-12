import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

// Configuración del producto y precio (en modo test)
export const STRIPE_CONFIG = {
  // ID del precio en Stripe - se creará automáticamente
  MONTHLY_PRICE_ID: process.env.STRIPE_PRICE_ID || 'price_temp',
  SUCCESS_URL: process.env.NODE_ENV === 'production' 
    ? 'https://tu-dominio.com/dashboard?success=true'
    : 'http://localhost:3000/dashboard?success=true',
  CANCEL_URL: process.env.NODE_ENV === 'production'
    ? 'https://tu-dominio.com/dashboard?canceled=true'
    : 'http://localhost:3000/dashboard?canceled=true',
};
