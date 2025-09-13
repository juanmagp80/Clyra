import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token de reCAPTCHA requerido' },
                { status: 400 }
            );
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey) {
            console.error('❌ RECAPTCHA_SECRET_KEY no está configurado');
            return NextResponse.json(
                { success: false, message: 'Configuración de reCAPTCHA no disponible' },
                { status: 500 }
            );
        }

        // Verificar el token con Google
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
        const verifyResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${token}`,
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
            return NextResponse.json({
                success: true,
                message: 'reCAPTCHA verificado correctamente',
                score: verifyData.score || null
            });
        } else {
            console.error('❌ Error verificando reCAPTCHA:', verifyData['error-codes']);
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'reCAPTCHA inválido',
                    errors: verifyData['error-codes'] 
                },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('❌ Error verificando reCAPTCHA:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}