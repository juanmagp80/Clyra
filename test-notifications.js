// Script para insertar notificaciones de prueba
// Ejecutar con: node test-notifications.js

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar las mismas variables de entorno que la app)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'tu-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestNotifications(userEmail) {
    try {
        console.log('🔍 Buscando usuario con email:', userEmail);
        
        // Primero buscar el user_id basado en el email
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
            console.error('❌ Error obteniendo usuarios:', userError);
            return;
        }
        
        const user = userData.users.find(u => u.email === userEmail);
        
        if (!user) {
            console.error('❌ Usuario no encontrado con email:', userEmail);
            return;
        }
        
        console.log('✅ Usuario encontrado:', user.id);
        
        // Crear notificaciones de prueba
        const testNotifications = [
            {
                user_id: user.id,
                title: 'Bienvenido a Taskelio',
                message: 'Tu cuenta ha sido configurada correctamente. ¡Comienza a gestionar tus proyectos!',
                type: 'success',
                action_url: '/dashboard',
                is_read: false
            },
            {
                user_id: user.id,
                title: 'Nuevo mensaje de cliente',
                message: 'Tienes un nuevo mensaje en tus conversaciones pendientes.',
                type: 'info',
                action_url: '/dashboard/client-communications',
                is_read: false
            },
            {
                user_id: user.id,
                title: 'Factura generada',
                message: 'Se ha generado una nueva factura para el proyecto "Desarrollo Web".',
                type: 'success',
                route: '/dashboard/invoices',
                is_read: false
            },
            {
                user_id: user.id,
                title: 'Recordatorio importante',
                message: 'No olvides completar tu perfil para mejorar tu visibilidad.',
                type: 'warning',
                action_url: '/dashboard/profile',
                is_read: true
            }
        ];
        
        console.log('📝 Insertando notificaciones de prueba...');
        
        const { data, error } = await supabase
            .from('user_notifications')
            .insert(testNotifications)
            .select();
        
        if (error) {
            console.error('❌ Error insertando notificaciones:', error);
            return;
        }
        
        console.log('✅ Notificaciones insertadas exitosamente:', data.length);
        console.log('📋 Notificaciones creadas:');
        data.forEach((notif, index) => {
            console.log(`  ${index + 1}. ${notif.title} (${notif.type})`);
        });
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Obtener el email del usuario desde argumentos de línea de comandos
const userEmail = process.argv[2];

if (!userEmail) {
    console.log('❌ Uso: node test-notifications.js <email-del-usuario>');
    console.log('Ejemplo: node test-notifications.js juangpdev@gmail.com');
    process.exit(1);
}

insertTestNotifications(userEmail);
