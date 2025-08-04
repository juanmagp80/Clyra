'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Error de Autenticación
                    </CardTitle>
                    <CardDescription>
                        Ha ocurrido un problema durante el proceso de autenticación.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>Posibles causas:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>El enlace de confirmación ha expirado</li>
                            <li>El enlace ya fue utilizado</li>
                            <li>Error de conexión temporal</li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <Link href="/login">
                            <Button className="w-full">Volver al Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" className="w-full">
                                Crear Nueva Cuenta
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
