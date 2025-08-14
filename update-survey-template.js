// Script para actualizar el template de encuesta de satisfacción
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSatisfactionSurveyTemplate() {
    try {
        const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

        console.log('🔄 Actualizando template de encuesta de satisfacción...');

        // Nuevo template profesional para encuesta de satisfacción
        const professionalSurveyAction = {
            type: 'send_email',
            name: 'Enviar encuesta de satisfacción profesional',
            parameters: {
                subject: 'Encuesta de Satisfacción - {{client_company}}',
                template: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encuesta de Satisfacción</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Encuesta de Satisfacción
            </h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                Su opinión es muy importante para nosotros
            </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Personal Greeting -->
            <div style="margin-bottom: 30px;">
                <p style="font-size: 18px; margin: 0 0 15px 0; color: #1e293b;">
                    Estimado/a <strong style="color: #4f46e5;">{{client_name}}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #475569;">
                    Esperamos que esté completamente satisfecho/a con los servicios que hemos prestado para 
                    <strong>{{client_company}}</strong>. Su experiencia y feedback son fundamentales para 
                    continuar mejorando nuestros servicios.
                </p>
            </div>

            <!-- Survey Introduction -->
            <div style="background-color: #f1f5f9; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #4f46e5;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    📋 Evaluación de Servicios
                </h3>
                <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.5;">
                    Le agradecería mucho que dedicara unos minutos a evaluar nuestros servicios. 
                    Su feedback nos ayuda a mantener la excelencia en nuestro trabajo.
                </p>
            </div>

            <!-- Rating Questions -->
            <div style="margin: 30px 0;">
                <h3 style="color: #1e293b; font-size: 20px; margin: 0 0 25px 0; font-weight: 600;">
                    Por favor, califique los siguientes aspectos:
                </h3>

                <!-- Question 1 -->
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151; font-size: 16px;">
                        1. Calidad general del servicio recibido
                    </p>
                    <div style="display: flex; gap: 5px; margin: 10px 0;">
                        <span style="font-size: 24px;">⭐ ⭐ ⭐ ⭐ ⭐</span>
                        <span style="margin-left: 10px; color: #64748b; font-size: 14px;">(1 = Muy insatisfecho, 5 = Excelente)</span>
                    </div>
                </div>

                <!-- Question 2 -->
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151; font-size: 16px;">
                        2. Tiempo de respuesta y cumplimiento de plazos
                    </p>
                    <div style="display: flex; gap: 5px; margin: 10px 0;">
                        <span style="font-size: 24px;">⭐ ⭐ ⭐ ⭐ ⭐</span>
                        <span style="margin-left: 10px; color: #64748b; font-size: 14px;">(1 = Muy lento, 5 = Excelente)</span>
                    </div>
                </div>

                <!-- Question 3 -->
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151; font-size: 16px;">
                        3. Comunicación y atención profesional
                    </p>
                    <div style="display: flex; gap: 5px; margin: 10px 0;">
                        <span style="font-size: 24px;">⭐ ⭐ ⭐ ⭐ ⭐</span>
                        <span style="margin-left: 10px; color: #64748b; font-size: 14px;">(1 = Deficiente, 5 = Excelente)</span>
                    </div>
                </div>

                <!-- Question 4 -->
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin: 0 0 15px 0; font-weight: 600; color: #374151; font-size: 16px;">
                        4. ¿Recomendaría nuestros servicios a otros?
                    </p>
                    <div style="margin: 10px 0;">
                        <p style="margin: 5px 0; color: #475569; font-size: 15px;">
                            <strong>□ Definitivamente sí</strong> - Los recomendaría sin dudarlo
                        </p>
                        <p style="margin: 5px 0; color: #475569; font-size: 15px;">
                            <strong>□ Probablemente sí</strong> - Los recomendaría en general
                        </p>
                        <p style="margin: 5px 0; color: #475569; font-size: 15px;">
                            <strong>□ No estoy seguro/a</strong> - Necesito más experiencia
                        </p>
                        <p style="margin: 5px 0; color: #475569; font-size: 15px;">
                            <strong>□ Probablemente no</strong> - Algunas reservas
                        </p>
                        <p style="margin: 5px 0; color: #475569; font-size: 15px;">
                            <strong>□ Definitivamente no</strong> - No los recomendaría
                        </p>
                    </div>
                </div>
            </div>

            <!-- Open Comments -->
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    💬 Comentarios adicionales
                </h3>
                <p style="margin: 0 0 15px 0; color: #64748b; line-height: 1.6;">
                    Si desea compartir algún comentario específico, sugerencia de mejora, o cualquier 
                    aspecto que considera importante, por favor no dude en incluirlo en su respuesta.
                </p>
                <p style="margin: 0; color: #64748b; font-size: 14px; font-style: italic;">
                    Sus comentarios son confidenciales y se utilizan únicamente para mejorar nuestros servicios.
                </p>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="mailto:{{user_email}}?subject=Respuesta%20Encuesta%20-%20{{client_company}}&body=Estimado%2Fa%20{{user_name}}%2C%0A%0ACalificación%20servicios%3A%0A1.%20Calidad%20general%3A%20⭐⭐⭐⭐⭐%20%28escriba%20número%20del%201%20al%205%29%0A2.%20Tiempo%20de%20respuesta%3A%20⭐⭐⭐⭐⭐%20%28escriba%20número%20del%201%20al%205%29%0A3.%20Comunicación%3A%20⭐⭐⭐⭐⭐%20%28escriba%20número%20del%201%20al%205%29%0A4.%20Recomendaría%3A%20%28Sí%2FNo%2FTal%20vez%29%0A%0AComentarios%20adicionales%3A%0A%28Escriba%20aquí%20sus%20comentarios%29%0A%0ASaludos%2C%0A{{client_name}}" 
                   style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3); transition: all 0.3s ease;">
                    📝 Responder Encuesta
                </a>
                <p style="margin: 15px 0 0 0; color: #64748b; font-size: 13px;">
                    Haga clic en el botón para abrir su cliente de email con la encuesta pre-formateada
                </p>
            </div>

            <!-- Appreciation -->
            <div style="border-top: 2px solid #e2e8f0; padding-top: 25px; margin-top: 40px;">
                <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    <strong>Agradecemos sinceramente el tiempo que nos ha dedicado.</strong> 
                    Su colaboración y confianza son fundamentales para nuestro crecimiento y mejora continua.
                </p>
                <p style="margin: 0; color: #64748b; font-size: 15px;">
                    Si tiene alguna pregunta urgente o necesita asistencia inmediata, 
                    no dude en contactarnos directamente.
                </p>
            </div>
        </div>

        <!-- Professional Footer -->
        <div style="background-color: #1e293b; padding: 30px; text-align: center; color: #cbd5e1;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                {{user_name}}
            </p>
            <p style="margin: 0 0 5px 0; font-size: 14px;">
                {{user_email}}
            </p>
            <p style="margin: 0; font-size: 13px; opacity: 0.8;">
                Este email fue enviado como parte de nuestro proceso de mejora continua
            </p>
        </div>
    </div>
</body>
</html>`
            }
        };

        // Actualizar la automatización de encuesta de satisfacción
        const { error: updateError } = await supabase
            .from('automations')
            .update({
                actions: JSON.stringify([professionalSurveyAction])
            })
            .eq('user_id', userId)
            .eq('name', 'Encuesta de satisfacción');

        if (updateError) {
            console.error('❌ Error actualizando:', updateError);
            return;
        }

        console.log('✅ Template de encuesta actualizado exitosamente');
        console.log('📧 Ahora incluye:');
        console.log('   - Diseño profesional responsive');
        console.log('   - Preguntas de evaluación detalladas');
        console.log('   - Botón pre-formateado para responder');
        console.log('   - Email del usuario como remitente');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

updateSatisfactionSurveyTemplate();
