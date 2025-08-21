// Script para crear datos básicos y una reunión de prueba
// Solucionará el problema de datos faltantes

const { createClient } = require('@supabase/supabase-js');

// Usar service role key para bypass RLS temporalmente
const supabase = createClient(
  'https://joyhaxtpmrmndmifsihn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A'
);

async function createTestData() {
  try {
    console.log('🔧 CREANDO DATOS DE PRUEBA PARA SISTEMA DE RECORDATORIOS');
    console.log('=======================================================');

    const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

    // 1. Crear cliente de prueba
    console.log('1. 👤 Creando cliente de prueba...');

    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    let client;
    if (existingClient && existingClient.length > 0) {
      client = existingClient[0];
      console.log(`   ✅ Cliente existente: ${client.name} (${client.email})`);
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: 'Cliente Test Recordatorios',
          email: 'cliente.test@example.com',
          company: 'Empresa Test SL',
          phone: '+34 600 123 456',
          user_id: userId
        })
        .select()
        .single();

      if (clientError) {
        console.error(`   ❌ Error creando cliente: ${clientError.message}`);
        return;
      }

      client = newClient;
      console.log(`   ✅ Cliente creado: ${client.name} (${client.email})`);
    }

    // 2. Crear proyecto opcional
    console.log('2. 📋 Creando proyecto de prueba...');

    const { data: existingProject } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('client_id', client.id)
      .limit(1);

    let project;
    if (existingProject && existingProject.length > 0) {
      project = existingProject[0];
      console.log(`   ✅ Proyecto existente: ${project.name}`);
    } else {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: 'Proyecto Test - Reuniones',
          description: 'Proyecto de prueba para sistema de recordatorios',
          client_id: client.id,
          user_id: userId,
          status: 'active',
          budget: 5000.00
        })
        .select()
        .single();

      if (projectError) {
        console.log(`   ⚠️ No se pudo crear proyecto: ${projectError.message}`);
        project = null;
      } else {
        project = newProject;
        console.log(`   ✅ Proyecto creado: ${project.name}`);
      }
    }

    // 3. Crear reunión de prueba para dentro de 1.5 horas
    console.log('3. 📅 Creando reunión de prueba...');

    const futureDate = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
    const endDate = new Date(futureDate.getTime() + 60 * 60 * 1000);

    const { data: meeting, error: meetingError } = await supabase
      .from('calendar_events')
      .insert({
        title: 'Reunión de Seguimiento - Test Recordatorios',
        description: 'Reunión de prueba para verificar el sistema de recordatorios automáticos',
        start_time: futureDate.toISOString(),
        end_time: endDate.toISOString(),
        type: 'meeting',
        status: 'scheduled',
        client_id: client.id,
        project_id: project?.id || null,
        user_id: userId,
        location: 'Oficina principal',
        meeting_url: 'https://meet.google.com/test-reunion-recordatorio',
        is_billable: true,
        hourly_rate: 75.00
      })
      .select()
      .single();

    if (meetingError) {
      console.error(`   ❌ Error creando reunión: ${meetingError.message}`);

      // Intentar desactivar RLS temporalmente
      console.log('   🔧 Intentando solución alternativa...');

      try {
        // Verificar si el usuario existe en profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!profile) {
          console.log('   👤 Creando perfil de usuario...');
          await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: 'dev@clyra.com',
              full_name: 'Usuario de Desarrollo'
            });
        }

        // Intentar de nuevo
        const { data: retryMeeting, error: retryError } = await supabase
          .from('calendar_events')
          .insert({
            title: 'Reunión de Seguimiento - Test Recordatorios',
            description: 'Reunión de prueba para verificar el sistema de recordatorios automáticos',
            start_time: futureDate.toISOString(),
            end_time: endDate.toISOString(),
            type: 'meeting',
            status: 'scheduled',
            client_id: client.id,
            project_id: project?.id || null,
            user_id: userId,
            location: 'Oficina principal',
            meeting_url: 'https://meet.google.com/test-reunion-recordatorio'
          })
          .select()
          .single();

        if (retryError) {
          console.error(`   ❌ Error en reintento: ${retryError.message}`);
        } else {
          meeting = retryMeeting;
          console.log(`   ✅ Reunión creada en reintento`);
        }

      } catch (retryErr) {
        console.error('   ❌ Error en solución alternativa:', retryErr);
      }
    }

    if (meeting) {
      console.log(`   ✅ Reunión creada exitosamente:`);
      console.log(`      📋 ID: ${meeting.id}`);
      console.log(`      📅 Título: ${meeting.title}`);
      console.log(`      ⏰ Fecha: ${new Date(meeting.start_time).toLocaleString('es-ES')}`);
      console.log(`      👤 Cliente: ${client.name} (${client.email})`);
      console.log(`      📍 Ubicación: ${meeting.location}`);
      console.log(`      🔗 URL: ${meeting.meeting_url}`);

      console.log('');
      console.log('🎉 ¡DATOS CREADOS EXITOSAMENTE!');
      console.log('==============================');
      console.log('');
      console.log('🚀 PRÓXIMOS PASOS:');
      console.log('1. Ejecutar sistema de recordatorios:');
      console.log('   curl -X POST http://localhost:3000/api/meeting-reminder');
      console.log('');
      console.log('2. Monitorear desde panel admin:');
      console.log('   http://localhost:3000/admin/meeting-reminder');
      console.log('');
      console.log('3. La reunión debería generar recordatorio automáticamente');
      console.log(`   cuando falte 1 hora (${new Date(futureDate.getTime() - 60 * 60 * 1000).toLocaleString('es-ES')})`);
    }

    // 4. Verificar automatización
    console.log('');
    console.log('4. ⚙️ Verificando automatización de recordatorios...');

    const { data: automation } = await supabase
      .from('automations')
      .select('*')
      .ilike('name', '%recordatorio%reunión%')
      .single();

    if (automation) {
      console.log(`   ✅ Automatización encontrada: ${automation.name}`);
      console.log(`   📊 Estado: ${automation.is_active ? 'Activa' : 'Inactiva'}`);
      console.log(`   📈 Ejecuciones: ${automation.execution_count || 0}`);
    } else {
      console.log('   ⚠️ Automatización no encontrada');
      console.log('   💡 Ejecuta: curl -X POST http://localhost:3000/api/meeting-reminder');
      console.log('      para crear la automatización automáticamente');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createTestData();
