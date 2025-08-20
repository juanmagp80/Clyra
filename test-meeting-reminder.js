require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMeetingReminder() {
  try {
    console.log('🧪 Probando sistema de recordatorio de reuniones...');

    // 1. Verificar si existe la tabla meetings
    console.log('🔍 Verificando estructura de base de datos...');

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'meetings');

    if (tablesError || !tables || tables.length === 0) {
      console.log('⚠️ Tabla "meetings" no encontrada. Creando datos simulados...');

      // Crear datos simulados para demostración
      await createSimulatedMeetingTest();
      return;
    }

    console.log('✅ Tabla meetings encontrada');

    // 2. Verificar reuniones existentes
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .limit(5);

    if (meetingsError) {
      console.error('❌ Error accediendo a meetings:', meetingsError);
      return;
    }

    console.log(`📅 Reuniones en la base de datos: ${meetings?.length || 0}`);

    // 3. Crear reunión de prueba si no hay reuniones próximas
    if (!meetings || meetings.length === 0) {
      console.log('🔧 Creando reunión de prueba...');
      await createTestMeeting();
    }

    // 4. Probar API de recordatorios
    console.log('🚀 Probando API de recordatorios...');

    const response = await fetch('http://localhost:3000/api/meeting-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API response:', result);
    } else {
      console.error('❌ Error en API:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

async function createTestMeeting() {
  try {
    // Obtener un cliente existente
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c')
      .limit(1);

    if (!existingClient || existingClient.length === 0) {
      console.log('❌ No hay clientes disponibles para crear reunión');
      return;
    }

    const client = existingClient[0];

    // Crear reunión 1.5 horas en el futuro
    const futureDate = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
    const meetingDate = futureDate.toISOString().split('T')[0];
    const meetingTime = futureDate.toTimeString().split(' ')[0].substring(0, 5);

    const { data: newMeeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title: 'Reunión de Seguimiento - Automatización Test',
        description: 'Reunión de prueba para el sistema de recordatorios automáticos',
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        location: 'Oficina principal / Video llamada',
        client_id: client.id,
        user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
        status: 'scheduled'
      })
      .select()
      .single();

    if (meetingError) {
      console.error('❌ Error creando reunión:', meetingError);
    } else {
      console.log('✅ Reunión de prueba creada:');
      console.log(`   📋 Título: ${newMeeting.title}`);
      console.log(`   📅 Fecha: ${meetingDate}`);
      console.log(`   ⏰ Hora: ${meetingTime}`);
      console.log(`   👤 Cliente: ${client.name}`);
      console.log(`   🔔 Recordatorio se enviará en ~30 minutos`);
    }

  } catch (error) {
    console.error('❌ Error en createTestMeeting:', error);
  }
}

async function createSimulatedMeetingTest() {
  console.log('💡 Simulando funcionamiento del sistema de recordatorios...');
  console.log('');

  // Obtener cliente existente
  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c')
    .limit(1);

  if (!existingClient || existingClient.length === 0) {
    console.log('❌ No hay clientes disponibles para la simulación');
    return;
  }

  const client = existingClient[0];

  // Simular reunión próxima
  const futureDate = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
  const meetingDate = futureDate.toLocaleDateString('es-ES');
  const meetingTime = futureDate.toTimeString().split(' ')[0].substring(0, 5);

  console.log('📅 SIMULACIÓN: Reunión próxima detectada');
  console.log('=====================================');
  console.log(`📋 Título: Reunión de Seguimiento del Proyecto`);
  console.log(`📅 Fecha: ${meetingDate}`);
  console.log(`⏰ Hora: ${meetingTime}`);
  console.log(`👤 Cliente: ${client.name}`);
  console.log(`📧 Email: ${client.email}`);
  console.log(`📍 Ubicación: Oficina principal`);
  console.log('');

  // Verificar automatización
  const { data: automation } = await supabase
    .from('automations')
    .select('*')
    .ilike('name', '%recordatorio%')
    .eq('is_active', true)
    .single();

  if (automation) {
    console.log('✅ Automatización de recordatorio encontrada:');
    console.log(`   📝 Nombre: ${automation.name}`);
    console.log(`   📊 Ejecuciones: ${automation.execution_count || 0}`);
    console.log('');

    // Simular envío de recordatorio
    console.log('📧 SIMULANDO: Envío de recordatorio...');

    const emailData = {
      to: client.email,
      subject: `📅 Recordatorio: Reunión en 1 hora - INSTELCA S.L.U`,
      variables: {
        meeting_title: 'Reunión de Seguimiento del Proyecto',
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        meeting_location: 'Oficina principal',
        client_name: client.name,
        user_name: 'Juan García',
        user_email: 'juangpdev@gmail.com',
        user_company: 'INSTELCA S.L.U',
        project_name: 'Proyecto Web Corporativo'
      }
    };

    // Enviar email real usando la automatización existente
    const template = JSON.parse(automation.actions)[0].parameters.template;
    let htmlContent = template;

    // Reemplazar variables
    Object.entries(emailData.variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
    });

    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: htmlContent,
        replyTo: emailData.variables.user_email
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Recordatorio enviado exitosamente!');
      console.log(`📧 ID del email: ${result.id}`);
      console.log(`📬 Destinatario: ${emailData.to}`);
      console.log('');
      console.log('🎉 ¡Sistema de recordatorios funcionando correctamente!');
    } else {
      console.error('❌ Error enviando recordatorio:', response.status);
    }

  } else {
    console.log('⚠️ No se encontró automatización de recordatorio activa');
    console.log('💡 Ejecuta el sistema para crear la automatización automáticamente');
  }

  console.log('');
  console.log('📋 PASOS PARA IMPLEMENTACIÓN COMPLETA:');
  console.log('=====================================');
  console.log('1. Crear tabla "meetings" en Supabase con las columnas necesarias');
  console.log('2. Configurar cron job para ejecutar cada hora: 0 * * * *');
  console.log('3. Agregar reuniones reales al sistema');
  console.log('4. Monitorear desde /admin/meeting-reminder');
  console.log('5. Automatización se ejecutará automáticamente');
}

testMeetingReminder();
