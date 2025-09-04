'use client';

import { useCookieConsent } from '@/src/hooks/useCookieConsent';
import { useEffect, useState } from 'react';

interface CookieManagerProps {
  children: React.ReactNode;
}

export default function CookieManager({ children }: CookieManagerProps) {
  const { isLoading, hasConsent, consent } = useCookieConsent();
  const [showInitializing, setShowInitializing] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Pequeño delay para evitar flashing
      const timer = setTimeout(() => {
        setShowInitializing(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Mientras se carga, mostrar un indicador sutil
  if (showInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
