require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Starting test events creation...');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('✅ Supabase client initialized');

async function createTestEvents() {
  try {
    console.log('�� Creating events for today...');
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`📆 Today is: ${todayStr}`);

    // Delete existing events for today first
    console.log('🧹 Cleaning up existing events...');
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .gte('start_time', `${todayStr}T00:00:00`)
      .lt('start_time', `${todayStr}T23:59:59`);

    if (deleteError) {
      console.error('❌ Error deleting events:', deleteError);
    } else {
      console.log('✅ Existing events cleaned up');
    }

    // Create test events for today
    const events = [
      {
        title: 'Reunión con Cliente - Desarrollo Web',
        description: 'Revisión de propuesta y planificación del proyecto',
        start_time: `${todayStr}T09:00:00`,
        end_time: `${todayStr}T10:30:00`,
        type: 'meeting',
        status: 'completed',
        is_billable: true,
        hourly_rate: 50.00
      },
      {
        title: 'Desarrollo Frontend - Dashboard',
        description: 'Implementación de componentes React',
        start_time: `${todayStr}T11:00:00`,
        end_time: `${todayStr}T13:00:00`,
        type: 'work',
        status: 'completed',
        is_billable: true,
        hourly_rate: 45.00
      },
      {
        title: 'Descanso - Almuerzo',
        description: 'Pausa para almorzar',
        start_time: `${todayStr}T13:00:00`,
        end_time: `${todayStr}T14:00:00`,
        type: 'break',
        status: 'completed',
        is_billable: false,
        hourly_rate: 0.00
      },
      {
        title: 'Consultoría Técnica - API Integration',
        description: 'Asesoramiento sobre integración de APIs',
        start_time: `${todayStr}T14:30:00`,
        end_time: `${todayStr}T16:00:00`,
        type: 'meeting',
        status: 'completed',
        is_billable: true,
        hourly_rate: 75.00
      },
      {
        title: 'Reunión Equipo - Planning Sprint',
        description: 'Planificación del próximo sprint',
        start_time: `${todayStr}T16:30:00`,
        end_time: `${todayStr}T17:30:00`,
        type: 'meeting',
        status: 'scheduled',
        is_billable: false,
        hourly_rate: 0.00
      }
    ];

    console.log(`📝 Inserting ${events.length} test events...`);

    // Insert events
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(events)
      .select();

    if (error) {
      console.error('❌ Error creating events:', error);
      throw error;
    }

    console.log('✅ Events created successfully!');
    console.log(`📊 Created ${data.length} events:`);
    
    data.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} (${event.start_time.split('T')[1].slice(0,5)} - ${event.end_time.split('T')[1].slice(0,5)})`);
    });

    return data;

  } catch (error) {
    console.error('💥 Error in createTestEvents:', error);
    throw error;
  }
}

// Execute the function
createTestEvents()
  .then(() => {
    console.log('🎉 Test events creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create test events:', error);
    process.exit(1);
  });
