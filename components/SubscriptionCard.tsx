'use client';

import { useState } from 'react';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

interface SubscriptionCardProps {
  priceId: string;
}

export function SubscriptionCard({ priceId }: SubscriptionCardProps) {
  const { subscribeToPro, isLoading, error } = useStripeSubscription();

  const handleSubscribe = async () => {
    await subscribeToPro(priceId);
  };

  return (
    <div className="w-full max-w-md mx-auto border-2 border-indigo-200 shadow-lg rounded-lg bg-white">
      <div className="text-center p-6 pb-4">
        <h3 className="text-2xl font-bold text-indigo-900 mb-2">
          Taskelio PRO
        </h3>
        <p className="text-gray-600 mb-4">
          Acceso completo a todas las funcionalidades
        </p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-indigo-600">€10</span>
          <span className="text-gray-500 ml-2">/mes</span>
        </div>
      </div>
      
      <div className="p-6 pt-0 space-y-4">
        <ul className="space-y-3">
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">Clientes ilimitados</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">Proyectos ilimitados</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">Facturas ilimitadas</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">Plantillas y automatizaciones</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">Calendario y propuestas</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">Portal de cliente</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">Reportes avanzados</span>
          </li>
        </ul>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <button 
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Suscribirse a Pro
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Cancela en cualquier momento. Pago seguro con Stripe.
        </p>
      </div>
    </div>
  );
}
