// Script para crear automatizaciones de ejemplo con acciones completas
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan variables de entorno de Supabase');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleAutomations() {
    try {
        console.log('🔍 Obteniendo usuarios existentes...');

        // Obtener todos los usuarios para crear automatizaciones
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('❌ Error obteniendo usuarios:', authError);
            return;
        }

        if (!authUsers.users || authUsers.users.length === 0) {
            console.log('⚠️ No hay usuarios en el sistema');
            return;
        }

        const user = authUsers.users[0]; // Usar el primer usuario
        console.log(`👤 Creando automatizaciones para usuario: ${user.email}`);

        // Definir automatizaciones de ejemplo
        const sampleAutomations = [
            {
                user_id: user.id,
                name: 'Encuesta de satisfacción',
                description: 'Enviar encuesta de satisfacción después de completar un proyecto',
                trigger_type: 'satisfaction_survey',
                trigger_conditions: JSON.stringify([
                    {
                        field: 'project_status',
                        operator: 'equals',
                        value: 'completed'
                    }
                ]),
                actions: JSON.stringify([
                    {
                        type: 'send_email',
                        name: 'Enviar encuesta de satisfacción',
                        parameters: {
                            subject: 'Encuesta de Satisfacción - {{client_company}}',
                            template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">Encuesta de Satisfacción</h1>
            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Tu opinión es muy importante para nosotros</p>
        </div>

        <!-- Greeting -->
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Estimado/a <strong>{{client_name}}</strong>,
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Esperamos que esté satisfecho/a con nuestros servicios. Para continuar mejorando, nos gustaría conocer su opinión sobre la calidad de nuestro trabajo.
        </p>

        <!-- Survey Questions -->
        <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 18px;">Por favor, evalúe los siguientes aspectos:</h3>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; color: #374151; font-weight: bold;">1. Calidad del servicio recibido:</p>
                <p style="margin: 0; color: #64748b;">⭐ ⭐ ⭐ ⭐ ⭐ (Del 1 al 5)</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; color: #374151; font-weight: bold;">2. Tiempo de respuesta:</p>
                <p style="margin: 0; color: #64748b;">⭐ ⭐ ⭐ ⭐ ⭐ (Del 1 al 5)</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; color: #374151; font-weight: bold;">3. Comunicación y atención:</p>
                <p style="margin: 0; color: #64748b;">⭐ ⭐ ⭐ ⭐ ⭐ (Del 1 al 5)</p>
            </div>
            
            <div>
                <p style="margin: 0 0 8px 0; color: #374151; font-weight: bold;">4. ¿Recomendaría nuestros servicios?</p>
                <p style="margin: 0; color: #64748b;">□ Sí, definitivamente  □ Probablemente  □ No estoy seguro/a  □ Probablemente no  □ Definitivamente no</p>
            </div>
        </div>

        <!-- Comments Section -->
        <div style="margin: 25px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Comentarios adicionales:</h3>
            <p style="color: #64748b; margin: 0; font-style: italic;">
                Si desea agregar algún comentario o sugerencia, no dude en responder a este email. 
                Valoramos mucho su feedback.
            </p>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:{{user_name}}?subject=Respuesta%20Encuesta%20-%20{{client_company}}" 
               style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Responder Encuesta
            </a>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Gracias por confiar en nuestros servicios.<br>
                <strong>{{user_name}}</strong>
            </p>
        </div>
    </div>
</div>`,
                            variables: {
                                survey_url: 'https://forms.google.com/survey'
                            }
                        }
                    }
                ]),
                status: 'active',
                execution_count: 0
            },
            {
                user_id: user.id,
                name: 'Recordatorio de pago',
                description: 'Enviar recordatorio cuando una factura está vencida',
                trigger_type: 'payment_reminder',
                trigger_conditions: JSON.stringify([
                    {
                        field: 'invoice_status',
                        operator: 'equals',
                        value: 'overdue'
                    }
                ]),
                actions: JSON.stringify([
                    {
                        type: 'send_email',
                        name: 'Recordatorio de pago',
                        parameters: {
                            subject: 'Recordatorio de Pago - {{client_company}}',
                            template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 28px;">Recordatorio de Pago</h1>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Estimado/a <strong>{{client_name}}</strong>,
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Le recordamos que tiene una factura pendiente de pago. Por favor, revise los detalles y proceda con el pago a la mayor brevedad posible.
        </p>

        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #374151; font-weight: bold;">
                Si ya ha realizado el pago, por favor ignore este mensaje.
            </p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Gracias por su atención y disculpe las molestias.
        </p>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                <strong>{{user_name}}</strong>
            </p>
        </div>
    </div>
</div>`
                        }
                    }
                ]),
                status: 'active',
                execution_count: 0
            },
            {
                user_id: user.id,
                name: 'Seguimiento de proyecto',
                description: 'Seguimiento periódico del progreso de proyectos',
                trigger_type: 'project_followup',
                trigger_conditions: JSON.stringify([
                    {
                        field: 'project_progress',
                        operator: 'less_than',
                        value: 50
                    }
                ]),
                actions: JSON.stringify([
                    {
                        type: 'send_email',
                        name: 'Seguimiento de proyecto',
                        parameters: {
                            subject: 'Seguimiento del Proyecto - {{client_company}}',
                            template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">Seguimiento de Proyecto</h1>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Estimado/a <strong>{{client_name}}</strong>,
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Queremos mantenerle informado sobre el progreso de su proyecto. Nuestro equipo está trabajando diligentemente para cumplir con los plazos establecidos.
        </p>

        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">Estado actual del proyecto:</h3>
            <p style="margin: 0; color: #374151;">
                En progreso - Cumpliendo con los plazos establecidos
            </p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Si tiene alguna pregunta o necesita información adicional, no dude en contactarnos.
        </p>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                <strong>{{user_name}}</strong>
            </p>
        </div>
    </div>
</div>`
                        }
                    }
                ]),
                status: 'active',
                execution_count: 0
            }
        ];

        console.log('🚀 Eliminando automatizaciones existentes...');

        // Primero eliminar automatizaciones existentes del usuario
        const { error: deleteError } = await supabase
            .from('automations')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('❌ Error eliminando automatizaciones:', deleteError);
        }

        console.log('📝 Creando nuevas automatizaciones...');

        // Insertar las nuevas automatizaciones
        const { data: insertedAutomations, error: insertError } = await supabase
            .from('automations')
            .insert(sampleAutomations)
            .select();

        if (insertError) {
            console.error('❌ Error insertando automatizaciones:', insertError);
            return;
        }

        console.log(`✅ Creadas ${insertedAutomations.length} automatizaciones:`);
        insertedAutomations.forEach(automation => {
            console.log(`  - ${automation.name} (${automation.trigger_type})`);
        });

        console.log('\n🎉 Proceso completado. Las automatizaciones están listas para usar.');

    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    }
}

// Ejecutar el script
createSampleAutomations();
