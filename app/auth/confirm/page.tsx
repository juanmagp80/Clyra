'use client'

import { AlertCircle, CheckCircle, Clock, Home, LogIn, Mail, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface ConfirmationResult {
    success: boolean;
    message: string;
    error?: string;
    code?: string;
}

function ConfirmEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [result, setResult] = useState<ConfirmationResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = searchParams.get('token');
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        // Si viene con éxito o error en la URL (desde redirect)
        if (success === 'true') {
            setResult({
                success: true,
                message: '¡Tu email ha sido confirmado exitosamente!'
            });
            setLoading(false);
            return;
        }

        if (error) {
            handleErrorCode(error);
            setLoading(false);
            return;
        }

        // Si viene con token, procesarlo
        if (token) {
            confirmEmailToken(token);
        } else {
            setResult({
                success: false,
                message: 'Enlace de confirmación inválido',
                error: 'No se proporcionó un token de confirmación válido.'
            });
            setLoading(false);
        }
    }, [searchParams]);

    const handleErrorCode = (errorCode: string) => {
        const errorMessages = {
            'INVALID_TOKEN': {
                message: 'Enlace de confirmación inválido',
                error: 'El enlace de confirmación no es válido o ha sido modificado.'
            },
            'TOKEN_ALREADY_USED': {
                message: 'Enlace ya utilizado',
                error: 'Este enlace de confirmación ya fue utilizado anteriormente.'
            },
            'TOKEN_EXPIRED': {
                message: 'Enlace expirado',
                error: 'El enlace de confirmación ha expirado. Por favor, regístrate nuevamente.'
            },
            'missing_token': {
                message: 'Enlace incompleto',
                error: 'El enlace de confirmación está incompleto.'
            },
            'server_error': {
                message: 'Error del servidor',
                error: 'Ocurrió un error interno. Por favor, intenta más tarde.'
            },
            'unknown_error': {
                message: 'Error desconocido',
                error: 'Ocurrió un error inesperado durante la confirmación.'
            }
        };

        const errorInfo = errorMessages[errorCode as keyof typeof errorMessages] || errorMessages.unknown_error;

        setResult({
            success: false,
            message: errorInfo.message,
            error: errorInfo.error,
            code: errorCode
        });
    };

    const confirmEmailToken = async (token: string) => {
        try {
            const response = await fetch('/api/auth/confirm-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    success: true,
                    message: '¡Tu email ha sido confirmado exitosamente!'
                });
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Error confirmando email',
                    error: data.error,
                    code: data.code
                });
            }
        } catch (error) {
            console.error('Error confirmando email:', error);
            setResult({
                success: false,
                message: 'Error de conexión',
                error: 'No se pudo conectar con el servidor. Por favor, intenta más tarde.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Confirmando tu email...
                    </h2>
                    <p className="text-gray-600">
                        Por favor espera mientras procesamos tu confirmación
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {result?.success ? (
                    <>
                        {/* Éxito */}
                        <div className="mb-6">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                ¡Email Confirmado!
                            </h1>
                            <p className="text-lg text-gray-600 mb-6">
                                {result.message}
                            </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                            <div className="flex items-center justify-center mb-3">
                                <Mail className="h-6 w-6 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold text-green-800">
                                    Tu cuenta está activada
                                </h3>
                            </div>
                            <p className="text-green-700 text-sm">
                                Ya puedes acceder a todas las funcionalidades de Taskelio.
                                ¡Comienza a gestionar tus proyectos y contratos!
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
                            >
                                <LogIn className="h-5 w-5 mr-2" />
                                Iniciar Sesión
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
                            >
                                <Home className="h-5 w-5 mr-2" />
                                Ir al Inicio
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Error */}
                        <div className="mb-6">
                            {result?.code === 'TOKEN_EXPIRED' ? (
                                <Clock className="h-20 w-20 text-orange-500 mx-auto mb-4" />
                            ) : result?.code === 'TOKEN_ALREADY_USED' ? (
                                <AlertCircle className="h-20 w-20 text-blue-500 mx-auto mb-4" />
                            ) : (
                                <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                            )}

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {result?.message || 'Error de Confirmación'}
                            </h1>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                            <p className="text-red-700 text-sm">
                                {result?.error || 'Ocurrió un error inesperado durante la confirmación.'}
                            </p>
                        </div>

                        {/* Diferentes acciones según el tipo de error */}
                        <div className="space-y-4">
                            {result?.code === 'TOKEN_EXPIRED' ? (
                                <>
                                    <button
                                        onClick={() => router.push('/register')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
                                    >
                                        Registrarse Nuevamente
                                    </button>
                                    <p className="text-sm text-gray-600">
                                        El enlace ha expirado. Regístrate nuevamente para recibir un nuevo enlace de confirmación.
                                    </p>
                                </>
                            ) : result?.code === 'TOKEN_ALREADY_USED' ? (
                                <>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
                                    >
                                        <LogIn className="h-5 w-5 mr-2" />
                                        Iniciar Sesión
                                    </button>
                                    <p className="text-sm text-gray-600">
                                        Tu cuenta ya está confirmada. Puedes iniciar sesión normalmente.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => router.push('/register')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
                                    >
                                        Intentar Nuevamente
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
                            >
                                <Home className="h-5 w-5 mr-2" />
                                Ir al Inicio
                            </button>
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        ¿Necesitas ayuda? Contacta con nuestro soporte técnico
                    </p>
                </div>
            </div>
        </div>
    );
}

// Forzar renderización dinámica para evitar errores de build
export const dynamic = 'force-dynamic';

export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Cargando...
                    </h2>
                    <p className="text-gray-600">
                        Preparando la confirmación de email
                    </p>
                </div>
            </div>
        }>
            <ConfirmEmailContent />
        </Suspense>
    );
}