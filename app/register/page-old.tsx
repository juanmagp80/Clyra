'use client'
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { UserPlus, Sparkles, ArrowRight, Github, Chrome, Users, TrendingUp } from 'lucide-react';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { getBaseUrl } from '@/lib/url';
import { 
    X,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Mail,
    Lock,
    Building,
    Phone,
    Globe,
    MapPin
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
                        animate-in fade-in zoom-in-95 duration-500 ease-out
                    `}>
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
                            animate-pulse
                        `}>
                            {popupType === 'success' ? (
                                <CheckCircle size={32} className="animate-bounce" />
                            ) : (
                                <AlertCircle size={32} className="animate-pulse" />
                            )}
                            
                            {/* Anillos animados */}
                            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                            <div className="absolute inset-2 rounded-full border border-white/20 animate-ping" style={{animationDelay: '0.5s'}}></div>
                        </div>
                        
                        {/* Contenido */}
                        <div className="text-center relative z-10">
                            <h3 className="text-2xl font-bold mb-4">
                                {popupType === 'success' ? '¡Fantástico!' : '¡Ups!'}
                            </h3>
                            <p className="text-white/95 leading-relaxed whitespace-pre-line text-lg">
                                {popupMessage}
                            </p>
                        </div>
                        
                        {/* Barra de progreso para éxito */}
                        {popupType === 'success' && (
                            <div className="mt-6 bg-white/20 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-white h-2 rounded-full transition-all duration-4000 ease-out"
                                    style={{
                                        width: '100%',
                                        animation: 'progress 4s ease-out forwards'
                                    }}
                                ></div>
                            </div>
                        )}
                        
                        {/* Partículas flotantes */}
                        {popupType === 'success' && (
                            <>
                                <div className="absolute top-8 left-8 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="absolute top-12 right-12 w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
                                <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '1.2s'}}></div>
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
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-3/4 left-1/6 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
                    <div className="w-full max-w-6xl">
                        {/* Header espectacular */}
                        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full mb-6 shadow-2xl animate-pulse">
                                <Building size={40} className="text-white" />
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                            </div>
                            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                                Únete a la revolución
                            </h1>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Crea tu cuenta en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">Taskelio</span> y transforma tu manera de trabajar
                            </p>
                        </div>

                        {/* Formulario principal */}
                        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-12 animate-in fade-in slide-in-from-bottom duration-700">
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
        </>
    );
}

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