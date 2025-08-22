'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const tryAgain = () => {
    router.push('/subscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago Cancelado
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          No te preocupes, no se ha realizado ningún cargo
        </p>
        
        <p className="text-gray-500 mb-8">
          Puedes volver a intentarlo cuando estés listo o explorar más sobre <span className="font-semibold text-indigo-600">Taskelio PRO</span>.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={tryAgain}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Intentar de Nuevo
          </button>
          
          <button
            onClick={goBack}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
        
        <div className="pt-6 border-t border-gray-100 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-sm text-gray-600">
            Si tienes problemas con el pago, contáctanos en{' '}
            <a href="mailto:soporte@taskelio.app" className="text-indigo-600 hover:underline">
              soporte@taskelio.app
            </a>
          </p>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">
          Recuerda que puedes probar Taskelio gratis por 14 días
        </p>
      </div>
    </div>
  );
}
