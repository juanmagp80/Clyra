import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        // Test básico de configuración
        const resendKey = process.env.RESEND_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;
        
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            hasResendKey: !!resendKey,
            hasOpenAIKey: !!openaiKey,
            resendKeyLength: resendKey?.length || 0,
            message: 'Endpoint funcionando correctamente'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        return NextResponse.json({
            success: true,
            message: 'POST funcionando correctamente',
            receivedData: body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error en POST'
        }, { status: 500 });
    }
}
