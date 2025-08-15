// Script para verificar todas las tablas posibles donde podría estar la reunión

const { createClient } = require('@supabase/supabase-js');

// Usar las variables hardcodeadas
const supabase = createClient(
  'https://joyhaxtpmrmndmifsihn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODA5NzUsImV4cCI6MjA2OTU1Njk3NX0.77Si27sIxzCtJqmw3Z81dJDejKcgaX9pm8eZMldPr4I'
);

async function findMeetings() {
  try {
    console.log('🔍 BUSCANDO REUNIONES EN TODAS LAS TABLAS POSIBLES');
    console.log('================================================');
    
    // 1. Verificar calendar_events
    console.log('1. 📅 Verificando calendar_events...');
    const { data: calendarEvents, error: calendarError } = await supabase
      .from('calendar_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (calendarError) {
      console.log(`   ❌ Error: ${calendarError.message}`);
    } else {
      console.log(`   📊 Eventos encontrados: ${calendarEvents?.length || 0}`);
      if (calendarEvents && calendarEvents.length > 0) {
        calendarEvents.forEach((event, i) => {
          console.log(`   ${i+1}. ${event.title} - ${event.start_time} (${event.type})`);
        });
      }
    }
    console.log('');
    
    // 2. Verificar si existe tabla meetings
    console.log('2. 📅 Verificando tabla meetings...');
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (meetingsError) {
      console.log(`   ❌ Error: ${meetingsError.message}`);
      if (meetingsError.message.includes('relation "public.meetings" does not exist')) {
        console.log('   💡 La tabla meetings no existe - esto es normal');
      }
    } else {
      console.log(`   📊 Reuniones encontradas: ${meetings?.length || 0}`);
      if (meetings && meetings.length > 0) {
        meetings.forEach((meeting, i) => {
          console.log(`   ${i+1}. ${meeting.title} - ${meeting.meeting_date} ${meeting.meeting_time}`);
        });
      }
    }
    console.log('');
    
    // 3. Verificar clientes (para poder crear reuniones)
    console.log('3. 👥 Verificando clientes disponibles...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, email')
      .limit(5);
    
    if (clientsError) {
      console.log(`   ❌ Error: ${clientsError.message}`);
    } else {
      console.log(`   📊 Clientes encontrados: ${clients?.length || 0}`);
      if (clients && clients.length > 0) {
        clients.forEach((client, i) => {
          console.log(`   ${i+1}. ${client.name} (${client.email || 'sin email'})`);
        });
      } else {
        console.log('   ⚠️ No hay clientes - necesarios para crear reuniones');
      }
    }
    console.log('');
    
    // 4. Verificar estructura de calendar_events
    console.log('4. 🔧 Verificando estructura de calendar_events...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'calendar_events' })
      .limit(1);
    
    if (tableError) {
      console.log('   ⚠️ No se pudo obtener estructura de tabla');
      console.log('   💡 Intentando insertar evento de prueba...');
      
      // Intentar crear evento de prueba
      const futureDate = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
      
      const { data: testEvent, error: insertError } = await supabase
        .from('calendar_events')
        .insert({
          title: 'Reunión de Prueba - Test Sistema',
          description: 'Reunión creada automáticamente para probar el sistema',
          start_time: futureDate.toISOString(),
          end_time: new Date(futureDate.getTime() + 60 * 60 * 1000).toISOString(),
          type: 'meeting',
          status: 'scheduled',
          user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c', // Usuario de prueba
          location: 'Oficina / Video llamada'
        })
        .select()
        .single();
      
      if (insertError) {
        console.log(`   ❌ Error insertando: ${insertError.message}`);
        console.log('   💡 Posibles problemas:');
        console.log('      - Tabla calendar_events no existe');
        console.log('      - Faltan columnas requeridas'); 
        console.log('      - Problemas de permisos RLS');
        console.log('      - Usuario no autenticado');
      } else {
        console.log('   ✅ Evento de prueba creado exitosamente');
        console.log(`   📅 ID: ${testEvent.id}`);
        console.log(`   📋 Título: ${testEvent.title}`);
        console.log(`   ⏰ Hora: ${new Date(testEvent.start_time).toLocaleString('es-ES')}`);
      }
    }
    console.log('');
    
    console.log('📋 DIAGNÓSTICO COMPLETO:');
    console.log('=======================');
    console.log('');
    console.log('🔧 POSIBLES CAUSAS DEL PROBLEMA:');
    console.log('1. La reunión no se creó correctamente en calendar_events');
    console.log('2. Problemas de RLS (Row Level Security) - usuario no autenticado');
    console.log('3. La reunión se creó pero con tipo diferente a "meeting"');
    console.log('4. La reunión se creó con estado diferente a "scheduled"');
    console.log('5. Faltan clientes con email para asociar a la reunión');
    console.log('');
    console.log('💡 SOLUCIONES RECOMENDADAS:');
    console.log('1. Ve al calendario: http://localhost:3000/dashboard/calendar');
    console.log('2. Verifica que puedes crear eventos');
    console.log('3. Asegúrate de seleccionar tipo "meeting"');
    console.log('4. Asigna un cliente con email válido');
    console.log('5. Verifica que se guarda correctamente');
    console.log('');
    console.log('🚀 PARA PROBAR INMEDIATAMENTE:');
    console.log('- Usa el evento de prueba que acabamos de crear (si funcionó)');
    console.log('- O crea una nueva reunión manualmente en el calendario');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

findMeetings();
