import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 API send-email: Iniciando procesamiento...');
        const { to, subject, html, from, userId } = await request.json();
        
        console.log('📧 API send-email: Datos recibidos:', {
            to,
            subject,
            from,
            userId,
            htmlLength: html?.length,
            hasResendKey: !!process.env.RESEND_API_KEY
        });

        // Validar parámetros requeridos
        if (!to || !subject || !html) {
            console.log('❌ API send-email: Faltan parámetros requeridos');
            return NextResponse.json(
                { success: false, message: 'Faltan parámetros requeridos' },
                { status: 400 }
            );
        }

        // Verificar autenticación del usuario a través de headers
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll: () => {
                        const cookieHeader = request.headers.get('cookie');
                        return cookieHeader
                            ? cookieHeader.split('; ').map(cookie => {
                                const [name, ...rest] = cookie.split('=');
                                return { name, value: rest.join('=') };
                            })
                            : [];
                    },
                    setAll: () => {}, // No-op for server context
                }
            }
        );

        // Verificar que el usuario existe si se proporciona userId
        if (userId) {
            const { data: user } = await supabase.auth.admin.getUserById(userId);
            if (!user.user) {
                return NextResponse.json(
                    { success: false, message: 'Usuario no autorizado' },
                    { status: 403 }
                );
            }
        }

        // Si no tenemos API key de Resend, simular el envío
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ API send-email: RESEND_API_KEY no encontrada, simulando envío');
            console.log('📧 [SIMULADO] Email API route:', {
                to,
                subject,
                from: from || 'Clyra <onboarding@resend.dev>',
                htmlLength: html.length
            });

            return NextResponse.json({
                success: true,
                message: `Email simulado enviado a ${to}`,
                data: { 
                    id: 'simulated-' + Math.random().toString(36).substring(7),
                    simulated: true 
                }
            });
        }

        // Envío real con Resend
        console.log('🚀 API send-email: Enviando email real con Resend...');
        
        // Verificar si tenemos un dominio configurado
        const hasCustomDomain = process.env.RESEND_DOMAIN && process.env.RESEND_DOMAIN !== 'onboarding@resend.dev';
        const fromEmail = hasCustomDomain ? `noreply@${process.env.RESEND_DOMAIN}` : 'Clyra <onboarding@resend.dev>';
        
        if (!hasCustomDomain) {
            // Modo sandbox: solo enviar a email de prueba
            const testEmail = 'clyracrm@gmail.com';
            const originalTo = to;
            
            console.log('⚠️ API send-email: Modo sandbox activo - enviando a email de prueba', {
                originalTo: originalTo,
                actualTo: testEmail,
                subject: subject,
                from: fromEmail,
                note: 'Para enviar a clientes reales, configura RESEND_DOMAIN en .env.local'
            });

            // Modificar el HTML para indicar el destinatario original
            const modifiedHtml = `
                <div style="background: #f0f8ff; border: 1px solid #007acc; border-radius: 5px; padding: 15px; margin-bottom: 20px; font-family: Arial, sans-serif;">
                    <h3 style="color: #007acc; margin: 0 0 10px 0;">🧪 Email de Prueba - Clyra</h3>
                    <p style="margin: 0; font-size: 14px; line-height: 1.4;">
                        <strong>Email original destinado a:</strong> ${originalTo}<br>
                        <strong>Fecha:</strong> ${new Date().toLocaleString()}<br>
                        <strong>Modo:</strong> Sandbox (configurar dominio para envío real)
                    </p>
                </div>
                ${html}
            `;

            const { data, error } = await resend.emails.send({
                from: fromEmail,
                to: [testEmail],
                subject: `[PRUEBA] ${subject} (para: ${originalTo})`,
                html: modifiedHtml,
            });

            if (error) {
                console.error('❌ API send-email: Error enviando email de prueba:', error);
                return NextResponse.json(
                    { 
                        success: false, 
                        message: 'Error al enviar email de prueba',
                        error: error.message || JSON.stringify(error)
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `Email de prueba enviado a ${testEmail} (destinatario original: ${originalTo})`,
                data: {
                    ...data,
                    originalRecipient: originalTo,
                    testRecipient: testEmail,
                    mode: 'sandbox'
                }
            });
        } else {
            // Modo producción: enviar al destinatario real
            console.log('✅ API send-email: Modo producción - enviando a destinatario real', {
                to: to,
                subject: subject,
                from: fromEmail,
                domain: process.env.RESEND_DOMAIN,
                htmlLength: html.length
            });

            const { data, error } = await resend.emails.send({
                from: fromEmail,
                to: [to],
                subject: subject,
                html: html,
            });

            if (error) {
                console.error('❌ API send-email: Error enviando email real:', error);
                return NextResponse.json(
                    { 
                        success: false, 
                        message: 'Error al enviar email',
                        error: error.message || JSON.stringify(error)
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `Email enviado correctamente a ${to}`,
                data: {
                    ...data,
                    recipient: to,
                    mode: 'production'
                }
            });
        }

    } catch (error) {
        console.error('Error crítico en API send-email:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Error crítico al enviar email',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
