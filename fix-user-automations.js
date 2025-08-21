// Script simple para verificar usuario actual y crear automatizaciones
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Conectando a Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key disponible:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAutomationActions() {
    try {
        // Simular un usuario conectado - en tu caso: e7ed7c8d-229a-42d1-8a44-37bcc64c440c
        const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'; // Tu ID de usuario de los logs

        console.log('🔍 Buscando automatizaciones para usuario:', userId);

        // Obtener automatizaciones del usuario
        const { data: automations, error } = await supabase
            .from('automations')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log(`📊 Encontradas ${automations.length} automatizaciones`);

        for (const automation of automations) {
            console.log(`\n📋 Automatización: ${automation.name}`);
            console.log(`   - ID: ${automation.id}`);
            console.log(`   - Tipo: ${automation.trigger_type}`);
            console.log(`   - Actions raw:`, automation.actions);

            // Si las acciones están vacías, agregar la acción de email
            if (!automation.actions || automation.actions === '[]' || automation.actions === '') {
                console.log('   ⚠️ Sin acciones, agregando acción de email...');

                const emailAction = {
                    type: 'send_email',
                    name: 'Enviar email de ' + automation.name.toLowerCase(),
                    parameters: {
                        subject: automation.name + ' - {{client_company}}',
                        template: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #1e40af; margin: 0 0 20px 0; font-size: 24px;">${automation.name}</h1>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Estimado/a <strong>{{client_name}}</strong>,
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            ${automation.description || 'Este es un email automático generado por nuestro sistema.'}
        </p>

        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;">
                Gracias por confiar en nuestros servicios. Si tiene alguna consulta, no dude en contactarnos.
            </p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Saludos,<br>
                <strong>{{user_name}}</strong>
            </p>
        </div>
    </div>
</div>`
                    }
                };

                const { error: updateError } = await supabase
                    .from('automations')
                    .update({
                        actions: JSON.stringify([emailAction])
                    })
                    .eq('id', automation.id);

                if (updateError) {
                    console.error('   ❌ Error actualizando:', updateError);
                } else {
                    console.log('   ✅ Actualizada con acción de email');
                }
            } else {
                console.log('   ✓ Ya tiene acciones configuradas');
            }
        }

        console.log('\n🎉 Proceso completado');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

fixAutomationActions();
