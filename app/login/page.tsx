"use client";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBaseUrl } from '@/lib/url';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, TrendingUp, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Componente interno que usa useSearchParams
function LoginPageContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    // Popup espectacular
    const [popup, setPopup] = useState({ show: false, type: "success", message: "" });
    const router = useRouter();
    const searchParams = useSearchParams();

    // Crear instancia del cliente de Supabase
    const supabase = createSupabaseClient();

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

    // Función de login con popup espectacular
    const login = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!supabase) {
            setPopup({ show: true, type: "error", message: "Para usar autenticación, configura Supabase en las variables de entorno." });
            return;
        }
        if (!email || !password) {
            setPopup({ show: true, type: "error", message: "Por favor ingresa email y contraseña" });
            return;
        }
        setError("");
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed") || error.message.includes("not confirmed")) {
                    setPopup({ show: true, type: "error", message: "Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada y spam." });
                } else if (error.message.includes("Invalid login credentials")) {
                    setPopup({ show: true, type: "error", message: "Email o contraseña incorrectos. Verifica tus datos." });
                } else {
                    setPopup({ show: true, type: "error", message: error.message });
                }
            } else if (data.session) {
                setPopup({ show: true, type: "success", message: "¡Login exitoso! Redirigiendo..." });
                setTimeout(() => {
                    setPopup({ ...popup, show: false });
                    router.push("/dashboard");
                }, 2000);
            } else {
                setPopup({ show: true, type: "error", message: "Error inesperado durante el login" });
            }
        } catch (err) {
            setPopup({ show: true, type: "error", message: "Error de conexión. Verifica tu internet." });
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
        <>
            {/* Popup espectacular */}
            {popup.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`relative p-8 max-w-md mx-4 rounded-3xl shadow-2xl transform transition-all duration-500 
                        ${popup.type === 'success'
                            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 text-white '
                            : 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 text-white '
                        }border border-white/20 backdrop-blur-lg`}
                        style={{ animation: 'fadeInScale 0.5s ease-out forwards' }}
                    >
                        <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
                        <button
                            onClick={() => setPopup({ ...popup, show: false })}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                            type="button"
                        >
                            <X size={18} />
                        </button>
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative ${popup.type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}
                            style={{ animation: 'pulse 2s infinite' }}>
                            {popup.type === 'success' ? (
                                <CheckCircle size={32} />
                            ) : (
                                <AlertCircle size={32} />
                            )}
                            <div className="absolute inset-0 rounded-full border-2 border-white/30" style={{ animation: 'ping 1s infinite' }}></div>
                            <div className="absolute inset-2 rounded-full border border-white/20" style={{ animation: 'ping 1s infinite', animationDelay: '0.5s' }}></div>
                        </div>
                        <div className="text-center relative z-10">
                            <h3 className="text-2xl font-bold mb-4">
                                {popup.type === 'success' ? '¡Bienvenido!' : '¡Ups!'}
                            </h3>
                            <p className="text-white/95 leading-relaxed text-lg whitespace-pre-line">
                                {popup.message}
                            </p>
                        </div>
                        {popup.type === 'success' && (
                            <div className="mt-6 bg-white/20 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-white h-2 rounded-full transition-all ease-out"
                                    style={{ width: '100%', animation: 'progressBar 2s ease-out forwards' }}
                                ></div>
                            </div>
                        )}
                        {popup.type === 'success' && (
                            <>
                                <div className="absolute top-8 left-8 w-2 h-2 bg-white/40 rounded-full" style={{ animation: 'bounce 2s infinite', animationDelay: '0.2s' }}></div>
                                <div className="absolute top-12 right-12 w-1 h-1 bg-white/60 rounded-full" style={{ animation: 'bounce 2s infinite', animationDelay: '0.8s' }}></div>
                                <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-white/50 rounded-full" style={{ animation: 'bounce 2s infinite', animationDelay: '1.2s' }}></div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* Fondo espectacular oscuro */}
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-purple-900/10 to-slate-900"></div>
                    <div className="absolute inset-0 opacity-20">
                        <div className="h-full w-full bg-repeat" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                    </div>
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 3s infinite' }}></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" style={{ animation: 'pulse 3s infinite', animationDelay: '2s' }}></div>
                    <div className="absolute top-3/4 left-1/6 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 3s infinite', animationDelay: '4s' }}></div>
                </div>
                {/* Header espectacular */}
                <header className="relative z-10 p-6">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <h1 className="text-xl font-black tracking-tight relative">
                            <span className="relative text-white">
                                Taskelio
                                <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-80"></div>
                            </span>
                        </h1>
                    </Link>
                </header>
                <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
                    <div className="w-full max-w-md">
                        {/* Tarjeta espectacular */}
                        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-900/10 rounded-3xl blur-sm -z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl"></div>
                            {/* Header profesional */}
                            <div className="text-center mb-8 relative">
                                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-2xl mb-6 shadow-xl shadow-purple-500/25 group">
                                    <Lock className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                </div>
                                <h1 className="text-3xl font-black mb-3 tracking-tight">
                                    <span className="bg-gradient-to-r from-white via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        Bienvenido de vuelta
                                    </span>
                                </h1>
                                <p className="text-slate-200 text-base leading-relaxed">
                                    Accede a tu
                                    <span className="text-pink-300 font-semibold"> workspace profesional</span>
                                </p>
                            </div>
                            {/* Mensajes de error y éxito */}
                            {error && (
                                <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                    <p className="text-red-200 text-sm font-medium">{error}</p>
                                </div>
                            )}
                            {resendSuccess && (
                                <div className="bg-emerald-500/20 border border-emerald-500 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                    <p className="text-emerald-200 text-sm font-medium">
                                        Email de confirmación reenviado. Revisa tu bandeja de entrada.
                                    </p>
                                </div>
                            )}
                            {/* Formulario espectacular */}
                            <form onSubmit={login} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                                        Dirección de Email
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400 group-focus-within:text-purple-400 transition-colors duration-300 pointer-events-none" />
                                        <Input
                                            type="email"
                                            placeholder="tu@empresa.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-pink-400 focus:ring-purple-100 h-12 text-base rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                                        Contraseña
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400 group-focus-within:text-purple-400 transition-colors duration-300 pointer-events-none" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Ingresa tu contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-pink-400 focus:ring-purple-100 h-12 text-base rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowPassword(!showPassword);
                                            }}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 z-10"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white border-0 h-12 text-base font-bold rounded-xl shadow-xl shadow-purple-500/25 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
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
                                {error && error.includes('confirma tu email') && (
                                    <Button
                                        type="button"
                                        onClick={resendConfirmation}
                                        disabled={resendLoading}
                                        variant="ghost"
                                        className="w-full border border-white/20 text-white hover:bg-white/10 h-11 rounded-xl font-medium"
                                    >
                                        {resendLoading ? 'Reenviando...' : 'Reenviar email de confirmación'}
                                    </Button>
                                )}
                            </form>
                            <div className="my-8 flex items-center">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                                <div className="px-4 bg-white/10 border border-white/20 rounded-full shadow-sm">
                                    <span className="text-sm text-white font-medium">O continúa con</span>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                <Button
                                    type="button"
                                    onClick={loginWithGoogle}
                                    disabled={loading}
                                    variant="ghost"
                                    className="w-full border border-white/20 text-white bg-white/10 cursor-pointer h-11 rounded-xl group transition-all duration-300 font-medium relative z-10 hover:bg-white/20"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Iniciar sesión con Google
                                </Button>
                            </div>
                            <div className="text-center relative z-10">
                                <p className="text-white/80">
                                    ¿No tienes cuenta?{' '}
                                    <Link
                                        href="/register"
                                        className="text-pink-300 hover:text-pink-400 font-semibold transition-colors relative z-10"
                                    >
                                        Crear cuenta
                                    </Link>
                                </p>
                            </div>
                        </div>
                        {/* Stats espectaculares */}
                        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-900/10">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-5 h-5 text-emerald-300" />
                                    </div>
                                </div>
                                <p className="text-2xl font-black bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">2K+</p>
                                <p className="text-xs text-white/80 font-medium">Freelancers activos</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-900/10">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-5 h-5 text-purple-300" />
                                    </div>
                                </div>
                                <p className="text-2xl font-black bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">4.8★</p>
                                <p className="text-xs text-white/80 font-medium">Calificación</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-900/10">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5 text-pink-300" />
                                    </div>
                                </div>
                                <p className="text-2xl font-black bg-gradient-to-r from-white to-pink-300 bg-clip-text text-transparent">15h</p>
                                <p className="text-xs text-white/80 font-medium">Tiempo ahorrado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
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