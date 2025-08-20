require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Template de email marketing profesional - siguiendo mejores prácticas anti-spam
const professionalEmailTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encuesta de Satisfacción</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    
    <!-- Container principal -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                
                <!-- Email content wrapper -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 30px 40px 20px 40px; border-bottom: 3px solid #e8e8e8;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; font-size: 24px; color: #333333; font-weight: 600; line-height: 1.3;">
                                            Encuesta de Satisfacción
                                        </h1>
                                        <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666; font-weight: normal;">
                                            {{user_company}}
                                        </p>
                                    </td>
                                    <td align="right" valign="top">
                                        <div style="background-color: #f8f9fa; padding: 8px 12px; border-radius: 4px; border-left: 3px solid #007bff;">
                                            <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.4;">
                                                <strong>De:</strong> {{user_name}}<br>
                                                <strong>Email:</strong> {{user_email}}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main content -->
                    <tr>
                        <td style="padding: 35px 40px;">
                            
                            <!-- Saludo personalizado -->
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                                Estimado/a <strong>{{client_name}}</strong>,
                            </p>
                            
                            <!-- Mensaje principal -->
                            <p style="margin: 0 0 25px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                Esperamos que esté completamente satisfecho con nuestros servicios. Su opinión es fundamental para nosotros y nos ayuda a mejorar continuamente la calidad de nuestro trabajo.
                            </p>
                            
                            <!-- Pregunta principal -->
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; border-left: 4px solid #007bff; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-size: 16px; color: #333333; font-weight: 600;">
                                    ¿Cómo calificaría nuestros servicios?
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.5;">
                                    Por favor, responda con una calificación del 1 al 5, donde 5 representa "Excelente" y 1 "Necesita mejorar".
                                </p>
                            </div>
                            
                            <!-- Call to action -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #007bff; border-radius: 6px; padding: 14px 28px;">
                                                    <a href="mailto:{{user_email}}?subject=Respuesta: Encuesta de Satisfacción&body=Estimado/a {{user_name}},%0A%0AMi calificación de sus servicios es: ___/5%0A%0AComentarios adicionales:%0A%0A%0A%0ASaludos cordiales,%0A{{client_name}}" 
                                                       style="color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; display: block;">
                                                        Responder Encuesta
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Texto alternativo -->
                            <p style="margin: 0 0 30px 0; font-size: 13px; color: #888888; text-align: center; line-height: 1.5;">
                                También puede responder directamente a este email con su calificación y comentarios.
                            </p>
                            
                            <!-- Agradecimiento -->
                            <p style="margin: 0; font-size: 15px; color: #555555; line-height: 1.6;">
                                Agradecemos sinceramente el tiempo que dedique a completar esta breve encuesta.
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Contact info section -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e8e8e8;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333333; font-weight: 600;">
                                            Información de Contacto
                                        </h3>
                                        <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                            <strong>{{user_name}}</strong><br>
                                            {{user_company}}<br>
                                            Email: <a href="mailto:{{user_email}}" style="color: #007bff; text-decoration: none;">{{user_email}}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 20px 40px 30px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
                            <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.4;">
                                Este mensaje fue enviado por {{user_company}}<br>
                                Para cualquier consulta, contáctenos en {{user_email}}
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`;

async function updateToProfessionalTemplate() {
    try {
        console.log('🎨 Actualizando a template de email marketing profesional...');

        // Actualizar la automatización profesional que creamos
        const automationId = '6db8dde2-2d89-45c4-8009-f2414df858f8';

        const professionalAction = {
            type: 'send_email',
            name: 'Enviar email de encuesta profesional',
            parameters: {
                subject: 'Encuesta de Satisfacción - {{user_company}}',
                template: professionalEmailTemplate
            }
        };

        const { data, error } = await supabase
            .from('automations')
            .update({
                actions: JSON.stringify([professionalAction]),
                name: 'Encuesta de Satisfacción - Email Marketing Pro',
                description: 'Template profesional de email marketing optimizado para evitar spam',
                updated_at: new Date().toISOString()
            })
            .eq('id', automationId)
            .select();

        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ ¡Template de email marketing profesional aplicado!');
            console.log('');
            console.log('🎯 Características del nuevo diseño:');
            console.log('  📧 Formato HTML con tablas (estándar email marketing)');
            console.log('  🎨 Colores neutros y profesionales');
            console.log('  🚫 Sin elementos llamativos que activen filtros spam');
            console.log('  📱 Responsive design para móviles');
            console.log('  ✉️ Estructura de email corporativo estándar');
            console.log('  🔗 Botón CTA profesional y discreto');
            console.log('  📝 Texto optimizado para deliverability');
            console.log('  👤 Información de contacto elegante');
            console.log('');
            console.log('🎉 Listo para alta tasa de entrega y conversión!');
        }

    } catch (error) {
        console.error('❌ Error crítico:', error);
    }
}

updateToProfessionalTemplate();
