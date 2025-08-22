// Script para diagnosticar por qué no se detectan las reuniones
// Revisa la base de datos y los filtros de búsqueda

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Usar service role key para bypass RLS y acceder a todos los datos
const supabase = createClient(
  'https://joyhaxtpmrmndmifsihn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A'
);

async function diagnoseMeetingDetection() {
  try {
    console.log('🔍 DIAGNÓSTICO DE DETECCIÓN DE REUNIONES');
    console.log('=====================================');

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    console.log(`⏰ Hora actual: ${now.toLocaleString('es-ES')}`);
    console.log(`🎯 Buscando reuniones entre: ${oneHourFromNow.toLocaleString('es-ES')} y ${threeHoursFromNow.toLocaleString('es-ES')}`);
    console.log('');

    // 1. Verificar TODAS las reuniones en calendar_events
    console.log('📋 1. TODAS LAS REUNIONES EN CALENDAR_EVENTS:');
    console.log('============================================');

    const { data: allEvents, error: allError } = await supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        start_time,
        end_time,
        type,
        status,
        client_id,
        user_id,
        clients (
          id,
          name,
          email
        )
      `)
      .order('start_time', { ascending: true });

    if (allError) {
      console.error('❌ Error obteniendo eventos:', allError);
      return;
    }

    if (!allEvents || allEvents.length === 0) {
      console.log('⚠️ No hay eventos en calendar_events');
      console.log('💡 Necesitas crear reuniones desde: http://localhost:3000/dashboard/calendar');
      return;
    }

    console.log(`📊 Total de eventos: ${allEvents.length}`);
    console.log('');

    // Mostrar todos los eventos
    allEvents.forEach((event, index) => {
      const startTime = new Date(event.start_time);
      const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;
      const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      console.log(`${index + 1}. "${event.title}"`);
      console.log(`   📅 Fecha: ${startTime.toLocaleString('es-ES')}`);
      console.log(`   🔄 Tipo: ${event.type || 'sin tipo'}`);
      console.log(`   📊 Estado: ${event.status || 'sin estado'}`);
      console.log(`   👤 Cliente: ${client?.name || 'sin cliente'} (${client?.email || 'sin email'})`);
      console.log(`   ⏱️ En ${timeDiff > 0 ? timeDiff.toFixed(1) + ' horas' : 'pasado'}`);
      console.log('');
    });

    // 2. Filtrar por tipo 'meeting'
    console.log('📋 2. FILTRO POR TIPO "MEETING":');
    console.log('===============================');

    const meetingEvents = allEvents.filter(event => event.type === 'meeting');
    console.log(`📊 Reuniones (type=meeting): ${meetingEvents.length}`);

    if (meetingEvents.length === 0) {
      console.log('⚠️ No hay eventos con type="meeting"');
      console.log('💡 SOLUCIÓN: Al crear reuniones, asegúrate de seleccionar tipo "meeting"');
      console.log('');
    } else {
      meetingEvents.forEach((event, index) => {
        const startTime = new Date(event.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        console.log(`${index + 1}. "${event.title}" - En ${timeDiff.toFixed(1)} horas`);
      });
      console.log('');
    }

    // 3. Filtrar por estado 'scheduled'
    console.log('📋 3. FILTRO POR ESTADO "SCHEDULED":');
    console.log('==================================');

    const scheduledMeetings = meetingEvents.filter(event => event.status === 'scheduled');
    console.log(`📊 Reuniones programadas (status=scheduled): ${scheduledMeetings.length}`);

    if (scheduledMeetings.length === 0) {
      console.log('⚠️ No hay reuniones con status="scheduled"');
      console.log('💡 SOLUCIÓN: Verifica que las reuniones tengan estado "scheduled" (programado)');
      console.log('');
    } else {
      scheduledMeetings.forEach((event, index) => {
        const startTime = new Date(event.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        console.log(`${index + 1}. "${event.title}" - En ${timeDiff.toFixed(1)} horas - Estado: ${event.status}`);
      });
      console.log('');
    }

    // 4. Filtrar por ventana de tiempo (1-3 horas)
    console.log('📋 4. FILTRO POR VENTANA DE TIEMPO (1-3 HORAS):');
    console.log('==============================================');

    const upcomingMeetings = scheduledMeetings.filter(event => {
      const startTime = new Date(event.start_time);
      const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return timeDiff >= 1 && timeDiff <= 3;
    });

    console.log(`📊 Reuniones en ventana de 1-3 horas: ${upcomingMeetings.length}`);

    if (upcomingMeetings.length === 0) {
      console.log('⚠️ No hay reuniones en la ventana de 1-3 horas');
      console.log('💡 Para que se detecten, las reuniones deben estar entre 1 y 3 horas en el futuro');

      // Mostrar reuniones cercanas
      const allUpcoming = scheduledMeetings.filter(event => {
        const startTime = new Date(event.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return timeDiff > 0 && timeDiff < 24; // próximas 24 horas
      });

      if (allUpcoming.length > 0) {
        console.log('');
        console.log('🔍 Reuniones próximas (próximas 24 horas):');
        allUpcoming.forEach((event, index) => {
          const startTime = new Date(event.start_time);
          const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
          const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;
          console.log(`${index + 1}. "${event.title}"`);
          console.log(`   📅 En ${timeDiff.toFixed(1)} horas (${startTime.toLocaleString('es-ES')})`);
          console.log(`   👤 Cliente: ${client?.name || 'Sin cliente'} (${client?.email || 'Sin email'})`);
          console.log(`   ✅ Será detectada cuando esté entre 1-3 horas antes`);
          console.log('');
        });
      }

    } else {
      console.log('✅ ¡Reuniones encontradas en ventana correcta!');
      upcomingMeetings.forEach((event, index) => {
        const startTime = new Date(event.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;
        console.log(`${index + 1}. "${event.title}"`);
        console.log(`   📅 En ${timeDiff.toFixed(1)} horas (${startTime.toLocaleString('es-ES')})`);
        console.log(`   👤 Cliente: ${client?.name || 'Sin cliente'} (${client?.email || 'Sin email'})`);
        console.log(`   🎯 ¡DEBERÍA enviarse recordatorio!`);
        console.log('');
      });
    }

    // 5. Verificar clientes con email
    console.log('📋 5. VERIFICACIÓN DE CLIENTES CON EMAIL:');
    console.log('=======================================');

    const meetingsWithoutClient = upcomingMeetings.filter(event => !event.client_id);
    const meetingsWithoutEmail = upcomingMeetings.filter(event => {
      const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;
      return event.client_id && (!client || !client.email);
    });

    if (meetingsWithoutClient.length > 0) {
      console.log(`⚠️ ${meetingsWithoutClient.length} reuniones sin cliente asignado`);
      console.log('💡 SOLUCIÓN: Asigna clientes a las reuniones desde el calendario');
    }

    if (meetingsWithoutEmail.length > 0) {
      console.log(`⚠️ ${meetingsWithoutEmail.length} reuniones con cliente sin email`);
      console.log('💡 SOLUCIÓN: Agrega emails a los clientes desde /dashboard/clients');
    }

    const validMeetings = upcomingMeetings.filter(event => {
      const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;
      return event.client_id && client && client.email;
    });

    console.log(`✅ ${validMeetings.length} reuniones válidas para envío de recordatorio`);

    // 6. Resumen y recomendaciones
    console.log('');
    console.log('📋 RESUMEN Y RECOMENDACIONES:');
    console.log('============================');

    if (validMeetings.length > 0) {
      console.log('✅ Hay reuniones válidas que deberían generar recordatorios');
      console.log('🔧 Si no se están enviando emails, revisar:');
      console.log('   - Configuración de email en .env.local');
      console.log('   - Logs del sistema de automatización');
      console.log('   - Estado de la automatización en base de datos');
    } else {
      console.log('⚠️ No hay reuniones válidas en la ventana de 1-3 horas');
      console.log('');
      console.log('🔧 PARA QUE EL SISTEMA FUNCIONE:');
      console.log('1. Crear reunión en calendario: http://localhost:3000/dashboard/calendar');
      console.log('2. Tipo: Seleccionar "meeting" (reunión)');
      console.log('3. Fecha: 1-3 horas en el futuro');
      console.log('4. Cliente: Asignar cliente con email válido');
      console.log('5. Estado: "scheduled" (programado)');
      console.log('6. El sistema detectará automáticamente y enviará recordatorio');
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnoseMeetingDetection();
