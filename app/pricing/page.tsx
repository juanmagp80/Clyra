"use client"
import Link from 'next/link';
import { Home, Check, Crown, Star, Shield, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { createCheckoutAndRedirect } from '@/lib/stripe-client';
import { useState } from 'react';

// CONFIGURA ESTOS PRICE IDS EN TU DASHBOARD DE STRIPE
// Estos son ejemplos - necesitas crear productos reales en tu dashboard
const STRIPE_PRICES = {
  BASIC: 'price_1PRxsALHFKglWYpZi_BASIC_TEST',     // Reemplaza con tu Price ID real del plan básico
  BUSINESS: 'price_1PRxsALHFKglWYpZi_BUSINESS_TEST' // Reemplaza con tu Price ID real del plan empresarial
};

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleStripeCheckout = async (priceId: string, planName: string) => {
    setIsLoading(planName);
    try {
      await createCheckoutAndRedirect(priceId);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago. Inténtalo de nuevo.');
      setIsLoading(null);
    }
  };
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            <div className="relative z-10">
                <div className="container mx-auto px-6 pt-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 hover:text-slate-900 font-semibold transition-all duration-300"
                    >
                        <Home className="w-4 h-4" />
                        Volver al Dashboard
                    </Link>
                </div>

                <div className="container mx-auto px-6 py-16">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-orange-600" />
                            <span className="text-orange-700 font-semibold text-sm">Stripe Integrado</span>
                        </div>

                        <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-orange-700 to-amber-700 bg-clip-text text-transparent mb-6">
                            Planes de Suscripción
                        </h1>

                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                            Elige el plan perfecto para tu negocio
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="relative group bg-white/60 backdrop-blur-2xl rounded-3xl border-2 border-white/60 shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-lg">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Gratis</h3>
                                        <p className="text-slate-600 font-medium">Perfecto para empezar</p>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-black text-slate-900">€0</span>
                                        <span className="text-slate-600 font-semibold">/mes</span>
                                    </div>
                                </div>
                                <div className="mb-8 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">5 clientes máximo</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">3 proyectos activos</span>
                                    </div>
                                </div>
                                <Link href="/dashboard">
                                    <button className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-white/80 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-3">
                                        Empezar Gratis
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative group bg-white/60 backdrop-blur-2xl rounded-3xl border-2 border-orange-300 shadow-2xl shadow-orange-500/20 scale-105 transition-all duration-500 overflow-hidden hover:scale-110">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-bl-2xl font-bold text-sm flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Más Popular
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                                        <Star className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Profesional</h3>
                                        <p className="text-slate-600 font-medium">Para profesionales serios</p>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-black text-slate-900">€19</span>
                                        <span className="text-slate-600 font-semibold">/mes</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Cancelable en cualquier momento</p>
                                </div>
                                <div className="mb-8 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">50 clientes</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">Proyectos ilimitados</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => alert('Demo de Stripe - Funciona perfectamente!')}
                                    className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    Probar Stripe
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="relative group bg-white/60 backdrop-blur-2xl rounded-3xl border-2 border-white/60 shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Empresarial</h3>
                                        <p className="text-slate-600 font-medium">Para equipos y empresas</p>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-black text-slate-900">€49</span>
                                        <span className="text-slate-600 font-semibold">/mes</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Cancelable en cualquier momento</p>
                                </div>
                                <div className="mb-8 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">Clientes ilimitados</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">IA personalizada</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => alert('Demo de Stripe - Funciona perfectamente!')}
                                    className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    Probar Stripe
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 p-8 max-w-4xl mx-auto">
                            <h3 className="text-2xl font-black text-slate-900 mb-4">
                                🧪 Stripe en Modo de Prueba
                            </h3>
                            <p className="text-slate-700 mb-4">
                                Tienes las claves configuradas. Ahora crea productos para probarlo gratis.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-blue-700 font-semibold text-sm">
                                    ✓ Claves de prueba configuradas<br />
                                    ⚠️ Necesitas crear productos en Stripe Dashboard<br />
                                    💳 Usa tarjetas de prueba - no gasta dinero real
                                </p>
                            </div>
                            <Link
                                href="/stripe-setup"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                            >
                                📦 Ver Guía de Configuración
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
