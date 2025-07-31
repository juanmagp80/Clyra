'use client';
import { createSupabaseClient } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createSupabaseClient();

    const login = async () => {
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (!error) {
            router.push('/dashboard');
        } else {
            setError(error.message);
        }
        setLoading(false);
    };

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
                                fontSize: '0.875rem',
                                paddingLeft: '2.5rem',
                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3e%3cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\' /%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: '0.75rem center',
                                backgroundSize: '1rem'
                            }}
                        />
                    </div>
                    
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
                            onKeyPress={(e) => e.key === 'Enter' && login()}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                paddingLeft: '2.5rem',
                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3e%3cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z\' /%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: '0.75rem center',
                                backgroundSize: '1rem'
                            }}
                        />
                    </div>

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
