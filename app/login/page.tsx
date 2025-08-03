'use client';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // ✅ Función para reenviar confirmación
    const resendConfirmation = async () => {
        if (!email) {
            setError('Por favor ingresa tu email primero');
            return;
        }

        setResendLoading(true);
        setError('');

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setResendSuccess(true);
            setError('');
            setTimeout(() => setResendSuccess(false), 5000);
        }

        setResendLoading(false);
    };

    // ✅ Función de login simplificada
    const login = async () => {
        setError('');
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            if (error.message.includes('Email not confirmed') ||
                error.message.includes('email_not_confirmed') ||
                error.message.includes('not confirmed')) {
                setError('Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada y spam.');
            } else if (error.message.includes('Invalid login credentials')) {
                setError('Email o contraseña incorrectos. Verifica tus datos.');
            } else {
                setError(error.message);
            }
        } else if (data.session) {
            // ✅ Solo redirigir si hay sesión
            window.location.href = '/dashboard'; // Usar window.location en lugar de router
        }

        setLoading(false);
    };

    // ✅ Solo manejo de errores de URL - SIN verificación de sesión
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            switch (errorParam) {
                case 'link_expired':
                    setError('El enlace de confirmación ha expirado. Solicita uno nuevo.');
                    break;
                case 'auth_error':
                    setError('Error en la autenticación. Inténtalo de nuevo.');
                    break;
                case 'session_error':
                    setError('Error creando la sesión. Inténtalo de nuevo.');
                    break;
                case 'user_error':
                    setError('Error obteniendo datos de usuario.');
                    break;
                case 'processing_error':
                    setError('Error procesando la confirmación.');
                    break;
                default:
                    setError('Error desconocido. Inténtalo de nuevo.');
            }
        }
    }, [searchParams]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
            fontFamily: 'system-ui, sans-serif',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '1.5rem'
                    }}>
                        🔐
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: '#1e293b'
                    }}>
                        Iniciar sesión en Clyra
                    </h1>
                    <p style={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        marginBottom: '2rem'
                    }}>
                        Accede a tu CRM profesional para freelancers
                    </p>
                </div>

                <div style={{ padding: '0 2rem 2rem' }}>
                    {/* Mensaje de error */}
                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.375rem',
                            color: '#dc2626',
                            fontSize: '0.875rem',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Mensaje de éxito */}
                    {resendSuccess && (
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '0.375rem',
                            color: '#166534',
                            fontSize: '0.875rem',
                            marginBottom: '1rem'
                        }}>
                            Email de confirmación reenviado. Revisa tu bandeja de entrada.
                        </div>
                    )}

                    {/* Campo Email */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            marginBottom: '0.25rem',
                            color: '#374151'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            marginBottom: '0.25rem',
                            color: '#374151'
                        }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && login()}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    {/* Botón Login */}
                    <button
                        onClick={login}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>

                    {/* Botón reenviar confirmación */}
                    {error && error.includes('confirma tu email') && (
                        <button
                            onClick={resendConfirmation}
                            disabled={resendLoading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: resendLoading ? '#f3f4f6' : '#f9fafb',
                                color: resendLoading ? '#9ca3af' : '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: resendLoading ? 'not-allowed' : 'pointer',
                                marginBottom: '1rem'
                            }}
                        >
                            {resendLoading ? 'Reenviando...' : 'Reenviar email de confirmación'}
                        </button>
                    )}

                    {/* Link a registro */}
                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#64748b'
                    }}>
                        ¿No tienes cuenta?{' '}
                        <Link
                            href="/register"
                            style={{
                                color: '#3b82f6',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Crear cuenta
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}