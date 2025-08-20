"use client";
import Link from 'next/link';
import { ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function StripeSetupPage() {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const testCards = [
    { name: 'Visa exitosa', number: '4242 4242 4242 4242', description: 'Pago exitoso' },
    { name: 'Visa que falla', number: '4000 0000 0000 0002', description: 'Pago fallido' },
    { name: 'Requiere autenticación', number: '4000 0025 0000 3155', description: 'Con 3D Secure' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Paso 1: Estado actual */}

          {/* Paso 2: Crear productos */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">📦 Paso 2: Crear Productos en Stripe</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-800 mb-2">1. Ve a tu Dashboard de Stripe:</p>
                <a 
                  href="https://dashboard.stripe.com/products" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Abrir Stripe Dashboard
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-semibold text-amber-800 mb-2">2. Asegúrate de estar en MODO DE PRUEBA</p>
                <p className="text-amber-700 text-sm">Arriba a la izquierda debe decir "Modo de prueba" (Test mode)</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-purple-800 mb-2">3. Crear dos productos:</p>
                <div className="space-y-2 text-purple-700 text-sm">
                  <p>• <strong>Plan Básico</strong>: €29/mes (o el precio que quieras)</p>
                  <p>• <strong>Plan Empresarial</strong>: €99/mes (o el precio que quieras)</p>
                  <p>• <strong>¡IMPORTANTE!</strong> Copia los <code>Price IDs</code> (empiezan con <code>price_</code>)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 3: Actualizar código */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">🔧 Paso 3: Actualizar Price IDs</h2>
            <p className="text-slate-600 mb-4">
              Una vez que tengas los Price IDs, actualiza el archivo <code>app/pricing/page.tsx</code>:
            </p>
            
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
              <div className="text-slate-400 mb-2">// En app/pricing/page.tsx</div>
              <div>const STRIPE_PRICES = &#123;</div>
              <div className="ml-4">BASIC: 'price_TU_PRICE_ID_BASICO',</div>
              <div className="ml-4">BUSINESS: 'price_TU_PRICE_ID_EMPRESARIAL'</div>
              <div>&#125;;</div>
            </div>
          </div>

          {/* Paso 4: Tarjetas de prueba */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">💳 Paso 4: Tarjetas de Prueba (GRATIS)</h2>
            <p className="text-slate-600 mb-4">
              Usa estas tarjetas para probar - <strong>NO SE COBRA DINERO REAL</strong>:
            </p>
            
            <div className="space-y-3">
              {testCards.map((card, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                  <div>
                    <div className="font-semibold text-slate-900">{card.name}</div>
                    <div className="text-slate-600 font-mono text-lg">{card.number}</div>
                    <div className="text-slate-500 text-sm">{card.description}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(card.number.replace(/\s/g, ''), card.name)}
                    className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 px-3 py-2 rounded-lg transition-colors"
                  >
                    {copied === card.name ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied === card.name ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-100 rounded-lg p-4 mt-4">
              <p className="text-slate-700 text-sm">
                <strong>Otros datos para completar:</strong><br />
                • CVV: Cualquier 3 números (ej: 123)<br />
                • Fecha: Cualquier fecha futura (ej: 12/25)<br />
                • Código postal: Cualquier código (ej: 12345)
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Probar Stripe Ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-3 py-4 px-8 bg-white/60 hover:bg-white/80 text-slate-700 hover:text-slate-900 rounded-2xl font-semibold border border-white/60 transition-all duration-300"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
