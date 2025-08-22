// Script para crear la tabla system_config
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://joyhaxtpmrmndmifsihn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A'
);

async function createSystemConfigTable() {
  try {
    console.log('🔧 Creando tabla system_config...');

    // Crear tabla usando query SQL directa
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('❌ Error creando tabla:', createError);
      
      // Intentar método alternativo
      console.log('🔄 Intentando método alternativo...');
      
      const { error: insertError } = await supabase
        .from('system_config')
        .upsert([
          {
            key: 'meeting_monitor_active',
            value: 'false',
            description: 'Estado del monitoreo automático de reuniones'
          },
          {
            key: 'meeting_monitor_last_execution',
            value: '',
            description: 'Última ejecución del monitoreo automático'
          }
        ]);

      if (insertError) {
        console.error('❌ Error insertando datos iniciales:', insertError);
        return;
      }
    }

    // Insertar configuración inicial
    const { error: configError } = await supabase
      .from('system_config')
      .upsert([
        {
          key: 'meeting_monitor_active',
          value: 'false',
          description: 'Estado del monitoreo automático de reuniones'
        },
        {
          key: 'meeting_monitor_last_execution',
          value: '',
          description: 'Última ejecución del monitoreo automático'
        }
      ]);

    if (configError) {
      console.error('❌ Error insertando configuración:', configError);
      return;
    }

    console.log('✅ Tabla system_config creada e inicializada correctamente');

    // Verificar que funciona
    const { data, error } = await supabase
      .from('system_config')
      .select('*');

    if (error) {
      console.error('❌ Error verificando tabla:', error);
    } else {
      console.log('📊 Configuración actual:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSystemConfigTable();
