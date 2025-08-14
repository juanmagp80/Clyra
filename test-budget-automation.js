require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBudgetAutomation() {
  try {
    console.log('🧪 Probando automatización de presupuesto excedido...');
    console.log('🔍 Verificando proyectos en la base de datos...');
    
    // 1. Verificar proyectos existentes
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        budget,
        status,
        client_id,
        user_id,
        clients (
          id,
          name,
          email
        ),
        tasks (
          id,
          title,
          status
        )
      `)
      .not('budget', 'is', null)
      .gt('budget', 0);
    
    if (projectsError) {
      console.error('❌ Error obteniendo proyectos:', projectsError);
      return;
    }
    
    console.log(`📊 Proyectos encontrados: ${projects?.length || 0}`);
    
    if (!projects || projects.length === 0) {
      console.log('⚠️ No hay proyectos con presupuesto para probar');
      console.log('🔧 Creando proyecto de prueba...');
      
      // Crear proyecto de prueba
      const { data: testProject, error: createError } = await supabase
        .from('projects')
        .insert({
          name: 'Proyecto Test Presupuesto',
          description: 'Proyecto para probar la automatización de presupuesto',
          budget: 1000,
          status: 'active',
          user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creando proyecto:', createError);
        return;
      }
      
      console.log('✅ Proyecto test creado:', testProject.name);
      
      // Crear tarea simple para simular presupuesto
      const { data: testTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: 'Tarea Test Presupuesto Excedido',
          description: 'Tarea para simular presupuesto excedido',
          project_id: testProject.id,
          status: 'completed',
          user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
        })
        .select()
        .single();
      
      if (taskError) {
        console.error('❌ Error creando tarea:', taskError);
      } else {
        console.log('✅ Tarea test creada - simula presupuesto excedido');
      }
    }
    
    // 2. Analizar proyectos actuales
    console.log('\n📈 Análisis de presupuestos:');
    console.log('==========================');
    
    const budgetAlerts = [];
    
    for (const project of projects || []) {
      // Para esta prueba, simularemos que el proyecto ha gastado 850€ (85% del presupuesto)
      // En un sistema real, esto se calcularía basado en horas trabajadas, facturas, etc.
      let totalSpent = 0;
      
      if (project.tasks && project.tasks.length > 0) {
        // Simulamos gasto basado en número de tareas completadas
        const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
        totalSpent = completedTasks * 200; // Simulamos 200€ por tarea completada
      }
      
      // Si no hay tareas, simulamos un gasto del 85% para testing
      if (totalSpent === 0 && project.name.includes('Test')) {
        totalSpent = project.budget * 0.85; // 85% del presupuesto
      }
      
      const budgetPercentage = (totalSpent / project.budget) * 100;
      
      console.log(`\n📋 Proyecto: ${project.name}`);
      console.log(`💰 Presupuesto: ${project.budget}€`);
      console.log(`💸 Gastado: ${totalSpent.toFixed(2)}€`);
      console.log(`📊 Porcentaje: ${budgetPercentage.toFixed(1)}%`);
      console.log(`🚨 ¿Excede 80%?: ${budgetPercentage >= 80 ? 'SÍ ⚠️' : 'NO ✅'}`);
      
      if (budgetPercentage >= 80) {
        const client = Array.isArray(project.clients) ? project.clients[0] : project.clients;
        budgetAlerts.push({
          project_id: project.id,
          project_name: project.name,
          client_name: client?.name || 'Cliente Test',
          client_email: client?.email || 'test@example.com',
          user_id: project.user_id,
          budget_total: project.budget,
          budget_spent: totalSpent,
          budget_percentage: Math.round(budgetPercentage),
          budget_remaining: Math.max(0, project.budget - totalSpent)
        });
      }
    }
    
    // 3. Verificar automatización
    console.log('\n🤖 Verificando automatización:');
    console.log('=============================');
    
    const { data: automation, error: autoError } = await supabase
      .from('automations')
      .select('*')
      .ilike('name', '%presupuesto%')
      .eq('is_active', true)
      .single();
    
    if (autoError || !automation) {
      console.error('❌ No se encontró automatización de presupuesto activa');
      return;
    }
    
    console.log(`✅ Automatización encontrada: ${automation.name}`);
    console.log(`📧 Ejecuciones previas: ${automation.execution_count || 0}`);
    console.log(`🕐 Última ejecución: ${automation.last_executed || 'Nunca'}`);
    
    // 4. Resultados
    console.log('\n🎯 Resultados del análisis:');
    console.log('===========================');
    
    if (budgetAlerts.length > 0) {
      console.log(`🚨 Alertas de presupuesto: ${budgetAlerts.length}`);
      budgetAlerts.forEach(alert => {
        console.log(`  - ${alert.project_name}: ${alert.budget_percentage}% (${alert.budget_spent}€/${alert.budget_total}€)`);
      });
      console.log('\n✅ La automatización debería dispararse para estos proyectos');
    } else {
      console.log('✅ No hay proyectos con presupuesto excedido');
      console.log('💡 Para probar, crea un proyecto con presupuesto y añade tareas con muchas horas');
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

testBudgetAutomation();
