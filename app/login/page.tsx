'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBaseUrl } from '@/lib/url';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { ArrowRight, Chrome, Eye, EyeOff, Github, Lock, Mail, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Componente interno que usa useSearchParams
function LoginPageContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Crear instancia del cliente de Supabase
    const supabase = createSupabaseClient();

    // ✅ Función para login con GitHub
    const loginWithGitHub = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!supabase) {
            setError('Para usar autenticación, configura Supabase en las variables de entorno.');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${getBaseUrl()}/auth/callback`
                }
            });

            if (error) {
                setError('Error al conectar con GitHub: ' + error.message);
            }
        } catch (err) {
            setError('Error de conexión con GitHub');
        }
        setLoading(false);
    };

    // ✅ Función para login con Google
    const loginWithGoogle = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!supabase) {
            setError('Para usar autenticación, configura Supabase en las variables de entorno.');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${getBaseUrl()}/auth/callback`
                }
            });

            if (error) {
                setError('Error al conectar con Google: ' + error.message);
            }
        } catch (err) {
            setError('Error de conexión con Google');
        }
        setLoading(false);
    };

    // ✅ Función para reenviar confirmación
    const resendConfirmation = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!supabase) {
            setError('Para usar autenticación, configura Supabase en las variables de entorno.');
            return;
        }

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
                emailRedirectTo: `${getBaseUrl()}/auth/callback`
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

    // ✅ Función de login
    const login = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!supabase) {
            setError('Para usar autenticación, configura Supabase en las variables de entorno.');
            return;
        }

        if (!email || !password) {
            setError('Por favor ingresa email y contraseña');
            return;
        }

        setError('');
        setLoading(true);

        try {
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
                router.push('/dashboard');
            } else {
                setError('Error inesperado durante el login');
            }
        } catch (err) {
            setError('Error de conexión. Verifica tu internet.');
        }

        setLoading(false);
    };

    // Manejo de errores de URL
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-slate-900 relative overflow-hidden">
            {/* Premium Silicon Valley Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(99,102,241,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.06),transparent_50%)]" />
                <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[size:32px_32px]" />

                {/* Elegant Floating Orbs */}
                <div className="absolute top-24 left-16 w-40 h-40 bg-gradient-to-br from-indigo-100/40 to-violet-100/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 right-24 w-56 h-56 bg-gradient-to-br from-violet-100/40 to-indigo-100/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/3 left-8 w-28 h-28 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Header */}
            <header className="relative z-10 p-6">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <h1 className="text-xl font-black tracking-tight relative">
                        <span className="relative text-slate-900">
                            Taskelio
                            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-80"></div>
                        </span>
                    </h1>
                </Link>
            </header>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
                <div className="w-full max-w-md">
                    {/* Premium Silicon Valley Card */}
                    <div className="relative bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl shadow-slate-900/5">
                        {/* Premium Border Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-transparent to-violet-50/80 rounded-3xl blur-sm -z-10"></div>

                        {/* Inner Premium Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-violet-50/30 rounded-3xl"></div>

                        {/* Professional Header */}
                        <div className="text-center mb-8 relative">
                            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/25 group">
                                <Lock className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                                {/* Premium Ring Animation */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </div>

                            <h1 className="text-3xl font-black mb-3 tracking-tight">
                                <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
                                    Bienvenido de vuelta
                                </span>
                            </h1>
                            <p className="text-slate-600 text-base leading-relaxed">
                                Accede a tu
                                <span className="text-indigo-600 font-semibold"> workspace profesional</span>
                            </p>
                        </div>

                        {/* Professional Alerts */}
                        {error && (
                            <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                <p className="text-emerald-700 text-sm font-medium">
                                    Email de confirmación reenviado. Revisa tu bandeja de entrada.
                                </p>
                            </div>
                        )}

                        {/* Premium Form Design */}
                        <form onSubmit={login} className="space-y-6">
                            {/* Email Field - Silicon Valley Style */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
                                    Dirección de Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300 pointer-events-none" />
                                    <Input
                                        type="email"
                                        placeholder="tu@empresa.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50/40 to-violet-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Password Field - Silicon Valley Style */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300 pointer-events-none" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 pr-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowPassword(!showPassword);
                                        }}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-300 p-1 rounded-lg hover:bg-slate-100 z-10"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50/40 to-violet-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Premium Login Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-700 hover:via-blue-700 hover:to-violet-700 text-white border-0 h-12 text-base font-bold rounded-xl shadow-xl shadow-indigo-500/25 group relative overflow-hidden"
                            >
                                {/* Premium Button Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                                {loading ? (
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Iniciando sesión...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span>Iniciar Sesión</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                )}
                            </Button>

                            {/* Professional Resend Button */}
                            {error && error.includes('confirma tu email') && (
                                <Button
                                    type="button"
                                    onClick={resendConfirmation}
                                    disabled={resendLoading}
                                    variant="ghost"
                                    className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 h-11 rounded-xl font-medium"
                                >
                                    {resendLoading ? 'Reenviando...' : 'Reenviar email de confirmación'}
                                </Button>
                            )}
                        </form>

                        {/* Premium Divider */}
                        <div className="my-8 flex items-center">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                            <div className="px-4 bg-white border border-slate-200 rounded-full shadow-sm">
                                <span className="text-sm text-slate-600 font-medium">O continúa con</span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        </div>

                        {/* Premium Social Login - TEMPORALMENTE DESACTIVADO */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <Button
                                type="button"
                                onClick={loginWithGitHub}
                                disabled={true}
                                variant="ghost"
                                className="border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed h-11 rounded-xl group transition-all duration-300 font-medium relative z-10 opacity-50"
                            >
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                            </Button>
                            <Button
                                type="button"
                                onClick={loginWithGoogle}
                                disabled={true}
                                variant="ghost"
                                className="border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed h-11 rounded-xl group transition-all duration-300 font-medium relative z-10 opacity-50"
                            >
                                <Chrome className="w-4 h-4 mr-2" />
                                Google
                            </Button>
                        </div>

                        {/* Professional Footer */}
                        <div className="text-center relative z-10">
                            <p className="text-slate-600">
                                ¿No tienes cuenta?{' '}
                                <Link
                                    href="/register"
                                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors relative z-10"
                                >
                                    Crear cuenta
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Premium Dashboard Stats */}
                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-900/5">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-black bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent">2K+</p>
                            <p className="text-xs text-slate-600 font-medium">Freelancers activos</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-900/5">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-black bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent">4.8★</p>
                            <p className="text-xs text-slate-600 font-medium">Calificación</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-900/5">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Mail className="w-5 h-5 text-violet-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-black bg-gradient-to-r from-slate-900 to-violet-700 bg-clip-text text-transparent">15h</p>
                            <p className="text-xs text-slate-600 font-medium">Tiempo ahorrado</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente principal con Suspense
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-slate-900 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-900/5">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-base text-slate-700 font-medium">Cargando...</span>
                    </div>
                </div>
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}