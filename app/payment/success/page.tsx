'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos una verificación del pago
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Verificando tu pago...
          </h2>
          <p className="text-gray-500 mt-2">
            Esto solo tomará unos segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          Bienvenido a <span className="font-semibold text-indigo-600">Taskelio PRO</span>
        </p>
        
        <p className="text-gray-500 mb-8">
          Tu suscripción ha sido activada correctamente. Ya tienes acceso completo a todas las funcionalidades premium.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={goToDashboard}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Ir al Dashboard
          </button>
          
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">
              ¿Qué puedes hacer ahora?
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>✅ Crear clientes y proyectos ilimitados</li>
              <li>✅ Generar facturas profesionales</li>
              <li>✅ Usar el portal de cliente</li>
              <li>✅ Acceder a todas las automatizaciones</li>
              <li>✅ Recibir soporte prioritario</li>
            </ul>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">
          Recibirás un email de confirmación en los próximos minutos
        </p>
      </div>
    </div>
  );
}
