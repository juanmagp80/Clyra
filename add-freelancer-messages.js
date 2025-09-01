const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addFreelancerMessages() {
    console.log('🛠️ AGREGANDO MENSAJES DE FREELANCER...\n');

    try {
        // Obtener clientes existentes
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('id, name')
            .limit(2);

        if (clientsError) {
            console.error('❌ Error obteniendo clientes:', clientsError);
            return;
        }

        console.log(`✅ Encontrados ${clients.length} clientes`);

        // Mensajes de freelancer para agregar
        const freelancerMessages = [
            "¡Hola! He recibido tu mensaje. Te respondo enseguida.",
            "Perfecto, el proyecto está avanzando muy bien según lo planificado.",
            "Te envío un update sobre el progreso. ¿Tienes alguna pregunta?",
            "Gracias por la información adicional. Lo reviso y te comento.",
            "El deadline se mantiene. Todo va según el cronograma.",
            "¿Podrías revisar la propuesta que te envié? Quedo pendiente de tu feedback.",
            "Excelente! Implementaré esos cambios que me comentas.",
            "He terminado la primera fase. ¿Cuándo podemos hacer una revisión?",
        ];

        let totalAdded = 0;

        for (const client of clients) {
            console.log(`\n📝 Agregando mensajes para ${client.name}...`);
            
            // Agregar 3-4 mensajes de freelancer por cliente
            const messagesToAdd = freelancerMessages.slice(0, 4);
            
            for (let i = 0; i < messagesToAdd.length; i++) {
                const message = {
                    client_id: client.id,
                    message: messagesToAdd[i],
                    sender_type: 'freelancer',
                    created_at: new Date(Date.now() - (i * 3600000)).toISOString() // Espaciar por horas
                };

                const { data, error } = await supabase
                    .from('client_messages')
                    .insert(message)
                    .select()
                    .single();

                if (error) {
                    console.log(`   ❌ Error: ${error.message}`);
                } else {
                    console.log(`   ✅ Mensaje agregado: "${message.message.substring(0, 40)}..."`);
                    totalAdded++;
                }
            }
        }

        console.log(`\n🎉 Total de mensajes de freelancer agregados: ${totalAdded}`);

        // Verificar el resultado
        console.log('\n📊 Verificando distribución final...');
        const { data: allMessages, error: verifyError } = await supabase
            .from('client_messages')
            .select('sender_type')
            .order('created_at', { ascending: false });

        if (!verifyError) {
            const distribution = {};
            allMessages.forEach(msg => {
                distribution[msg.sender_type] = (distribution[msg.sender_type] || 0) + 1;
            });

            console.log('📈 Nueva distribución:');
            Object.entries(distribution).forEach(([type, count]) => {
                console.log(`   ${type}: ${count} mensajes`);
            });
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

addFreelancerMessages();
