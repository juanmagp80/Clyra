const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndCreateBasicData() {
    console.log('🎯 Verificando datos existentes y creando lo necesario...');
    
    try {
        // 1. Obtener usuario
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError || !users.length) {
            throw new Error('No se encontró usuario');
        }
        
        const userId = users[0].id;
        console.log('✅ Usuario:', userId);

        // 2. Verificar clientes
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId);
            
        if (clientsError) throw new Error('Error consultando clientes: ' + clientsError.message);
        console.log('📊 Clientes encontrados:', clients.length);
        
        if (clients.length > 0) {
            clients.forEach(client => {
                console.log(`   👤 ${client.name} (${client.email})`);
            });
        }

        // 3. Verificar proyectos
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId);
            
        if (projectsError) throw new Error('Error consultando proyectos: ' + projectsError.message);
        console.log('📊 Proyectos encontrados:', projects.length);
        
        if (projects.length > 0) {
            projects.forEach(project => {
                console.log(`   🏗️  ${project.name} (${project.status})`);
            });
        }

        // 4. Verificar propuestas
        const { data: proposals, error: proposalsError } = await supabase
            .from('proposals')
            .select('*')
            .eq('user_id', userId);
            
        if (proposalsError) throw new Error('Error consultando propuestas: ' + proposalsError.message);
        console.log('📊 Propuestas encontradas:', proposals.length);
        
        if (proposals.length > 0) {
            proposals.forEach(proposal => {
                console.log(`   📋 ${proposal.title} (€${proposal.total_amount})`);
            });
        }

        // 5. Verificar mensajes
        const { data: messages, error: messagesError } = await supabase
            .from('freelancer_messages')
            .select('*')
            .eq('user_id', userId);
            
        if (messagesError) {
            console.log('⚠️  No se pudieron consultar los mensajes:', messagesError.message);
        } else {
            console.log('📊 Mensajes encontrados:', messages.length);
        }

        // 6. Crear un mensaje simple de prueba
        if (clients.length > 0) {
            console.log('📝 Intentando crear mensaje de prueba...');
            const { data: testMessage, error: messageError } = await supabase
                .from('freelancer_messages')
                .insert({
                    user_id: userId,
                    client_id: clients[0].id,
                    message: '¡Perfecto! Me parece muy razonable. El sistema de reviews con IA nos interesa mucho. ¡Gracias por la gestión tan profesional! 💪',
                    sender: 'client',
                    message_type: 'text',
                    is_read: false
                })
                .select()
                .single();
                
            if (messageError) {
                console.log('❌ Error creando mensaje:', messageError.message);
            } else {
                console.log('✅ Mensaje de prueba creado');
            }
        }

        console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA!');
        console.log('');
        console.log('🎯 ESTADO ACTUAL DE DATOS PARA AUTOMATIZACIONES:');
        
        if (clients.length > 0 && projects.length > 0) {
            console.log('   ⚠️  **DETECTOR DE RIESGOS** → ✅ LISTO');
            console.log(`       Cliente: "${clients[0].name}"`);
            console.log(`       Proyecto: "${projects[0].name}"`);
        } else {
            console.log('   ⚠️  **DETECTOR DE RIESGOS** → ❌ Faltan datos');
        }
        
        if (clients.length > 0 && proposals.length > 0) {
            console.log('   📊 **ANALIZADOR DE PROPUESTAS** → ✅ LISTO');
            console.log(`       Cliente: "${clients[0].name}"`);
            console.log(`       Propuesta: "${proposals[0].title}"`);
        } else {
            console.log('   📊 **ANALIZADOR DE PROPUESTAS** → ❌ Faltan datos');
        }
        
        if (clients.length > 0) {
            console.log('   🧠 **ANÁLISIS DE CONVERSACIÓN** → ✅ LISTO');
            console.log(`       Cliente: "${clients[0].name}"`);
        } else {
            console.log('   🧠 **ANÁLISIS DE CONVERSACIÓN** → ❌ Faltan datos');
        }
        
        console.log('   🎭 **ANÁLISIS DE SENTIMIENTO** → ✅ LISTO (texto manual)');
        console.log('   💬 **OPTIMIZACIÓN DE COMUNICACIÓN** → ✅ LISTO (texto manual)');
        
        console.log('');
        console.log('🚀 **¡Ve a http://localhost:3000/dashboard/ai-automations para probar!**');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndCreateBasicData();
