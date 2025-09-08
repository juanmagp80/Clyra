require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestData() {
  try {
    console.log('🎯 Creando datos de prueba completos para el Detector de Riesgos...');
    
    // Primero obtener o crear un usuario en profiles
    console.log('👤 Verificando usuario...');
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();

    if (profileError || !profile) {
      console.log('📝 Creando perfil de usuario...');
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'usuario@test.com',
          full_name: 'Usuario de Prueba',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createProfileError) {
        console.error('Error creando perfil:', createProfileError);
        return;
      }
      profile = newProfile;
      console.log('✅ Perfil creado:', profile.full_name);
    } else {
      console.log('✅ Usando perfil existente:', profile.full_name || profile.email);
    }
    
    const USER_ID = profile.id;
    
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
      if (clientError.code === '23505') {
        console.log('⚠️  Cliente ya existe, obteniendo datos...');
        const { data: existingClient } = await supabase
          .from('clients')
          .select('*')
          .eq('email', 'contacto@techcorp.com')
          .single();
        
        if (existingClient) {
          console.log('✅ Usando cliente existente:', existingClient.name);
          Object.assign(client, existingClient);
        }
      } else {
        console.error('Error creando cliente:', clientError);
        return;
      }
    } else {
      console.log('✅ Cliente creado:', client.name);
    }

    console.log('📂 Creando proyecto...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: 'Sistema de Gestión Empresarial',
        description: 'Desarrollo de un sistema completo de gestión empresarial con módulos de CRM, inventario, facturación y reportes avanzados. Incluye integración con APIs externas, dashboard analytics y sistema de notificaciones en tiempo real.',
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
      if (projectError.code === '23505') {
        console.log('⚠️  Proyecto ya existe, obteniendo datos...');
        const { data: existingProject } = await supabase
          .from('projects')
          .select('*')
          .eq('name', 'Sistema de Gestión Empresarial')
          .eq('client_id', client.id)
          .single();
        
        if (existingProject) {
          console.log('✅ Usando proyecto existente:', existingProject.name);
          Object.assign(project, existingProject);
        }
      } else {
        console.error('Error creando proyecto:', projectError);
        return;
      }
    } else {
      console.log('✅ Proyecto creado:', project.name);
    }

    console.log('📋 Creando tareas...');
    const tasks = [
      {
        title: 'Análisis de requisitos del sistema',
        description: 'Reuniones con stakeholders, documentación de requisitos funcionales y no funcionales, análisis de casos de uso',
        project_id: project.id,
        user_id: USER_ID,
        status: 'completed',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Diseño de arquitectura y base de datos',
        description: 'Diseño del esquema de base de datos, arquitectura del sistema, diagramas UML y especificaciones técnicas',
        project_id: project.id,
        user_id: USER_ID,
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Desarrollo del módulo CRM',
        description: 'Implementación completa del sistema de gestión de clientes con funcionalidades de seguimiento y comunicación',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Módulo de inventario y facturación',
        description: 'Sistema completo de gestión de inventario con generación automática de facturas y reportes financieros',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Integración de APIs externas',
        description: 'Integración con sistemas de pago, servicios de envío, APIs de terceros y servicios en la nube',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Dashboard y sistema de reportes',
        description: 'Desarrollo de dashboard interactivo con gráficos en tiempo real y sistema de reportes avanzados',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Testing y validación del sistema',
        description: 'Pruebas unitarias, integración, pruebas de carga, seguridad y validación con usuarios finales',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Despliegue y configuración de producción',
        description: 'Configuración de servidores de producción, CI/CD, monitoreo y documentación de deployment',
        project_id: project.id,
        user_id: USER_ID,
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Verificar si las tareas ya existen
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project.id);

    if (existingTasks && existingTasks.length > 0) {
      console.log(`⚠️  Ya existen ${existingTasks.length} tareas para este proyecto`);
    } else {
      const { data: createdTasks, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasks)
        .select();

      if (tasksError) {
        console.error('Error creando tareas:', tasksError);
      } else {
        console.log(`✅ ${createdTasks.length} tareas creadas`);
      }
    }

    console.log('📊 Creando propuesta...');
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        client_id: client.id,
        project_name: 'Sistema de Gestión Empresarial',
        services: {
          development: 'Desarrollo completo del sistema de gestión',
          consulting: 'Consultoría técnica y arquitectura',
          testing: 'Testing y QA completo',
          support: 'Soporte post-implementación 6 meses',
          training: 'Capacitación del equipo'
        },
        pricing: {
          development: 10000,
          consulting: 2500,
          testing: 1500,
          support: 750,
          training: 250,
          total: 15000
        },
        user_id: USER_ID,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (proposalError) {
      if (proposalError.code === '23505') {
        console.log('⚠️  Propuesta ya existe');
      } else {
        console.error('Error creando propuesta:', proposalError);
      }
    } else {
      console.log('✅ Propuesta creada');
    }

    console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`👤 Cliente: ${client.name} (${client.email})`);
    console.log(`📂 Proyecto: ${project.name}`);
    console.log(`💰 Presupuesto: €${project.budget.toLocaleString()}`);
    console.log(`📅 Duración: ${project.start_date} → ${project.end_date}`);
    console.log(`📋 Tareas: ${tasks.length} tareas planificadas`);
    console.log(`📄 Propuesta: €15,000 con múltiples servicios`);
    
    console.log('\n🚀 ¡Ahora puedes probar el Detector de Riesgos!');
    console.log('1. Ve a: http://localhost:3000/dashboard/ai-automations');
    console.log('2. Busca "Detector de Riesgos de Proyecto"');
    console.log('3. Selecciona cliente "TechCorp Solutions"');
    console.log('4. Selecciona proyecto "Sistema de Gestión Empresarial"');
    console.log('5. ¡Ejecuta el análisis de riesgos con IA! 🤖');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    process.exit(0);
  }
}

createTestData();
