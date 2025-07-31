'use client';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const register = async () => {
        setError('');
        setSuccess('');

        if (!email || !password || !confirmPassword) {
            setError('Por favor completa todos los campos');
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

        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (!error) {
            setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            setError(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <Card className="w-full max-w-md">
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
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
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
                        <label className="text-sm font-medium">Contraseña</label>
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
                        <label className="text-sm font-medium">Confirmar contraseña</label>
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
                </CardContent>
            </Card>
        </div>
    );
}
