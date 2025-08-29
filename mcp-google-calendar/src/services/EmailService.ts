import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export class EmailService {
  public transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Enviar recordatorio de reunión por email
   */
  async sendMeetingReminder(params: {
    recipientEmail: string;
    recipientName: string;
    meetingTitle: string;
    meetingDate: Date;
    meetingLocation?: string;
    reminderType: '1_hour' | '3_hours' | '24_hours';
    professionalName?: string;
    meetingDescription?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const timeText = this.getReminderTimeText(params.reminderType);
      const dateText = params.meetingDate.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const subject = `Recordatorio: ${params.meetingTitle} ${timeText}`;
      
      const htmlContent = this.generateEmailTemplate({
        recipientName: params.recipientName,
        meetingTitle: params.meetingTitle,
        meetingDate: dateText,
        meetingLocation: params.meetingLocation,
        reminderType: params.reminderType,
        professionalName: params.professionalName || 'Su profesional',
        meetingDescription: params.meetingDescription,
        timeText,
      });

      const textContent = this.generateTextContent({
        recipientName: params.recipientName,
        meetingTitle: params.meetingTitle,
        meetingDate: dateText,
        meetingLocation: params.meetingLocation,
        timeText,
        professionalName: params.professionalName || 'Su profesional',
      });

      const mailOptions = {
        from: `"Taskelio - Recordatorios" <${config.email.user}>`,
        to: params.recipientEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (config.debug) {
        console.log('✅ Email enviado exitosamente:', info.messageId);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error enviando email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Obtener texto descriptivo del tiempo de recordatorio
   */
  private getReminderTimeText(reminderType: string): string {
    switch (reminderType) {
      case '1_hour':
        return 'en 1 hora';
      case '3_hours':
        return 'en 3 horas';
      case '24_hours':
        return 'mañana';
      default:
        return 'próximamente';
    }
  }

  /**
   * Generar template HTML para el email
   */
  private generateEmailTemplate(params: {
    recipientName: string;
    meetingTitle: string;
    meetingDate: string;
    meetingLocation?: string;
    reminderType: string;
    professionalName: string;
    meetingDescription?: string;
    timeText: string;
  }): string {
    const urgencyColor = params.reminderType === '1_hour' ? '#ff6b6b' : '#4ecdc4';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Reunión</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: linear-gradient(135deg, ${urgencyColor}, #45b7d1); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📅 Recordatorio de Reunión</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Su cita ${params.timeText}</p>
      </div>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid ${urgencyColor};">
        <h2 style="color: #2c3e50; margin-top: 0;">Hola ${params.recipientName},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Le recordamos que tiene una reunión programada <strong>${params.timeText}</strong>:
        </p>

        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: ${urgencyColor}; margin-top: 0;">📋 Detalles de la Reunión</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px; color: #555;">Título:</td>
              <td style="padding: 8px 0;">${params.meetingTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Fecha y hora:</td>
              <td style="padding: 8px 0;">${params.meetingDate}</td>
            </tr>
            ${params.meetingLocation ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Ubicación:</td>
              <td style="padding: 8px 0;">${params.meetingLocation}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Con:</td>
              <td style="padding: 8px 0;">${params.professionalName}</td>
            </tr>
          </table>
        </div>

        ${params.meetingDescription ? `
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #2c3e50; margin-top: 0;">📝 Información adicional:</h4>
          <p style="margin: 0;">${params.meetingDescription}</p>
        </div>
        ` : ''}

        <div style="background: #e8f4f8; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #2c3e50;">
            💡 <strong>Consejo:</strong> Le recomendamos llegar unos minutos antes de la hora programada.
          </p>
        </div>

        <p style="margin-bottom: 0;">
          Si necesita reprogramar o cancelar esta reunión, por favor contáctenos lo antes posible.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          Este es un recordatorio automático enviado por <strong>Taskelio</strong><br>
          Sistema de gestión de citas profesionales
        </p>
      </div>

    </body>
    </html>
    `;
  }

  /**
   * Generar contenido en texto plano para el email
   */
  private generateTextContent(params: {
    recipientName: string;
    meetingTitle: string;
    meetingDate: string;
    meetingLocation?: string;
    timeText: string;
    professionalName: string;
  }): string {
    return `
RECORDATORIO DE REUNIÓN

Hola ${params.recipientName},

Le recordamos que tiene una reunión programada ${params.timeText}:

DETALLES DE LA REUNIÓN:
- Título: ${params.meetingTitle}
- Fecha y hora: ${params.meetingDate}
${params.meetingLocation ? `- Ubicación: ${params.meetingLocation}\n` : ''}- Con: ${params.professionalName}

Por favor, llegue unos minutos antes de la hora programada.

Si necesita reprogramar o cancelar esta reunión, contáctenos lo antes posible.

---
Este es un recordatorio automático enviado por Taskelio
Sistema de gestión de citas profesionales
    `.trim();
  }

  /**
   * Verificar configuración del servicio de email
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Error verificando conexión de email:', error);
      return false;
    }
  }

  /**
   * Enviar email de prueba
   */
  async sendTestEmail(recipientEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const mailOptions = {
        from: `"Taskelio - Test" <${config.email.user}>`,
        to: recipientEmail,
        subject: 'Prueba de Conexión - Taskelio MCP Server',
        text: 'Este es un email de prueba para verificar la configuración del servidor MCP Google Calendar.',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>✅ Prueba de Conexión Exitosa</h2>
            <p>Este es un email de prueba para verificar la configuración del servidor MCP Google Calendar.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <p><strong>Servidor:</strong> MCP Google Calendar Server</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }
}
