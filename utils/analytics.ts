// utils/analytics.ts
'use client';

import { useCookieConsent } from '@/src/hooks/useCookieConsent';

// Configuración de Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Función para activar Google Analytics solo si se acepta
export const initializeGoogleAnalytics = () => {
  if (!GA_TRACKING_ID) return;

  // Cargar el script de Google Analytics
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    
    // Configuración inicial (denegado por defecto)
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
    
    gtag('config', '${GA_TRACKING_ID}', {
      send_page_view: false // No enviar automáticamente
    });
  `;
  document.head.appendChild(script2);
};

// Función para enviar eventos de página
export const trackPageView = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Función para enviar eventos personalizados
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Hook para usar analytics con consentimiento
export const useAnalytics = () => {
  const { canUseAnalytics } = useCookieConsent();

  const track = {
    pageView: (url: string) => {
      if (canUseAnalytics) {
        trackPageView(url);
      }
    },
    event: (action: string, category: string, label?: string, value?: number) => {
      if (canUseAnalytics) {
        trackEvent(action, category, label, value);
      }
    },
    // Eventos comunes
    signup: () => {
      if (canUseAnalytics) {
        trackEvent('signup', 'user_engagement');
      }
    },
    login: () => {
      if (canUseAnalytics) {
        trackEvent('login', 'user_engagement');
      }
    },
    createContract: () => {
      if (canUseAnalytics) {
        trackEvent('create_contract', 'user_actions');
      }
    },
    upgradeAccount: () => {
      if (canUseAnalytics) {
        trackEvent('upgrade_account', 'conversion');
      }
    },
  };

  return { track, canUseAnalytics };
};
