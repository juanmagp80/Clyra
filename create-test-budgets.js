require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestBudgets() {
  try {
    console.log('💰 Creando presupuestos de prueba para el Optimizador de Precios...');
    
    // Obtener cualquier cliente existente
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    if (clientsError || !clients || clients.length === 0) {
      console.log('❌ No se encontraron clientes. Creando cliente de prueba...');
      
      // Obtener el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (profileError || !profile) {
        console.error('❌ No se encontró perfil de usuario');
        return;
      }

      // Crear cliente
      const { data: newClient, error: newClientError } = await supabase
        .from('clients')
        .insert({
          name: 'TechCorp Solutions',
          email: 'contacto@techcorp.com',
          company: 'TechCorp Solutions',
          phone: '+34 600 123 456',
          user_id: profile.id
        })
        .select()
        .single();

      if (newClientError) {
        console.error('Error creando cliente:', newClientError);
        return;
      }

      console.log('✅ Cliente creado:', newClient.name);
      var client = newClient;
    } else {
      var client = clients[0];
      console.log('✅ Cliente encontrado:', client.name);
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();

    if (profileError || !profile) {
      console.error('❌ No se encontró perfil de usuario');
      return;
    }

    console.log('✅ Cliente encontrado:', client.name);
    console.log('✅ Perfil encontrado:', profile.email);

    // Crear presupuesto principal
    const { data: budget1, error: budget1Error } = await supabase
      .from('budgets')
      .insert({
        user_id: profile.id,
        client_id: client.id,
        title: 'Desarrollo Web Completo - TechCorp',
        description: 'Desarrollo de sitio web corporativo con sistema de gestión de contenidos, e-commerce integrado y panel de administración',
        status: 'draft',
        total_amount: 0, // Se calculará automáticamente
        tax_rate: 21.00,
        notes: 'Proyecto web completo con múltiples funcionalidades',
        terms_conditions: 'Pago 50% al inicio, 50% al completar. Incluye 3 meses de soporte post-lanzamiento.'
      })
      .select()
      .single();

    if (budget1Error) {
      console.error('Error creando presupuesto 1:', budget1Error);
      return;
    }

    console.log('✅ Presupuesto principal creado:', budget1.title);

    // Crear items para el presupuesto 1
    const budget1Items = [
      {
        budget_id: budget1.id,
        title: 'Diseño UI/UX y Prototipado',
        description: 'Diseño completo de la interfaz de usuario, experiencia de usuario y prototipado interactivo',
        quantity: 40,
        unit_price: 75,
        type: 'hours'
      },
      {
        budget_id: budget1.id,
        title: 'Desarrollo Frontend (React/Next.js)',
        description: 'Desarrollo de la parte frontend del sitio web con React y Next.js, responsive design',
        quantity: 80,
        unit_price: 85,
        type: 'hours'
      },
      {
        budget_id: budget1.id,
        title: 'Desarrollo Backend (API + Base de Datos)',
        description: 'Desarrollo del backend, APIs REST, integración con base de datos PostgreSQL',
        quantity: 60,
        unit_price: 90,
        type: 'hours'
      },
      {
        budget_id: budget1.id,
        title: 'Sistema de E-commerce',
        description: 'Integración completa de sistema de comercio electrónico con pasarelas de pago',
        quantity: 1,
        unit_price: 2500,
        type: 'fixed'
      },
      {
        budget_id: budget1.id,
        title: 'Panel de Administración',
        description: 'Desarrollo de panel de administración para gestión de contenidos y productos',
        quantity: 35,
        unit_price: 80,
        type: 'hours'
      },
      {
        budget_id: budget1.id,
        title: 'Testing y QA',
        description: 'Pruebas completas del sistema, testing de seguridad y optimización de rendimiento',
        quantity: 25,
        unit_price: 70,
        type: 'hours'
      },
      {
        budget_id: budget1.id,
        title: 'Despliegue y Configuración',
        description: 'Configuración de servidores, dominio, SSL, CDN y puesta en producción',
        quantity: 1,
        unit_price: 800,
        type: 'fixed'
      }
    ];

    const { data: items1, error: items1Error } = await supabase
      .from('budget_items')
      .insert(budget1Items);

    if (items1Error) {
      console.error('Error creando items del presupuesto 1:', items1Error);
    } else {
      console.log('✅ Items del presupuesto 1 creados:', budget1Items.length);
    }

    // Crear segundo presupuesto (más simple)
    const { data: budget2, error: budget2Error } = await supabase
      .from('budgets')
      .insert({
        user_id: profile.id,
        client_id: client.id,
        title: 'Consultoría en Transformación Digital',
        description: 'Análisis y consultoría para la transformación digital de procesos empresariales',
        status: 'sent',
        total_amount: 0, // Se calculará automáticamente
        tax_rate: 21.00,
        notes: 'Proyecto de consultoría estratégica',
        terms_conditions: 'Pago mensual. Mínimo 3 meses de compromiso.'
      })
      .select()
      .single();

    if (budget2Error) {
      console.error('Error creando presupuesto 2:', budget2Error);
      return;
    }

    console.log('✅ Segundo presupuesto creado:', budget2.title);

    // Crear items para el presupuesto 2
    const budget2Items = [
      {
        budget_id: budget2.id,
        title: 'Análisis de Procesos Actuales',
        description: 'Auditoría completa de procesos empresariales existentes y identificación de mejoras',
        quantity: 30,
        unit_price: 120,
        type: 'hours'
      },
      {
        budget_id: budget2.id,
        title: 'Estrategia de Transformación Digital',
        description: 'Desarrollo de hoja de ruta personalizada para la transformación digital',
        quantity: 20,
        unit_price: 150,
        type: 'hours'
      },
      {
        budget_id: budget2.id,
        title: 'Implementación de Herramientas',
        description: 'Configuración e implementación de herramientas digitales seleccionadas',
        quantity: 25,
        unit_price: 100,
        type: 'hours'
      },
      {
        budget_id: budget2.id,
        title: 'Formación del Equipo',
        description: 'Capacitación del personal en nuevas herramientas y procesos digitales',
        quantity: 16,
        unit_price: 90,
        type: 'hours'
      },
      {
        budget_id: budget2.id,
        title: 'Soporte y Seguimiento (3 meses)',
        description: 'Soporte continuo y seguimiento de la implementación durante 3 meses',
        quantity: 1,
        unit_price: 1200,
        type: 'milestone'
      }
    ];

    const { data: items2, error: items2Error } = await supabase
      .from('budget_items')
      .insert(budget2Items);

    if (items2Error) {
      console.error('Error creando items del presupuesto 2:', items2Error);
    } else {
      console.log('✅ Items del presupuesto 2 creados:', budget2Items.length);
    }

    // Obtener totales actualizados
    const { data: updatedBudgets, error: updatedError } = await supabase
      .from('budgets')
      .select('id, title, total_amount')
      .in('id', [budget1.id, budget2.id]);

    console.log('\n🎉 ¡Presupuestos de prueba creados exitosamente!');
    console.log('\n📊 Resumen:');
    
    if (updatedBudgets) {
      updatedBudgets.forEach(budget => {
        console.log(`💰 ${budget.title}: €${budget.total_amount?.toLocaleString() || '0'}`);
      });
    }

    console.log(`\n👤 Cliente: ${client.name} (${client.email})`);
    console.log(`📋 Total de presupuestos: 2`);
    console.log(`📦 Total de items: ${budget1Items.length + budget2Items.length}`);
    
    console.log('\n🚀 ¡Ahora puedes probar el Optimizador de Precios!');
    console.log('1. Ve a: http://localhost:3000/dashboard/ai-automations');
    console.log('2. Busca "Optimizador de Precios"');
    console.log('3. Selecciona cliente "TechCorp Solutions"');
    console.log('4. Elige uno de los presupuestos creados');
    console.log('5. ¡Ejecuta la optimización con IA! 💰');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    process.exit(0);
  }
}

createTestBudgets();
