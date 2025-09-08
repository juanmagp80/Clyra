#!/bin/bash

# Script para crear datos de prueba completos via Supabase
echo "🎯 Creando datos de prueba completos para el Detector de Riesgos..."

# Primero obtener el user_id del usuario actual
USER_ID=$(node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: users } = await supabase.auth.admin.listUsers();
  if (users.users.length > 0) {
    console.log(users.users[0].id);
  } else {
    console.log('no-user-found');
  }
})();
")

if [ "$USER_ID" = "no-user-found" ]; then
  echo "❌ No se encontró usuario. Creando usuario de prueba..."
  USER_ID="550e8400-e29b-41d4-a716-446655440000"
fi

echo "👤 Usando USER_ID: $USER_ID"

# Crear datos usando node directamente
node << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestData() {
  try {
    const USER_ID = process.env.USER_ID || '550e8400-e29b-41d4-a716-446655440000';
    
    console.log('📝 Creando cliente...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: 'TechCorp Solutions',
        email: 'contacto@techcorp.com',
        company: 'TechCorp Solutions',
        phone: '+34 600 123 456',
        user_id: USER_ID
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creando cliente:', clientError);
      return;
    }
    console.log('✅ Cliente creado:', client.name);

    console.log('📂 Creando proyecto...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: 'Sistema de Gestión Empresarial',
        description: 'Desarrollo de un sistema completo de gestión empresarial con módulos de CRM, inventario, facturación y reportes avanzados',
        client_id: client.id,
        user_id: USER_ID,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: 15000,
        status: 'in_progress'
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creando proyecto:', projectError);
      return;
    }
    console.log('✅ Proyecto creado:', project.name);

    console.log('📋 Creando tareas...');
    const tasks = [
      {
        title: 'Análisis de requisitos del sistema',
        description: 'Reuniones con stakeholders y documentación de requisitos funcionales y no funcionales',
        project_id: project.id,
        user_id: USER_ID,
        status: 'completed',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Diseño de arquitectura y base de datos',
        description: 'Diseño del esquema de base de datos y arquitectura del sistema',
        project_id: project.id,
        user_id: USER_ID,
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Desarrollo del módulo CRM',
        description: 'Implementación completa del sistema de gestión de clientes',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Integración de APIs externas',
        description: 'Integración con sistemas de facturación y servicios externos',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Testing y validación del sistema',
        description: 'Pruebas unitarias, integración y pruebas de usuario',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: createdTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();

    if (tasksError) {
      console.error('Error creando tareas:', tasksError);
    } else {
      console.log(`✅ ${createdTasks.length} tareas creadas`);
    }

    console.log('📊 Creando propuesta...');
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        client_id: client.id,
        project_name: 'Sistema de Gestión Empresarial',
        services: {
          development: 'Desarrollo completo del sistema',
          consulting: 'Consultoría técnica',
          support: 'Soporte post-implementación'
        },
        pricing: {
          development: 12000,
          consulting: 2000,
          support: 1000,
          total: 15000
        },
        user_id: USER_ID,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (proposalError) {
      console.error('Error creando propuesta:', proposalError);
    } else {
      console.log('✅ Propuesta creada');
    }

    console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`👤 Cliente: ${client.name} (${client.email})`);
    console.log(`📂 Proyecto: ${project.name}`);
    console.log(`💰 Presupuesto: €${project.budget.toLocaleString()}`);
    console.log(`📋 Tareas: ${tasks.length} tareas creadas`);
    console.log(`📄 Propuesta: Creada para €${proposal?.pricing?.total || 15000}`);
    
    console.log('\n🚀 Ahora puedes ir a:');
    console.log('http://localhost:3000/dashboard/ai-automations');
    console.log('Y probar el Detector de Riesgos de Proyecto!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createTestData();
EOF
