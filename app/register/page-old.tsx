import { createSupabaseClient } from '@/src/lib/supabase-client';
import { getBaseUrl } from '@/lib/url';
import Link from 'next/link';
import { UserPlus, Lock, Mail, EyeOff, Eye, Building, Phone, Globe, Sparkles, ArrowRight, Github, Chrome, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    // Estados para autenticación
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [lastAttempt, setLastAttempt] = useState(0);

    // Estados para datos de empresa
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const [captchaToken, setCaptchaToken] = useState('');

    // Estados para popup
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'error'>('success');
    const [popupMessage, setPopupMessage] = useState('');

    // ✅ Función para registro con GitHub
    const registerWithGitHub = async () => {
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

    // ✅ Función para registro con Google
    const registerWithGoogle = async () => {
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

    // Crear instancia del cliente de Supabase
    const supabase = createSupabaseClient();


    // Reemplaza la función register completa con esta versión corregida:

    const register = async () => {
        if (!supabase) {
            setPopupType('error');
            setPopupMessage('Para usar autenticación, configura Supabase en las variables de entorno.');
            setShowPopup(true);
            return;
        }
        
        const now = Date.now();
        if (now - lastAttempt < 5000) {
            setPopupType('error');
            setPopupMessage('Por favor espera 5 segundos antes de intentar de nuevo.');
            setShowPopup(true);
            return;
        }
        if (process.env.NODE_ENV === 'production' && !captchaToken) {
            setPopupType('error');
            setPopupMessage('Por favor completa el captcha');
            setShowPopup(true);
            return;
        }
        setLastAttempt(now);
        setError('');
        setSuccess('');

        // Validaciones...
        if (!email || !password || !confirmPassword || !companyName) {
            setPopupType('error');
            setPopupMessage('Por favor completa todos los campos obligatorios');
            setShowPopup(true);
            return;
        }

        if (password !== confirmPassword) {
            setPopupType('error');
            setPopupMessage('Las contraseñas no coinciden');
            setShowPopup(true);
            return;
        }

        if (password.length < 6) {
            setPopupType('error');
            setPopupMessage('La contraseña debe tener al menos 6 caracteres');
            setShowPopup(true);
            return;
        }

        setLoading(true);

        try {
            // ✅ Agregar manejo específico para rate limiting
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${getBaseUrl()}/auth/callback`,
                    data: {
                        company_name: companyName,
                        company_email: companyEmail || email,
                        company_phone: companyPhone || '',
                        company_website: companyWebsite || '',
                        company_address: companyAddress || ''
                    }
                }
            });

            if (authError) {
                // ✅ Manejo específico para rate limiting
                if (authError.message.includes('429') || authError.message.includes('rate')) {
                    setPopupType('error');
                    setPopupMessage('Has excedido el límite de intentos. Por favor espera unos minutos antes de intentar de nuevo.');
                } else {
                    setPopupType('error');
                    setPopupMessage(authError.message);
                }
                setShowPopup(true);
                setLoading(false);
                return;
            }

            setPopupType('success');
            setPopupMessage('¡Cuenta creada exitosamente! 🎉\n\nRevisa tu email para confirmar tu cuenta. Los datos de tu empresa se configurarán automáticamente.');
            setShowPopup(true);

            setTimeout(() => {
                setShowPopup(false);
                router.push('/login');
            }, 4000);

        } catch (err: any) {
            if (err.message?.includes('429') || err.message?.includes('rate')) {
                setPopupType('error');
                setPopupMessage('Demasiados intentos de registro. Por favor espera 5-10 minutos antes de intentar de nuevo.');
            } else {
                setPopupType('error');
                setPopupMessage('Error inesperado. Inténtalo de nuevo.');
            }
            setShowPopup(true);
            console.error('Registration error:', err);
        }

        setLoading(false);
    };

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
                <div className="absolute bottom-40 right-24 w-56 h-56 bg-gradient-to-br from-violet-100/40 to-indigo-100/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute top-1/3 left-8 w-28 h-28 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
            </div>

            {/* Premium Header */}
            <header className="relative z-10 p-6">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <h1 className="text-xl font-black tracking-tight relative">
                        <span className="relative text-slate-900">
                            Taskelio
                            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-80"></div>
                        </span>
                    </h1>
                    <span className="text-xs bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded-full font-medium">
                        BETA
                    </span>
                </Link>
            </header>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
                <div className="w-full max-w-4xl">
                    {/* Premium Silicon Valley Card */}
                    <div className="relative bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl shadow-slate-900/5">
                        {/* Premium Border Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-transparent to-violet-50/80 rounded-3xl blur-sm -z-10"></div>
                        
                        {/* Inner Premium Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-violet-50/30 rounded-3xl"></div>
                        
                        {/* Professional Header */}
                        <div className="text-center mb-8 relative">
                            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/25 group">
                                <UserPlus className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                                {/* Premium Ring Animation */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </div>
                            
                            <h1 className="text-3xl font-black mb-3 tracking-tight">
                                <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
                                    Únete a Taskelio
                                </span>
                            </h1>
                            <p className="text-slate-600 text-base leading-relaxed">
                                Crea tu 
                                <span className="text-indigo-600 font-semibold"> workspace profesional</span> en segundos
                            </p>
                        </div>

                        {/* Professional Alerts */}
                        {error && (
                            <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                <p className="text-emerald-700 text-sm font-medium">{success}</p>
                            </div>
                        )}

                        {/* Premium Form Design */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Account Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Detalles de Cuenta</h3>
                                </div>

                                {/* Email Field - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
                                        Dirección de Email *
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
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

                                {/* Password Field - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
                                        Contraseña *
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 6 caracteres"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-300 p-1 rounded-lg hover:bg-slate-100"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50/40 to-violet-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Confirm Password Field - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
                                        Confirmar Contraseña *
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Repite tu contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-12 pr-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-300 p-1 rounded-lg hover:bg-slate-100"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50/40 to-violet-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Company Section - Premium Style */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                        <Building className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Detalles de Empresa</h3>
                                    <span className="text-xs bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 text-violet-700 px-3 py-1 rounded-full font-medium">Opcional</span>
                                </div>

                                {/* Company Name - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
                                        Nombre de Empresa
                                    </label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-300" />
                                        <Input
                                            type="text"
                                            placeholder="Tu Empresa S.L."
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="pl-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-50/40 to-indigo-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Company Email - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
                                        Email de Empresa
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-300" />
                                        <Input
                                            type="email"
                                            placeholder="contacto@tuempresa.com"
                                            value={companyEmail}
                                            onChange={(e) => setCompanyEmail(e.target.value)}
                                            className="pl-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-50/40 to-indigo-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Phone - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
                                        Número de Teléfono
                                    </label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-300" />
                                        <Input
                                            type="tel"
                                            placeholder="+34 123 456 789"
                                            value={companyPhone}
                                            onChange={(e) => setCompanyPhone(e.target.value)}
                                            className="pl-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-50/40 to-indigo-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Website - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
                                        Sitio Web
                                    </label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-300" />
                                        <Input
                                            type="url"
                                            placeholder="www.tuempresa.com"
                                            value={companyWebsite}
                                            onChange={(e) => setCompanyWebsite(e.target.value)}
                                            className="pl-12 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-50/40 to-indigo-50/40 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Address - Premium Style */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
                                        Dirección
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Calle Ejemplo 123, Madrid"
                                        value={companyAddress}
                                        onChange={(e) => setCompanyAddress(e.target.value)}
                                        className="bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-100 h-12 text-base rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Premium Create Account Button */}
                        <div className="mt-8">
                            <Button
                                type="button"
                                onClick={register}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-700 hover:via-blue-700 hover:to-violet-700 text-white border-0 h-12 text-base font-bold rounded-xl shadow-xl shadow-indigo-500/25 group relative overflow-hidden"
                            >
                                {/* Premium Button Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                
                                {loading ? (
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creando cuenta...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 relative z-10">
                                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>Crear Cuenta</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                )}
                            </Button>
                        </div>

                        {/* Premium Divider */}
                        <div className="my-8 flex items-center">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                            <div className="px-4 bg-white border border-slate-200 rounded-full shadow-sm">
                                <span className="text-sm text-slate-600 font-medium">O regístrate con</span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        </div>

                        {/* Premium Social Login - TEMPORALMENTE DESACTIVADO */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <Button
                                type="button"
                                onClick={registerWithGitHub}
                                disabled={true}
                                variant="ghost"
                                className="border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed h-11 rounded-xl group transition-all duration-300 font-medium relative z-10 opacity-50"
                            >
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                            </Button>
                            <Button
                                type="button"
                                onClick={registerWithGoogle}
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
                            <p className="text-slate-600 mb-4">
                                ¿Ya tienes cuenta?{' '}
                                <Link 
                                    href="/login" 
                                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors relative z-10"
                                >
                                    Iniciar sesión
                                </Link>
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad
                            </p>
                        </div>
                    </div>

                    {/* Premium Features */}
                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-900/5">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-900">Prueba gratuita 14 días</p>
                            <p className="text-xs text-slate-600 font-medium">Sin tarjeta requerida</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-900/5">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-900">2K+ usuarios</p>
                            <p className="text-xs text-slate-600 font-medium">Confían en nosotros</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-4 group hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-900/5">
                            <div className="flex items-center justify-center mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-5 h-5 text-violet-600" />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-900">15h ahorradas</p>
                            <p className="text-xs text-slate-600 font-medium">Por semana promedio</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}