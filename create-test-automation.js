// Script para crear UNA automatización de prueba con acciones correctas
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAutomation() {
    try {
        const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

        console.log('🚀 Creando automatización de prueba...');

        // Primero eliminar cualquier automatización de prueba existente
        await supabase
            .from('automations')
            .delete()
            .eq('user_id', userId)
            .eq('name', 'TEST - Envío de Email');

        // Crear la nueva automatización con acción completa
        const newAutomation = {
            user_id: userId,
            name: 'TEST - Envío de Email',
            description: 'Automatización de prueba para verificar envío de emails',
            trigger_type: 'manual_test',
            trigger_conditions: JSON.stringify([]),
            actions: JSON.stringify([
                {
                    type: 'send_email',
                    name: 'Enviar email de prueba',
                    parameters: {
                        subject: 'Prueba de Automatización - {{client_company}}',
                        template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0; font-size: 28px;">🎉 ¡Automatización Funcionando!</h1>
            <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Este email se generó automáticamente</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Estimado/a <strong>{{client_name}}</strong>,
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Este es un email de prueba generado por el sistema de automatizaciones de Taskelio. 
            Si recibe este mensaje, significa que la automatización está funcionando correctamente.
        </p>

        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #15803d; margin: 0 0 10px 0; font-size: 18px;">✅ Información del Cliente:</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Nombre:</strong> {{client_name}}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> {{client_email}}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Empresa:</strong> {{client_company}}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                ✅ Automatización Exitosa
            </div>
        </div>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Email enviado automáticamente por <strong>{{user_name}}</strong><br>
                Sistema de Automatizaciones Taskelio
            </p>
        </div>
    </div>
</div>`
                    }
                }
            ]),
            status: 'active',
            execution_count: 0
        };

        const { data: insertedAutomation, error: insertError } = await supabase
            .from('automations')
            .insert([newAutomation])
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error insertando automatización:', insertError);
            return;
        }

        console.log('✅ Automatización creada exitosamente:');
        console.log('   - ID:', insertedAutomation.id);
        console.log('   - Nombre:', insertedAutomation.name);
        console.log('   - Actions length:', insertedAutomation.actions.length);

        // Verificar que se puede parsear
        try {
            const parsedActions = JSON.parse(insertedAutomation.actions);
            console.log('   - Actions parseadas:', parsedActions.length, 'acciones');
            console.log('   - Primera acción tipo:', parsedActions[0].type);
        } catch (e) {
            console.error('   ❌ Error parseando actions:', e);
        }

        console.log('\n🎯 Automatización lista para probar!');
        console.log('   Ve a la página de automatizaciones y busca "TEST - Envío de Email"');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

createTestAutomation();
