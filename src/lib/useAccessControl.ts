import { useTrialStatus } from './useTrialStatus';

export interface AccessRestriction {
  isBlocked: boolean;
  reason: string;
  action: 'upgrade' | 'renew' | null;
}

export function useAccessControl() {
  const { status, plan, canUseFeatures, isExpired, daysRemaining } = useTrialStatus();

  // Estados derivados
  const isPro = plan === 'pro' && status === 'active';
  const isTrialActive = status === 'trial' && !isExpired;
  const isTrialExpired = status === 'trial' && isExpired;

  // Funciones de verificación de acceso
  const checkAccess = (feature: string): AccessRestriction => {
    // Si es usuario PRO, acceso completo
    if (isPro) {
      return {
        isBlocked: false,
        reason: '',
        action: null
      };
    }

    // Si el trial está expirado, bloquear todas las funciones premium
    if (isTrialExpired) {
      return {
        isBlocked: true,
        reason: 'Tu período de prueba ha expirado. Activa tu plan PRO para continuar usando todas las funciones.',
        action: 'upgrade'
      };
    }

    // Si el trial está activo, permitir acceso
    if (isTrialActive) {
      return {
        isBlocked: false,
        reason: '',
        action: null
      };
    }

    // Fallback: bloquear por defecto
    return {
      isBlocked: true,
      reason: 'Necesitas activar tu plan PRO para usar esta función.',
      action: 'upgrade'
    };
  };

  // Verificaciones específicas para diferentes funciones
  const canCreateClients = () => checkAccess('clients');
  const canCreateProjects = () => checkAccess('projects');
  const canCreateAutomations = () => checkAccess('automations');
  const canCreateInvoices = () => checkAccess('invoices');
  const canCreateProposals = () => checkAccess('proposals');
  const canCreateTasks = () => checkAccess('tasks');
  const canUseTimeTracking = () => checkAccess('time-tracking');
  const canUseReports = () => checkAccess('reports');
  const canUseTemplates = () => checkAccess('templates');

  // Función para mostrar mensaje de bloqueo
  const getBlockedMessage = (restriction: AccessRestriction) => {
    if (!restriction.isBlocked) return null;
    
    return {
      title: 'Función Premium',
      message: restriction.reason,
      actionText: restriction.action === 'upgrade' ? 'Activar Plan PRO' : 'Renovar Plan',
      actionUrl: '/dashboard?upgrade=true'
    };
  };

  return {
    // Estados generales
    isPro,
    isTrialActive,
    isTrialExpired,
    daysRemaining,
    
    // Verificaciones de acceso
    canCreateClients,
    canCreateProjects,
    canCreateAutomations,
    canCreateInvoices,
    canCreateProposals,
    canCreateTasks,
    canUseTimeTracking,
    canUseReports,
    canUseTemplates,
    
    // Utilidades
    checkAccess,
    getBlockedMessage
  };
}
