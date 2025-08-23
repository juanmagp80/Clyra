import React from 'react';
import { useAccessControl } from '@/src/lib/useAccessControl';
import { Crown, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProtectedPageProps {
  feature: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ProtectedPage({
  feature,
  children,
  title = 'Función Premium',
  description = 'Esta función requiere un plan PRO activo'
}: ProtectedPageProps) {
  const { checkAccess, isPro, isTrialActive, isTrialExpired, daysRemaining } = useAccessControl();
  const accessRestriction = checkAccess(feature);

  if (accessRestriction.isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-12 text-center">
              {/* Estado visual */}
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  {isTrialExpired ? (
                    <Clock className="w-12 h-12 text-white" />
                  ) : (
                    <Crown className="w-12 h-12 text-white" />
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  {isTrialExpired ? 'Trial Expirado' : title}
                </h1>
                
                <p className="text-lg text-slate-600 mb-6">
                  {accessRestriction.reason}
                </p>

                {isTrialExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <span className="text-red-800 font-semibold">Período de prueba terminado</span>
                    </div>
                    <p className="text-red-700 text-sm">
                      Tu trial de 14 días ha expirado. Activa tu plan PRO para continuar usando todas las funcionalidades de Taskelio.
                    </p>
                  </div>
                )}
              </div>

              {/* Beneficios del Plan PRO */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">
                  ¿Qué incluye el Plan PRO?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-800 font-medium">Clientes ilimitados</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-800 font-medium">Proyectos ilimitados</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-purple-800 font-medium">Automatizaciones avanzadas</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-orange-800 font-medium">Facturas profesionales</span>
                  </div>
                </div>
              </div>

              {/* Acción */}
              <div className="space-y-4">
                <Button
                  onClick={() => window.location.href = '/dashboard?upgrade=true'}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Activar Plan PRO - Solo €10/mes
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="ghost"
                  className="w-full text-slate-600 hover:text-slate-800"
                >
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Import necesarios para los iconos
import { AlertTriangle, Users, Briefcase, Zap, FileText } from 'lucide-react';
