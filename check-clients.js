const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODA5NzUsImV4cCI6MjA2OTU1Njk3NX0.77Si27sIxzCtJqmw3Z81dJDejKcgaX9pm8eZMldPr4I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClients() {
    try {
        // Obtener clientes existentes
        const { data: clients, error } = await supabase
            .from('clients')
            .select('*')
            .limit(5);

        if (error) {
            console.error('Error obteniendo clientes:', error);
            return;
        }

        console.log('🏢 CLIENTES DISPONIBLES:');
        if (clients && clients.length > 0) {
            clients.forEach((client, index) => {
                console.log(`${index + 1}. ${client.name} (ID: ${client.id})`);
            });
        } else {
            console.log('No hay clientes en la base de datos');
        }

        // También revisar usuarios
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email')
            .limit(3);

        if (!usersError && users && users.length > 0) {
            console.log('\n👥 USUARIOS DISPONIBLES:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkClients();
