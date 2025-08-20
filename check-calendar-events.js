// Script específico para calendar_events
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://joyhaxtpmrmndmifsihn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A'
);

async function checkCalendarEvents() {
  try {
    console.log('📅 VERIFICANDO CALENDAR_EVENTS');
    console.log('==============================');

    // 1. Verificar si existe la tabla
    const { count, error: countError } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error accediendo a calendar_events:', countError);
      console.log('💡 La tabla calendar_events puede no existir o no tener permisos');
      return;
    }

    console.log(`📊 Total de eventos: ${count || 0}`);

    if (count === 0) {
      console.log('⚠️ No hay eventos en calendar_events');
      console.log('');
      console.log('🔧 PARA CREAR UNA REUNIÓN DE PRUEBA:');
      console.log('1. Ve a: http://localhost:3000/dashboard/calendar');
      console.log('2. Haz click en "Crear evento"');
      console.log('3. Llena los datos:');
      console.log('   - Título: Reunión de prueba');
      console.log('   - Tipo: meeting');
      console.log('   - Fecha: 2 horas en el futuro');
      console.log('   - Cliente: Seleccionar un cliente');
      console.log('   - Estado: scheduled');
      console.log('4. Guardar');
      return;
    }

    // 2. Mostrar todos los eventos
    const { data: allEvents, error } = await supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        start_time,
        end_time,
        type,
        status,
        client_id,
        user_id
      `)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo eventos:', error);
      return;
    }

    console.log('');
    console.log('📋 TODOS LOS EVENTOS:');
    allEvents.forEach((event, index) => {
      const startTime = new Date(event.start_time);
      const now = new Date();
      const hoursFromNow = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      console.log(`${index + 1}. "${event.title}"`);
      console.log(`   🆔 ID: ${event.id}`);
      console.log(`   📅 Fecha: ${startTime.toLocaleString('es-ES')}`);
      console.log(`   🔄 Tipo: ${event.type || 'SIN TIPO'}`);
      console.log(`   📊 Estado: ${event.status || 'SIN ESTADO'}`);
      console.log(`   👤 Cliente ID: ${event.client_id || 'SIN CLIENTE'}`);
      console.log(`   👤 Usuario ID: ${event.user_id || 'SIN USUARIO'}`);
      console.log(`   ⏱️ ${hoursFromNow > 0 ? `En ${hoursFromNow.toFixed(1)} horas` : `Hace ${Math.abs(hoursFromNow).toFixed(1)} horas`}`);

      // Verificar si cumple criterios
      const isMeeting = event.type === 'meeting';
      const isScheduled = event.status === 'scheduled';
      const hasClient = !!event.client_id;
      const inWindow = hoursFromNow >= 1 && hoursFromNow <= 3;

      console.log(`   ✅ Es reunión (meeting): ${isMeeting ? 'SÍ' : 'NO'}`);
      console.log(`   ✅ Está programado (scheduled): ${isScheduled ? 'SÍ' : 'NO'}`);
      console.log(`   ✅ Tiene cliente: ${hasClient ? 'SÍ' : 'NO'}`);
      console.log(`   ✅ En ventana 1-3h: ${inWindow ? 'SÍ' : 'NO'}`);

      if (isMeeting && isScheduled && hasClient && inWindow) {
        console.log(`   🎯 ¡DEBERÍA DETECTARSE!`);
      }
      console.log('');
    });

    // 3. Filtros específicos
    const now = new Date();
    const oneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const threeHours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const validMeetings = allEvents.filter(event => {
      const startTime = new Date(event.start_time);
      const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return event.type === 'meeting' &&
        event.status === 'scheduled' &&
        event.client_id &&
        timeDiff >= 1 &&
        timeDiff <= 3;
    });

    console.log(`🎯 REUNIONES VÁLIDAS PARA RECORDATORIO: ${validMeetings.length}`);

    if (validMeetings.length === 0) {
      console.log('');
      console.log('❌ NO HAY REUNIONES QUE CUMPLAN TODOS LOS CRITERIOS');
      console.log('');
      console.log('Para que una reunión se detecte debe:');
      console.log('1. type = "meeting"');
      console.log('2. status = "scheduled"');
      console.log('3. client_id no vacío');
      console.log('4. start_time entre 1-3 horas en el futuro');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

checkCalendarEvents();
