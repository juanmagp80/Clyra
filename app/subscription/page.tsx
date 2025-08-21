'use client';

import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { CheckCircle, Crown, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SubscriptionPage() {
  const [priceId, setPriceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { trialInfo } = useTrialStatus();

  useEffect(() => {
    // Crear o obtener el producto de Stripe al cargar la página
    const setupStripeProduct = async () => {
      try {
        const response = await fetch('/api/stripe/setup-product', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          setPriceId(data.price.id);
        } else {
          console.error('Error setting up Stripe product');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    setupStripeProduct();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Configurando opciones de suscripción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Clyra <span className="text-indigo-600">Pro</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desbloquea todo el potencial de Clyra con nuestro plan profesional
          </p>
        </div>

        {/* Trial Status */}
        {trialInfo && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <h3 className="font-semibold text-blue-900">Estado de tu Trial</h3>
              <p className="text-blue-700">
                {trialInfo.isExpired
                  ? 'Tu trial ha expirado'
                  : `${trialInfo.daysRemaining} días restantes`
                }
              </p>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        <div className="flex justify-center mb-12">
          {priceId ? (
            <SubscriptionCard priceId={priceId} />
          ) : (
            <div className="text-center text-gray-600">
              <p>No se pudo cargar las opciones de suscripción.</p>
              <p className="text-sm mt-2">Verifica que Stripe esté configurado correctamente.</p>
            </div>
          )}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Qué obtienes con Pro?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Trial/Free */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">Trial Gratuito</h3>
                <p className="text-gray-600">14 días de prueba</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Hasta 3 clientes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Hasta 5 proyectos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Funcionalidad básica</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Soporte por email</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                  Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <Crown className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">Clyra Pro</h3>
                <p className="text-indigo-100">Todo sin límites</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Clientes ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Proyectos ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Todas las funcionalidades</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Portal de cliente</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Automatizaciones avanzadas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Reportes detallados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Es seguro el pago?
              </h3>
              <p className="text-gray-600">
                Sí, utilizamos Stripe para procesar los pagos, que es uno de los procesadores de pago más seguros del mundo.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Puedo cancelar en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Por supuesto. Puedes cancelar tu suscripción en cualquier momento y seguirás teniendo acceso hasta el final del período de facturación.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Qué incluye el soporte prioritario?
              </h3>
              <p className="text-gray-600">
                Los usuarios Pro reciben respuesta prioritaria a sus consultas y acceso a funcionalidades beta antes que otros usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
