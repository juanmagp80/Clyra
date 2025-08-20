require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Template profesional para alerta de presupuesto excedido
const budgetAlertTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Presupuesto</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; max-width: 600px;">
                    
                    <!-- Header de alerta -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 25px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">⚠️ Alerta de Presupuesto</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Proyecto: <strong>{{project_name}}</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Información de contacto del responsable -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #fff3cd; border-bottom: 1px solid #ffeaa7;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 14px; color: #856404;">
                                            <strong>Responsable del proyecto:</strong> {{user_name}}<br>
                                            <strong>Email:</strong> {{user_email}}<br>
                                            <strong>Empresa:</strong> {{user_company}}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Contenido principal -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                                Estimado/a <strong>{{client_name}}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                Le informamos que el proyecto <strong>"{{project_name}}"</strong> ha alcanzado un nivel de gasto que requiere su atención inmediata.
                            </p>
                            
                            <!-- Detalles del presupuesto -->
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; border-left: 4px solid #dc3545; margin: 25px 0;">
                                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #dc3545; font-weight: 600;">
                                    📊 Estado del Presupuesto
                                </h3>
                                <table width="100%" cellpadding="8" cellspacing="0" border="0" style="font-size: 14px;">
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Presupuesto total:</td>
                                        <td style="color: #555; text-align: right;">{{budget_total}}€</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Gasto actual:</td>
                                        <td style="color: #dc3545; text-align: right; font-weight: 600;">{{budget_spent}}€</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Porcentaje utilizado:</td>
                                        <td style="color: #dc3545; text-align: right; font-weight: 600;">{{budget_percentage}}%</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333; font-weight: 600;">Presupuesto restante:</td>
                                        <td style="color: #555; text-align: right;">{{budget_remaining}}€</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                <strong>Recomendación:</strong> Es necesario revisar el alcance del proyecto o ajustar el presupuesto para continuar con las actividades planificadas.
                            </p>
                            
                            <!-- Call to action -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #007bff; border-radius: 6px; padding: 14px 28px;">
                                                    <a href="mailto:{{user_email}}?subject=Urgente: Revisión de presupuesto - {{project_name}}&body=Estimado/a {{user_name}},%0A%0AHe revisado la alerta de presupuesto del proyecto {{project_name}}.%0A%0ANecesito programar una reunión para:%0A- Revisar el estado actual%0A- Evaluar opciones de ajuste%0A- Definir próximos pasos%0A%0A¿Cuándo podríamos hablar?%0A%0ASaludos,%0A{{client_name}}" 
                                                       style="color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; display: block;">
                                                        💬 Contactar Responsable
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; font-size: 15px; color: #555555; line-height: 1.6;">
                                Estamos disponibles para analizar la situación y encontrar la mejor solución para continuar con el proyecto de manera eficiente.
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Información de contacto -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e8e8e8;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333333; font-weight: 600;">
                                📞 Información de Contacto
                            </h3>
                            <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                <strong>{{user_name}}</strong><br>
                                {{user_company}}<br>
                                Email: <a href="mailto:{{user_email}}" style="color: #007bff; text-decoration: none;">{{user_email}}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 20px 40px 30px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
                            <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.4;">
                                Alerta automática del sistema de gestión de {{user_company}}<br>
                                Para consultas, contáctenos en {{user_email}}
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`;

async function updateBudgetAlertTemplate() {
    try {
        console.log('📊 Actualizando template de alerta de presupuesto...');

        const { data: automation, error: getError } = await supabase
            .from('automations')
            .select('id')
            .ilike('name', '%presupuesto%')
            .single();

        if (getError) {
            console.error('❌ Error obteniendo automatización:', getError);
            return;
        }

        const budgetAction = {
            type: 'send_email',
            name: 'Enviar alerta de presupuesto excedido',
            parameters: {
                subject: '⚠️ Alerta de Presupuesto - {{project_name}} ({{budget_percentage}}% utilizado)',
                template: budgetAlertTemplate
            }
        };

        const { data, error } = await supabase
            .from('automations')
            .update({
                actions: JSON.stringify([budgetAction]),
                description: 'Alerta profesional cuando un proyecto supera el 80% del presupuesto asignado',
                updated_at: new Date().toISOString()
            })
            .eq('id', automation.id)
            .select();

        if (error) {
            console.error('❌ Error actualizando:', error);
        } else {
            console.log('✅ Template de alerta de presupuesto actualizado!');
            console.log('');
            console.log('🎯 Características del nuevo template:');
            console.log('  ⚠️ Header de alerta rojo profesional');
            console.log('  📊 Tabla detallada del estado del presupuesto');
            console.log('  👤 Información del responsable destacada');
            console.log('  💬 Botón para contacto directo');
            console.log('  📈 Variables para datos del proyecto');
            console.log('  🔔 Diseño de alerta sin ser spam');
            console.log('');
            console.log('📝 Variables disponibles:');
            console.log('  - {{project_name}} - Nombre del proyecto');
            console.log('  - {{budget_total}} - Presupuesto total');
            console.log('  - {{budget_spent}} - Cantidad gastada');
            console.log('  - {{budget_percentage}} - Porcentaje utilizado');
            console.log('  - {{budget_remaining}} - Presupuesto restante');
            console.log('  - {{user_name}}, {{user_email}}, {{user_company}}');
            console.log('  - {{client_name}}');
        }

    } catch (error) {
        console.error('❌ Error crítico:', error);
    }
}

updateBudgetAlertTemplate();
