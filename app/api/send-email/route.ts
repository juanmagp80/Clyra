import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        console.log('📧 API send-email: Iniciando envío...');

        if (!process.env.RESEND_API_KEY) {
            console.error('❌ RESEND_API_KEY no configurada');
            return NextResponse.json({
                success: false,
                message: 'Servicio de email no configurado',
                error: 'RESEND_API_KEY no encontrada'
            }, { status: 500 });
        }

        const body = await request.json();
        const { to, subject, html, from, reply_to, userId } = body;

        console.log('📧 API send-email: Datos recibidos:', {
            to,
            subject,
            from,
            reply_to,
            userId,
            htmlLength: html?.length
        });

        // Validar datos requeridos
        if (!to || !subject || !html) {
            return NextResponse.json({
                success: false,
                message: 'Faltan datos requeridos: to, subject, html',
                error: 'Datos incompletos'
            }, { status: 400 });
        }

        // Configurar remitente por defecto
        const defaultFrom = `Taskelio <noreply@${process.env.NEXT_PUBLIC_RESEND_DOMAIN || 'taskelio.app'}>`;
        const fromEmail = from || defaultFrom;

        // Preparar datos para Resend
        const emailData: any = {
            from: fromEmail,
            to: [to],
            subject: subject,
            html: html,
        };

        // Agregar reply_to si está presente
        if (reply_to) {
            emailData.reply_to = [reply_to];
        }

        console.log('📧 API send-email: Enviando con Resend...', {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            reply_to: emailData.reply_to
        });

        // Enviar email con Resend
        const result = await resend.emails.send(emailData);

        console.log('📧 API send-email: Respuesta de Resend:', result);

        if (result.error) {
            console.error('❌ Error de Resend:', result.error);
            return NextResponse.json({
                success: false,
                message: 'Error enviando email',
                error: result.error.message || result.error
            }, { status: 500 });
        }

        console.log('✅ Email enviado exitosamente:', result.data?.id);

        return NextResponse.json({
            success: true,
            message: 'Email enviado exitosamente',
            data: {
                id: result.data?.id,
                to: to,
                subject: subject,
                from: fromEmail
            }
        });

    } catch (error: any) {
        console.error('💥 Error crítico en send-email:', error);

        return NextResponse.json({
            success: false,
            message: 'Error crítico enviando email',
            error: error.message || 'Error desconocido'
        }, { status: 500 });
    }
}
