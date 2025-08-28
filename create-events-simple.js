require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Creating test events...');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createEvents() {
    try {
        // Get user ID
        const { data: users } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        const userId = users[0].id;
        console.log(`✅ Using user: ${userId}`);

        const today = '2025-08-28';

        const events = [
            {
                user_id: userId,
                title: 'Reunión Cliente Web',
                start_time: `${today}T09:00:00`,
                end_time: `${today}T10:30:00`,
                type: 'meeting',
                status: 'completed',
                is_billable: true,
                hourly_rate: 50.00
            },
            {
                user_id: userId,
                title: 'Desarrollo Dashboard',
                start_time: `${today}T11:00:00`,
                end_time: `${today}T13:00:00`,
                type: 'work',
                status: 'completed',
                is_billable: true,
                hourly_rate: 45.00
            },
            {
                user_id: userId,
                title: 'Break Almuerzo',
                start_time: `${today}T13:00:00`,
                end_time: `${today}T14:00:00`,
                type: 'break',
                status: 'completed',
                is_billable: false,
                hourly_rate: 0
            }
        ];

        const { data, error } = await supabase
            .from('calendar_events')
            .insert(events)
            .select();

        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log(`✅ Created ${data.length} events`);
            data.forEach(e => console.log(`  - ${e.title}`));
        }

    } catch (err) {
        console.error('💥 Error:', err);
    }
}

createEvents();
