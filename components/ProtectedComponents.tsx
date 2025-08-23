import React from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, Crown } from 'lucide-react';
import { useAccessControl, AccessRestriction } from '@/src/lib/useAccessControl';

interface ProtectedButtonProps {
  feature: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function ProtectedButton({
  feature,
  onClick,
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false
}: ProtectedButtonProps) {
  const { checkAccess } = useAccessControl();
  const accessRestriction = checkAccess(feature);

  const handleClick = () => {
    if (accessRestriction.isBlocked) {
      // Redirigir a la página de upgrade
      window.location.href = '/dashboard?upgrade=true';
      return;
    }
    
    if (onClick && !disabled) {
      onClick();
    }
  };

  if (accessRestriction.isBlocked) {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        size={size}
        className={`relative border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 hover:text-amber-900 transition-all duration-300 ${className}`}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-600" />
          <span>Activar PRO</span>
          <Lock className="w-3 h-3 text-amber-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

interface ProtectedSectionProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedSection({
  feature,
  children,
  fallback
}: ProtectedSectionProps) {
  const { checkAccess } = useAccessControl();
  const accessRestriction = checkAccess(feature);

  if (accessRestriction.isBlocked) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">Función Premium</h3>
            <p className="text-sm text-amber-700">Desbloquea todas las funcionalidades</p>
          </div>
        </div>
        
        <p className="text-center text-amber-800 mb-6 max-w-md">
          {accessRestriction.reason}
        </p>
        
        <Button
          onClick={() => window.location.href = '/dashboard?upgrade=true'}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Crown className="w-4 h-4 mr-2" />
          Activar Plan PRO
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
