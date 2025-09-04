// utils/toast.ts
import { toast } from 'sonner';

// Configuración de toasts personalizada para tu app
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
      className: 'success-toast',
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
      className: 'error-toast',
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
      className: 'warning-toast',
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
      className: 'info-toast',
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      className: 'loading-toast',
    });
  },

  // Para reemplazar confirmaciones
  confirm: (message: string, description?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      toast(message, {
        description,
        action: {
          label: 'Confirmar',
          onClick: () => resolve(true),
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => resolve(false),
        },
        duration: 10000,
        className: 'confirm-toast',
        onDismiss: () => resolve(false),
      });
    });
  },

  // Para reemplazar prompts simples
  promise: <T,>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    });
  },
};

// Función para dismiss todos los toasts
export const dismissAllToasts = () => toast.dismiss();

// Función para dismiss un toast específico
export const dismissToast = (toastId: string | number) => toast.dismiss(toastId);

// Función de retrocompatibilidad para mantener la sintaxis antigua
export const showToastLegacy = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  return showToast[type](message);
};
