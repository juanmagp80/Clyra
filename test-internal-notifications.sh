#!/bin/bash

# Script para probar las notificaciones internas de proyectos con retraso
# Ejecutar desde la raíz del proyecto: ./test-internal-notifications.sh

echo "🔔 Probando sistema de notificaciones internas..."
echo "================================================"

# Test 1: Crear una notificación de prueba directamente
echo "📝 Test 1: Creando notificación de prueba..."
node -e "
const { createSupabaseClient } = require('./src/lib/supabase-client');

async function testNotification() {
  try {
    const supabase = createSupabaseClient();
    
    // Crear notificación de prueba
    const { data, error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
        title: '🧪 Test: Proyecto con retraso',
        message: 'Esta es una notificación de prueba para verificar el sistema de alertas internas.',
        type: 'warning',
        route: '/dashboard/projects',
        action_data: {
          test: true,
          project_name: 'Proyecto Test',
          client_name: 'Cliente Test',
          days_overdue: '5'
        },
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Notificación creada:', data);
    }
  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

testNotification();
"

echo ""
echo "📊 Test 2: Verificando notificaciones existentes..."
node -e "
const { createSupabaseClient } = require('./src/lib/supabase-client');

async function checkNotifications() {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('📋 Últimas notificaciones:');
      data.forEach(notif => {
        console.log(\`  \${notif.is_read ? '✅' : '🔔'} \${notif.title} - \${notif.created_at}\`);
      });
    }
  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

checkNotifications();
"

echo ""
echo "🎯 Test 3: Probando función de automatización..."
node -e "
const { notifyProjectDelay } = require('./utils/notificationHelpers');

async function testAutomation() {
  try {
    await notifyProjectDelay(
      'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
      'Proyecto Demo Retraso',
      'Cliente Ejemplo S.L.',
      7,
      'test-project-id'
    );
    console.log('✅ Función de automatización ejecutada');
  } catch (error) {
    console.error('❌ Error en automatización:', error);
  }
}

testAutomation();
"

echo ""
echo "✅ Tests completados!"
echo "Revisa tu panel de notificaciones en /dashboard/notifications"
