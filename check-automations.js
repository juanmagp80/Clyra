// Script para verificar las automatizaciones en la base de datos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://joyhaxtpmrmndmifsihn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A'
);

async function checkAutomations() {
  try {
    console.log('🔍 VERIFICANDO AUTOMATIZACIONES');
    console.log('===============================');

    // Buscar todas las automatizaciones
    const { data: allAutomations, error } = await supabase
      .from('automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Total automatizaciones: ${allAutomations?.length || 0}`);
    console.log('');

    if (allAutomations && allAutomations.length > 0) {
      allAutomations.forEach((auto, index) => {
        console.log(`${index + 1}. "${auto.name}"`);
        console.log(`   🆔 ID: ${auto.id}`);
        console.log(`   📋 Descripción: ${auto.description}`);
        console.log(`   🔄 Trigger: ${auto.trigger_type}`);
        console.log(`   ✅ Activo: ${auto.is_active ? 'Sí' : 'No'}`);
        console.log(`   📅 Creado: ${new Date(auto.created_at).toLocaleString('es-ES')}`);
        console.log(`   📊 Ejecuciones: ${auto.execution_count || 0}`);
        console.log('');
      });

      // Buscar específicamente automatizaciones de reunión
      console.log('🔍 AUTOMATIZACIONES DE REUNIÓN:');
      console.log('==============================');

      const meetingAutomations = allAutomations.filter(auto =>
        auto.name.toLowerCase().includes('recordatorio') ||
        auto.name.toLowerCase().includes('reunión') ||
        auto.name.toLowerCase().includes('meeting') ||
        auto.trigger_type === 'meeting_reminder'
      );

      if (meetingAutomations.length > 0) {
        console.log(`✅ Encontradas ${meetingAutomations.length} automatizaciones de reunión:`);
        meetingAutomations.forEach((auto, index) => {
          console.log(`${index + 1}. "${auto.name}" - ${auto.is_active ? 'ACTIVA' : 'INACTIVA'}`);
        });
      } else {
        console.log('⚠️ No hay automatizaciones de reunión');
      }

    } else {
      console.log('⚠️ No hay automatizaciones en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAutomations();
