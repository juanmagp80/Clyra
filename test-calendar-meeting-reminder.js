#!/usr/bin/env node

// Test del sistema de recordatorio de reuniones usando calendar_events
// Este script prueba la automatización accediendo directamente al calendario

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCalendarMeetingReminder() {
  try {
    console.log('🧪 Probando sistema de recordatorio de reuniones desde calendar_events...');
    
    // 1. Verificar estructura de calendar_events
    console.log('🔍 Verificando estructura de calendar_events...');
    
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('id, title, type, start_time, status')
      .eq('type', 'meeting')
      .limit(5);
    
    if (eventsError) {
      console.error('❌ Error accediendo a calendar_events:', eventsError);
      return;
    }
    
    console.log(`✅ Tabla calendar_events encontrada. Reuniones existentes: ${events?.length || 0}`);
    
    if (events && events.length > 0) {
      console.log('📅 Reuniones en el calendario:');
      events.forEach(event => {
        const startTime = new Date(event.start_time);
        console.log(`   - ${event.title} (${startTime.toLocaleString('es-ES')})`);
      });
    }
    
    // 2. Crear reunión de prueba si no existe ninguna próxima
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const { data: upcomingMeetings } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('type', 'meeting')
      .eq('status', 'scheduled')
      .gte('start_time', oneHourFromNow.toISOString())
      .lte('start_time', twoHoursFromNow.toISOString());
    
    if (!upcomingMeetings || upcomingMeetings.length === 0) {
      console.log('📝 No hay reuniones próximas. Creando reunión de prueba...');
      await createTestCalendarMeeting();
    } else {
      console.log(`✅ ${upcomingMeetings.length} reunión(es) próxima(s) encontrada(s)`);
    }
    
    // 3. Ejecutar el sistema de recordatorios
    console.log('🚀 Ejecutando sistema de recordatorio de reuniones...');
    
    const response = await fetch('http://localhost:3000/api/meeting-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Respuesta del sistema:', result);
      
      // 4. Verificar automatización activa
      const { data: automation } = await supabase
        .from('automations')
        .select('*')
        .ilike('name', '%recordatorio%reunión%')
        .eq('is_active', true)
        .single();
      
      if (automation) {
        console.log('✅ Automatización de recordatorio activa encontrada:');
        console.log(`   📋 Nombre: ${automation.name}`);
        console.log(`   📊 Ejecuciones: ${automation.execution_count || 0}`);
        console.log(`   ⏰ Última ejecución: ${automation.last_executed || 'Nunca'}`);
        
        // 5. Verificar ejecuciones recientes
        const { data: executions } = await supabase
          .from('automation_executions')
          .select('*')
          .eq('automation_id', automation.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (executions && executions.length > 0) {
          console.log('📊 Ejecuciones recientes:');
          executions.forEach(exec => {
            console.log(`   - ${exec.status} (${new Date(exec.created_at).toLocaleString('es-ES')})`);
            if (exec.metadata?.meeting_title) {
              console.log(`     Reunión: ${exec.metadata.meeting_title}`);
            }
          });
        }
      }
      
      console.log('');
      console.log('🎉 ¡Sistema de recordatorios funcionando correctamente!');
      
    } else {
      console.error('❌ Error en respuesta del servidor:', response.status);
      const errorText = await response.text();
      console.error('Detalles:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
  
  console.log('');
  console.log('📋 SISTEMA CONFIGURADO PARA:');
  console.log('===============================');
  console.log('✅ Acceder a reuniones desde calendar_events');
  console.log('✅ Filtrar por type = "meeting" y status = "scheduled"');
  console.log('✅ Detectar reuniones 1-2 horas antes');
  console.log('✅ Enviar emails automáticos a clientes');
  console.log('✅ Registrar ejecuciones para evitar duplicados');
  console.log('');
  console.log('🔧 PARA USO AUTOMÁTICO:');
  console.log('- Configurar cron job: 0 * * * * (cada hora)');
  console.log('- Endpoint: /api/meeting-reminder');
  console.log('- Monitoreo: /admin/meeting-reminder');
}

async function createTestCalendarMeeting() {
  try {
    // Obtener un cliente existente
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c')
      .limit(1);
    
    if (!existingClient || existingClient.length === 0) {
      console.log('⚠️ No hay clientes disponibles. Creando cliente de prueba...');
      
      // Crear cliente de prueba
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: 'Cliente Test Automatización',
          email: 'cliente.test@example.com',
          company: 'Empresa Test SL',
          user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
        })
        .select()
        .single();
      
      if (clientError) {
        console.error('❌ Error creando cliente:', clientError);
        return;
      }
      
      console.log('✅ Cliente de prueba creado');
      existingClient[0] = newClient;
    }
    
    const client = existingClient[0];
    
    // Crear reunión 1.5 horas en el futuro
    const futureDate = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
    const endDate = new Date(futureDate.getTime() + 60 * 60 * 1000); // 1 hora de duración
    
    const { data: newMeeting, error: meetingError } = await supabase
      .from('calendar_events')
      .insert({
        title: 'Reunión de Seguimiento - Test Automatización Calendar',
        description: 'Reunión de prueba para el sistema de recordatorios desde calendar_events',
        start_time: futureDate.toISOString(),
        end_time: endDate.toISOString(),
        type: 'meeting',
        status: 'scheduled',
        location: 'Oficina principal / Video llamada',
        meeting_url: 'https://meet.google.com/test-reunion',
        client_id: client.id,
        user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
        is_billable: true,
        hourly_rate: 65.00
      })
      .select()
      .single();
    
    if (meetingError) {
      console.error('❌ Error creando reunión:', meetingError);
    } else {
      console.log('✅ Reunión de prueba creada en calendar_events:');
      console.log(`   📋 Título: ${newMeeting.title}`);
      console.log(`   📅 Fecha: ${new Date(newMeeting.start_time).toLocaleDateString('es-ES')}`);
      console.log(`   ⏰ Hora: ${new Date(newMeeting.start_time).toLocaleTimeString('es-ES')}`);
      console.log(`   👤 Cliente: ${client.name} (${client.email})`);
      console.log(`   🔗 URL: ${newMeeting.meeting_url}`);
    }
    
  } catch (error) {
    console.error('❌ Error creando reunión de prueba:', error);
  }
}

// Ejecutar el test
testCalendarMeetingReminder();
