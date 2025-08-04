'use client'
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { getBaseUrl } from '@/lib/url';
import { Building, Globe, Lock, Mail, Phone, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
    // Estados para autenticación
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    // Crear instancia del cliente de Supabase
    const supabase = createSupabaseClient();


    // Reemplaza la función register completa con esta versión corregida:

    const register = async () => {
        const now = Date.now();
        if (now - lastAttempt < 5000) {
            setError('Por favor espera 5 segundos antes de intentar de nuevo.');
            return;
        }
        if (process.env.NODE_ENV === 'production' && !captchaToken) {
            setError('Por favor completa el captcha');
            return;
        }
        setLastAttempt(now);
        setError('');
        setSuccess('');

        // Validaciones...
        if (!email || !password || !confirmPassword || !companyName) {
            setError('Por favor completa todos los campos obligatorios');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
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
                    setError('Has excedido el límite de intentos. Por favor espera unos minutos antes de intentar de nuevo.');
                } else {
                    setError(authError.message);
                }
                setLoading(false);
                return;
            }

            setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta. Los datos de tu empresa se configurarán automáticamente.');

            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            if (err.message?.includes('429') || err.message?.includes('rate')) {
                setError('Demasiados intentos de registro. Por favor espera 5-10 minutos antes de intentar de nuevo.');
            } else {
                setError('Error inesperado. Inténtalo de nuevo.');
            }
            console.error('Registration error:', err);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Crear cuenta en Clyra</CardTitle>
                    <CardDescription>
                        Únete a la plataforma CRM para profesionales independientes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                            {success}
                        </div>
                    )}

                    {/* Sección de cuenta */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Datos de cuenta</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contraseña *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmar contraseña *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección de empresa */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold text-gray-900">Datos de tu empresa</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre de la empresa *</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Mi Empresa S.L."
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email de empresa</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="contacto@miempresa.com (opcional)"
                                    value={companyEmail}
                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="tel"
                                    placeholder="+34 123 456 789"
                                    value={companyPhone}
                                    onChange={(e) => setCompanyPhone(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sitio web</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="url"
                                    placeholder="www.miempresa.com"
                                    value={companyWebsite}
                                    onChange={(e) => setCompanyWebsite(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Dirección</label>
                            <Input
                                type="text"
                                placeholder="Calle Ejemplo 123, Madrid"
                                value={companyAddress}
                                onChange={(e) => setCompanyAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={register}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={loading}
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-green-600 hover:underline font-medium">
                            Iniciar sesión
                        </Link>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                        * Campos obligatorios
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}