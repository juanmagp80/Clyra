const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugMessages() {
    console.log('🔍 DEBUGGING MENSAJES DE CLIENTE...\n');

    try {
        // 1. Verificar estructura de la tabla
        console.log('📋 1. Verificando estructura de client_messages...');
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_table_info', { table_name: 'client_messages' })
            .single();
        
        if (tableError) {
            console.log('⚠️ No se puede obtener info de tabla, continuando...');
        }

        // 2. Obtener todos los mensajes para ver su estructura
        console.log('\n📨 2. Obteniendo todos los mensajes...');
        const { data: messages, error: messagesError } = await supabase
            .from('client_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (messagesError) {
            console.error('❌ Error obteniendo mensajes:', messagesError);
            return;
        }

        console.log(`✅ Encontrados ${messages.length} mensajes\n`);

        // 3. Analizar sender_type
        const senderTypes = {};
        messages.forEach(msg => {
            senderTypes[msg.sender_type] = (senderTypes[msg.sender_type] || 0) + 1;
        });

        console.log('📊 3. Distribución de sender_type:');
        Object.entries(senderTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} mensajes`);
        });

        // 4. Mostrar algunos mensajes de ejemplo
        console.log('\n💬 4. Ejemplos de mensajes:');
        messages.slice(0, 5).forEach((msg, index) => {
            console.log(`   ${index + 1}. ID: ${msg.id.substring(0, 8)}...`);
            console.log(`      Sender: ${msg.sender_type}`);
            console.log(`      Mensaje: "${msg.message.substring(0, 50)}..."`);
            console.log(`      Cliente ID: ${msg.client_id}`);
            console.log(`      Fecha: ${msg.created_at}`);
            console.log('');
        });

        // 5. Verificar si hay mensajes de freelancer
        const freelancerMessages = messages.filter(msg => msg.sender_type === 'freelancer');
        console.log(`🤔 5. Mensajes de freelancer encontrados: ${freelancerMessages.length}`);

        if (freelancerMessages.length === 0) {
            console.log('❌ PROBLEMA IDENTIFICADO: No hay mensajes con sender_type = "freelancer"');
            console.log('💡 Esto explica por qué todos aparecen como mensajes de cliente.');
            
            // Vamos a crear algunos mensajes de prueba
            console.log('\n🛠️ 6. Creando mensajes de prueba...');
            
            // Obtener un client_id existente
            const existingClientId = messages[0] ? messages[0].client_id : null;
            if (existingClientId) {
                const testMessages = [
                    {
                        client_id: existingClientId,
                        message: 'Hola, he recibido tu mensaje. Te respondo enseguida.',
                        sender_type: 'freelancer'
                    },
                    {
                        client_id: existingClientId,
                        message: 'Perfecto, el proyecto está avanzando bien.',
                        sender_type: 'freelancer'
                    }
                ];

                for (const testMsg of testMessages) {
                    const { data, error } = await supabase
                        .from('client_messages')
                        .insert(testMsg)
                        .select()
                        .single();

                    if (error) {
                        console.log(`❌ Error creando mensaje de prueba: ${error.message}`);
                    } else {
                        console.log(`✅ Mensaje de freelancer creado: ${data.id}`);
                    }
                }
            }
        }

        // 6. Verificar clientes asociados
        console.log('\n👥 7. Verificando clientes asociados...');
        const clientIds = [...new Set(messages.map(msg => msg.client_id))];
        console.log(`Clientes únicos en mensajes: ${clientIds.length}`);

        for (const clientId of clientIds.slice(0, 3)) {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('name, email')
                .eq('id', clientId)
                .single();

            if (!clientError && client) {
                console.log(`   Cliente: ${client.name} (${client.email})`);
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

debugMessages();
