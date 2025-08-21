import { useState } from 'react';
import { createCheckoutAndRedirect } from '@/lib/stripe-client';

export const useStripeSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribeToPro = async (priceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await createCheckoutAndRedirect(
        priceId,
        `${window.location.origin}/dashboard?subscription=success`,
        `${window.location.origin}/dashboard?subscription=cancelled`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la suscripción');
      setIsLoading(false);
    }
  };

  return {
    subscribeToPro,
    isLoading,
    error,
  };
};
