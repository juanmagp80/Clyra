'use client'
import { getBaseUrl } from '@/lib/url';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    AlertCircle,
    Building,
    CheckCircle,
    Eye,
    EyeOff,
    Globe,
    Lock,
    Mail,
    MapPin,
    Phone,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    const router = useRouter();
    const [captchaToken, setCaptchaToken] = useState('');

    // Estados para popup
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'error'>('success');
    const [popupMessage, setPopupMessage] = useState('');

    // Crear instancia del cliente de Supabase
    const supabase = createSupabaseClient();

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

        // Validaciones
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
        <>
            {/* Popup de notificación espectacular */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`
                        relative p-8 max-w-md mx-4 rounded-3xl shadow-2xl transform transition-all duration-500
                        ${popupType === 'success'
                            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 text-white'
                            : 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 text-white'
                        }
                        border border-white/20 backdrop-blur-lg
                    `} style={{
                            animation: 'fadeInScale 0.5s ease-out forwards'
                        }}>
                        {/* Efecto de cristal */}
                        <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>

                        {/* Botón cerrar */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                        >
                            <X size={18} />
                        </button>

                        {/* Icono animado */}
                        <div className={`
                            w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center relative
                            ${popupType === 'success' ? 'bg-white/20' : 'bg-white/20'}
                        `} style={{
                                animation: 'pulse 2s infinite'
                            }}>
                            {popupType === 'success' ? (
                                <CheckCircle size={32} style={{ animation: 'bounce 1s infinite' }} />
                            ) : (
                                <AlertCircle size={32} style={{ animation: 'pulse 2s infinite' }} />
                            )}

                            {/* Anillos animados */}
                            <div className="absolute inset-0 rounded-full border-2 border-white/30" style={{ animation: 'ping 1s infinite' }}></div>
                            <div className="absolute inset-2 rounded-full border border-white/20" style={{ animation: 'ping 1s infinite', animationDelay: '0.5s' }}></div>
                        </div>

                        {/* Contenido */}
                        <div className="text-center relative z-10">
                            <h3 className="text-2xl font-bold mb-4">
                                {popupType === 'success' ? '¡Fantástico!' : '¡Ups!'}
                            </h3>
                            <p className="text-white/95 leading-relaxed text-lg" style={{ whiteSpace: 'pre-line' }}>
                                {popupMessage}
                            </p>
                        </div>

                        {/* Barra de progreso para éxito */}
                        {popupType === 'success' && (
                            <div className="mt-6 bg-white/20 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-white h-2 rounded-full transition-all ease-out"
                                    style={{
                                        width: '100%',
                                        animation: 'progressBar 4s ease-out forwards'
                                    }}
                                ></div>
                            </div>
                        )}

                        {/* Partículas flotantes */}
                        {popupType === 'success' && (
                            <>
                                <div className="absolute top-8 left-8 w-2 h-2 bg-white/40 rounded-full" style={{ animation: 'bounce 2s infinite', animationDelay: '0.2s' }}></div>
                                <div className="absolute top-12 right-12 w-1 h-1 bg-white/60 rounded-full" style={{ animation: 'bounce 2s infinite', animationDelay: '0.8s' }}></div>
                                <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-white/50 rounded-full" style={{ animation: 'bounce 2s infinite', animationDelay: '1.2s' }}></div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Página principal con diseño espectacular */}
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
                {/* Fondo animado */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-purple-900/10 to-slate-900"></div>
                    <div className="absolute inset-0 opacity-20">
                        <div className="h-full w-full bg-repeat" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                    </div>

                    {/* Orbes flotantes */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 3s infinite' }}></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" style={{ animation: 'pulse 3s infinite', animationDelay: '2s' }}></div>
                    <div className="absolute top-3/4 left-1/6 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 3s infinite', animationDelay: '4s' }}></div>
                </div>

                <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
                    <div className="w-full max-w-6xl">
                        {/* Header espectacular */}
                        <div className="text-center mb-12" style={{ animation: 'fadeInUp 0.7s ease-out' }}>
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full mb-6 shadow-2xl relative" style={{ animation: 'pulse 3s infinite' }}>
                                <Building size={40} className="text-white" />
                                <div className="absolute inset-0 rounded-full bg-white/20" style={{ animation: 'ping 2s infinite' }}></div>
                            </div>
                            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                                Únete a la revolución
                            </h1>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Crea tu cuenta en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">Taskelio</span> y transforma tu manera de trabajar
                            </p>
                        </div>

                        {/* Formulario principal */}
                        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-12" style={{ animation: 'fadeInUp 0.7s ease-out', animationDelay: '0.2s' }}>
                            <form onSubmit={(e) => { e.preventDefault(); register(); }} className="space-y-8">
                                {/* Grid de campos */}
                                <div className="grid lg:grid-cols-2 gap-12">
                                    {/* Sección de cuenta */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                <Lock size={20} className="text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">Datos de acceso</h3>
                                        </div>

                                        {/* Email */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                <Mail size={16} className="mr-2 text-purple-400" />
                                                Email *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                             focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300
                                                             hover:bg-white/10 text-lg font-medium backdrop-blur-sm"
                                                    placeholder="tu@empresa.com"
                                                    required
                                                />
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>

                                        {/* Contraseña */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                <Lock size={16} className="mr-2 text-purple-400" />
                                                Contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-6 py-4 pr-14 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                             focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300
                                                             hover:bg-white/10 text-lg font-medium backdrop-blur-sm"
                                                    placeholder="Mínimo 6 caracteres"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>

                                        {/* Confirmar contraseña */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                <Lock size={16} className="mr-2 text-purple-400" />
                                                Confirmar contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-6 py-4 pr-14 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                             focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300
                                                             hover:bg-white/10 text-lg font-medium backdrop-blur-sm"
                                                    placeholder="Repetir contraseña"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección de empresa */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                                                <Building size={20} className="text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">Tu empresa</h3>
                                        </div>

                                        {/* Nombre empresa */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                <Building size={16} className="mr-2 text-pink-400" />
                                                Nombre de la empresa *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                             focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300
                                                             hover:bg-white/10 text-lg font-medium backdrop-blur-sm"
                                                    placeholder="Mi Empresa SL"
                                                    required
                                                />
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>

                                        {/* Email empresa */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                <Mail size={16} className="mr-2 text-pink-400" />
                                                Email empresarial
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={companyEmail}
                                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                             focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300
                                                             hover:bg-white/10 text-lg font-medium backdrop-blur-sm"
                                                    placeholder="info@miempresa.com"
                                                />
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>

                                        {/* Grid de campos opcionales */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                    <Phone size={16} className="mr-2 text-pink-400" />
                                                    Teléfono
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="tel"
                                                        value={companyPhone}
                                                        onChange={(e) => setCompanyPhone(e.target.value)}
                                                        className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                                 focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300
                                                                 hover:bg-white/10 text-lg font-medium backdrop-blur-sm"
                                                        placeholder="+34 xxx xxx"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                                </div>
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                    <Globe size={16} className="mr-2 text-pink-400" />
                                                    Web
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="url"
                                                        value={companyWebsite}
                                                        onChange={(e) => setCompanyWebsite(e.target.value)}
                                                        className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                                 focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300
                                                                 hover:bg-white/10 text-lg font-medium backdrop-blur-sm"
                                                        placeholder="miempresa.com"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dirección */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center">
                                                <MapPin size={16} className="mr-2 text-pink-400" />
                                                Dirección
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    value={companyAddress}
                                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                             focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300
                                                             hover:bg-white/10 text-lg font-medium backdrop-blur-sm resize-none"
                                                    placeholder="Calle Principal 123, Madrid, España"
                                                />
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de registro espectacular */}
                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 
                                                 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl transition-all duration-300
                                                 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 
                                                 hover:shadow-purple-500/25 hover:scale-[1.02] transform
                                                 focus:ring-4 focus:ring-purple-400/50 focus:outline-none
                                                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                                 text-xl"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            {loading ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                                    Creando tu cuenta...
                                                </>
                                            ) : (
                                                <>
                                                    <Building className="mr-3" size={24} />
                                                    Crear mi cuenta en Taskelio
                                                </>
                                            )}
                                        </span>

                                        {/* Efectos de hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-2xl"></div>
                                    </button>
                                </div>

                                {/* Link de login */}
                                <div className="text-center pt-8 border-t border-white/10">
                                    <p className="text-slate-300 text-lg">
                                        ¿Ya tienes cuenta?{' '}
                                        <a
                                            href="/login"
                                            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all duration-300 hover:underline"
                                        >
                                            Iniciar sesión aquí
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS inline para animaciones */}
            <style jsx global>{`
                @keyframes fadeInScale {
                    0% { 
                        opacity: 0; 
                        transform: scale(0.8) translate(-50%, -50%);
                    }
                    100% { 
                        opacity: 1; 
                        transform: scale(1) translate(-50%, -50%);
                    }
                }

                @keyframes progressBar {
                    0% { width: 0% }
                    100% { width: 100% }
                }

                @keyframes fadeInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-in {
                    animation-fill-mode: both;
                }

                .fade-in {
                    opacity: 0;
                }

                .fade-in.animate-in {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </>
    );
}
