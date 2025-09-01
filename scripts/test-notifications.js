// scripts/test-notifications.js
// Archivo para probar el sistema de notificaciones

import { createSupabaseClient } from '../src/lib/supabase-client.js';

async function testNotifications() {
    const supabase = createSupabaseClient();
    
    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        console.error('Error obteniendo usuario:', userError);
        return;
    }

    console.log('🧪 Creando notificaciones de prueba para:', user.email);

    // Notificaciones de ejemplo
    const testNotifications = [
        {
            title: '💬 Nuevo mensaje de cliente',
            message: 'María González te ha enviado un mensaje: "¿Podemos revisar los cambios del diseño?"',
            type: 'info',
            route: '/dashboard/client-communications',
            action_data: { clientId: 'test-client-1', type: 'new_message' }
        },
        {
            title: '⚠️ Proyecto con retraso',
            message: 'El proyecto "Página web corporativa" lleva 3 días de retraso',
            type: 'warning',
            route: '/dashboard/projects',
            action_data: { projectId: 'test-project-1', daysLate: 3, type: 'project_delay' }
        },
        {
            title: '💸 Factura vencida',
            message: 'Factura #INV-2024-001 (TechCorp SL) - 5 días vencida - €2,500',
            type: 'error',
            route: '/dashboard/invoices',
            action_data: { invoiceId: 'test-invoice-1', daysOverdue: 5, amount: 2500, type: 'overdue_invoice' }
        },
        {
            title: '✅ Tarea completada',
            message: '"Diseño de mockups" en proyecto Web Corporativa ha sido completada',
            type: 'success',
            route: '/dashboard/tasks',
            action_data: { taskId: 'test-task-1', type: 'task_completed' }
        },
        {
            title: '😴 Cliente inactivo',
            message: 'Juan Pérez no ha tenido actividad en 30 días',
            type: 'warning',
            route: '/dashboard/clients',
            action_data: { clientId: 'test-client-2', daysSinceLastActivity: 30, type: 'inactive_client' }
        },
        {
            title: '🎯 Meta de ingresos alcanzada',
            message: '¡Has alcanzado €5,200 de tu meta mensual de €5,000 en Marzo!',
            type: 'success',
            route: '/dashboard/reports',
            action_data: { monthlyGoal: 5000, currentRevenue: 5200, month: 'Marzo', type: 'revenue_goal' }
        }
    ];

    // Insertar notificaciones
    for (let i = 0; i < testNotifications.length; i++) {
        const notification = testNotifications[i];
        
        try {
            const { data, error } = await supabase
                .from('user_notifications')
                .insert({
                    user_id: user.id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    route: notification.route,
                    action_data: notification.action_data,
                    is_read: Math.random() > 0.6, // 40% leídas, 60% sin leer
                    created_at: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)).toISOString() // Espaciadas cada 2 horas
                });

            if (error) {
                console.error(`❌ Error creando notificación ${i + 1}:`, error);
            } else {
                console.log(`✅ Notificación ${i + 1} creada:`, notification.title);
            }

            // Esperar un poco entre inserciones
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
            console.error(`❌ Error en notificación ${i + 1}:`, err);
        }
    }

    console.log('🎉 ¡Notificaciones de prueba creadas! Ve al dashboard para verlas.');
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
    testNotifications().catch(console.error);
}

export { testNotifications };
