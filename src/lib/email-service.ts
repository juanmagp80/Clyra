// Servicio de envío de emails usando API route
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
    userId?: string;
}

interface EmailResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

class EmailService {
    async sendEmail(options: EmailOptions): Promise<EmailResult> {
        try {
            console.log('📧 EmailService: Enviando email...', {
                to: options.to,
                subject: options.subject,
                from: options.from,
                userId: options.userId,
                htmlLength: options.html.length
            });

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    from: options.from || `Taskelio <noreply@${process.env.NEXT_PUBLIC_RESEND_DOMAIN || 'taskelio.app'}>`,
                    userId: options.userId
                }),
            });

            console.log('📧 EmailService: Respuesta de API:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            const result = await response.json();
            console.log('📧 EmailService: Datos de respuesta:', result);

            if (!response.ok) {
                console.error('❌ EmailService: Error en API send-email:', result);
                return {
                    success: false,
                    message: result.message || 'Error al enviar email',
                    error: result.error
                };
            }

            console.log('✅ EmailService: Email enviado exitosamente:', result);
            return result;

        } catch (error) {
            console.error('Error crítico en EmailService:', error);
            return {
                success: false,
                message: 'Error crítico al enviar email',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    convertTextToHtml(text: string): string {
        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.*)$/, '<p>$1</p>')
            .replace(/<p><\/p>/g, '');
    }

    // Método para verificar si está configurado (siempre true para client-side)
    isConfigured(): boolean {
        return true;
    }

    // Método para obtener el estado del servicio
    getStatus(): { configured: boolean; provider: string } {
        return {
            configured: true,
            provider: 'api-route'
        };
    }
}

// Exportar una instancia singleton
const emailService = new EmailService();
export default emailService;

