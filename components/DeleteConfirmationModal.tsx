'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    budgetTitle: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    budgetTitle, 
    isDeleting = false 
}: DeleteConfirmationModalProps) {
    // Cerrar modal con Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Eliminar Presupuesto
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                        <p className="text-sm text-gray-600 mb-2">
                            ¿Estás seguro de que quieres eliminar este presupuesto?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-900">
                                {budgetTitle}
                            </p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. 
                                Se eliminarán todos los items del presupuesto y no podrás recuperar la información.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 bg-gray-50 px-6 py-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Eliminando...
                                </>
                            ) : (
                                'Eliminar Presupuesto'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
