'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCookieConsent } from '@/src/hooks/useCookieConsent';
import { Settings, Cookie, Shield, Eye } from 'lucide-react';

export default function CookieSettings() {
  const { consent, hasConsent, updateConsent, revokeConsent, isLoading } = useCookieConsent();
  const [isOpen, setIsOpen] = useState(false);
  
  // No mostrar si está cargando o no hay consentimiento
  if (isLoading || !hasConsent) {
    return null;
  }

  const handleRevoke = () => {
    revokeConsent();
    setIsOpen(false);
  };

  const currentPreferences = consent?.preferences || {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  };

  return (
    <>
      {/* Botón flotante para abrir configuración */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40"
        title="Configuración de cookies"
      >
        <Cookie className="w-5 h-5" />
      </button>

      {/* Modal de configuración */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-lg shadow-xl z-50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Configuración de Cookies
                </h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Necesarias</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ACTIVAS
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Análisis</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentPreferences.analytics 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentPreferences.analytics ? 'ACTIVAS' : 'INACTIVAS'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Marketing</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentPreferences.marketing 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentPreferences.marketing ? 'ACTIVAS' : 'INACTIVAS'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Funcionales</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentPreferences.functional 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentPreferences.functional ? 'ACTIVAS' : 'INACTIVAS'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRevoke}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  🗑️ Revocar Consentimiento
                </Button>
                
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Consentimiento otorgado el{' '}
                {consent?.timestamp ? new Date(consent.timestamp).toLocaleDateString('es-ES') : 'Desconocido'}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
