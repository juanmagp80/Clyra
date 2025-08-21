'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { Crown, CheckCircle, Users, Mail } from 'lucide-react';

export default function SubscriptionPage() {
  const [priceId, setPriceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { trialInfo } = useTrialStatus();
  const router = useRouter();

  const handleStartTrial = () => {
    router.push('/register');
  };

  const handleUpgradeToPro = () => {
    // Scroll a la sección de suscripción
    const subscriptionSection = document.getElementById('subscription-section');
    if (subscriptionSection) {
      subscriptionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400/30 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-float delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-pink-400/30 rounded-full animate-float delay-3000"></div>
        <div className="absolute top-1/3 left-20 w-1 h-1 bg-green-400/40 rounded-full animate-float delay-1500"></div>
        <div className="absolute top-60 right-10 w-3 h-3 bg-orange-400/30 rounded-full animate-float delay-2500"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Crown className="h-16 w-16 text-yellow-400 animate-bounce" />
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur opacity-75 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6">
            Planes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Taskelio</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            🚀 Empieza gratis con <span className="text-yellow-400 font-semibold">14 días de acceso completo</span>, 
            luego continúa con nuestro plan profesional ultra-competitivo
          </p>
          
          {/* Floating badges */}
          <div className="flex justify-center space-x-4 mt-8">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-transform">
              ✨ Sin tarjeta de crédito
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-transform">
              🎯 Cancela cuando quieras
            </div>
          </div>
        </div>        {/* Trial Status */}
        {trialInfo && (
          <div className="max-w-5xl mx-auto mb-12">
            {trialInfo.isExpired ? (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative p-8 bg-gradient-to-r from-red-900 to-orange-900 rounded-2xl border border-red-500/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⏰</div>
                    <h3 className="font-bold text-white text-2xl mb-3">¡Tu trial ha expirado!</h3>
                    <p className="text-red-100 text-lg mb-6">
                      Para continuar usando <span className="text-yellow-300 font-semibold">Taskelio</span> sin límites, suscríbete al Plan PRO por solo <span className="text-yellow-300 font-bold">€10/mes</span>
                    </p>
                    <div className="flex justify-center">
                      <button 
                        onClick={handleUpgradeToPro}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-8 py-4 rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl"
                      >
                        🚀 Suscribirme al Plan PRO
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative p-8 bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl border border-blue-500/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="font-bold text-white text-2xl mb-3">
                      Trial Activo - Acceso Completo Ilimitado
                    </h3>
                    <p className="text-blue-100 text-lg mb-3">
                      <span className="text-yellow-400 font-bold text-2xl">{trialInfo.daysRemaining} días restantes</span> de acceso total a Taskelio
                    </p>
                    <p className="text-purple-200">
                      Disfruta de todas las funcionalidades sin restricciones. Cuando termines, continúa con el Plan PRO por solo <span className="text-yellow-400 font-semibold">€10/mes</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subscription Card */}
        <div id="subscription-section" className="flex justify-center mb-12">
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
        <div className="max-w-7xl mx-auto mt-20">
          <h2 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-16">
            Compara nuestros planes
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Plan Gratuito */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 h-full">
                <div className="text-center mb-8">
                  <div className="relative inline-block mb-6">
                    <Users className="h-16 w-16 text-blue-400 mx-auto" />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      GRATIS
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Plan Gratuito</h3>
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      Gratis
                    </div>
                    <div className="text-gray-400 text-lg">por 14 días completos</div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-white font-semibold text-lg">Acceso completo ilimitado</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-300">Clientes ilimitados</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-300">Proyectos ilimitados</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-300">Todas las funcionalidades</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-300">Portal de cliente</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-300">Automatizaciones</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-300">Soporte por email</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-blue-300 font-semibold">
                      🎯 Prueba todo sin restricciones
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan PRO */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-3xl p-8 border border-yellow-400/30 h-full">
                
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-bold text-sm shadow-2xl">
                    ⭐ RECOMENDADO
                  </div>
                </div>
                
                <div className="text-center mb-8 mt-4">
                  <div className="relative inline-block mb-6">
                    <Crown className="h-16 w-16 text-yellow-400 mx-auto animate-pulse" />
                    <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-xl"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Plan PRO</h3>
                  <div className="mb-6">
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                      €10
                    </div>
                    <div className="text-pink-200 text-lg">/mes para siempre</div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-white font-semibold text-lg">Todo ilimitado (para siempre)</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-pink-200">Clientes ilimitados</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-pink-200">Proyectos ilimitados</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-pink-200">Todas las funcionalidades</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-pink-200">Portal de cliente avanzado</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-pink-200">Automatizaciones avanzadas</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-pink-200">Reportes detallados</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-white font-semibold">✨ Atención personalizada</span>
                  </div>
                  <div className="flex items-center group/item">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mr-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-white font-semibold">🚀 Soporte prioritario 24/7</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl p-4">
                    <p className="text-yellow-300 font-semibold">
                      💎 Para profesionales que van en serio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-12">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            <div className="group">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                <h3 className="font-bold text-white text-xl mb-3 flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  ¿Qué incluye el trial gratuito de 14 días?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Acceso completo e ilimitado a todas las funcionalidades de <span className="text-yellow-400 font-semibold">Taskelio</span>, 
                  sin restricciones en clientes, proyectos o características. Es como tener el Plan PRO gratis durante 14 días.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
                <h3 className="font-bold text-white text-xl mb-3 flex items-center">
                  <span className="text-2xl mr-3">💎</span>
                  ¿Qué diferencia al Plan PRO del trial gratuito?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  El Plan PRO te garantiza acceso permanente por solo <span className="text-yellow-400 font-bold">€10/mes</span> y adiciona 
                  <span className="text-purple-400 font-semibold"> atención personalizada</span> con soporte prioritario 24/7. 
                  Ideal para profesionales que dependen de Taskelio para su negocio.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                <h3 className="font-bold text-white text-xl mb-3 flex items-center">
                  <span className="text-2xl mr-3">🔒</span>
                  ¿Es seguro el pago?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Sí, utilizamos <span className="text-green-400 font-semibold">Stripe</span> para procesar los pagos, 
                  que es uno de los procesadores de pago más seguros del mundo. Tus datos están completamente protegidos.
                </p>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-8 border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
                <h3 className="font-bold text-white text-xl mb-3 flex items-center">
                  <span className="text-2xl mr-3">🚪</span>
                  ¿Puedo cancelar en cualquier momento?
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Por supuesto. Puedes cancelar tu suscripción en cualquier momento con un solo clic 
                  y seguirás teniendo acceso hasta el final del período de facturación. 
                  <span className="text-orange-400 font-semibold">Sin compromisos, sin ataduras.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action Final */}
        <div className="max-w-4xl mx-auto mt-24 mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-shimmer"></div>
            <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-12 border border-purple-500/30">
              <div className="text-center">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 mb-4">
                  ¿Listo para transformar tu negocio?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Únete a miles de freelancers que ya están <span className="text-yellow-400 font-semibold">facturando más</span> y 
                  <span className="text-pink-400 font-semibold"> trabajando menos</span> con Taskelio
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button 
                    onClick={handleStartTrial}
                    className="group relative bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl"
                  >
                    <span className="relative z-10">
                      🎯 Empezar trial GRATIS ahora
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </button>
                  
                  <div className="text-gray-400 text-sm">
                    14 días completos • Sin tarjeta • Cancela cuando quieras
                  </div>
                </div>
                
                <div className="flex justify-center space-x-8 mt-8 text-gray-400">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <span>Setup en 2 minutos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <span>Soporte en español</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <span>Datos seguros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
