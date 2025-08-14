require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeActualBudgetMonitoring() {
  try {
    console.log('🚀 Ejecutando automatización real de presupuesto...');
    
    // Buscar el proyecto test que creamos
    const { data: testProject } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        budget,
        client_id,
        user_id,
        clients (
          id,
          name,
          email
        ),
        tasks!inner (
          id,
          status
        )
      `)
      .ilike('name', '%Test Presupuesto Excedido%')
      .eq('status', 'active')
      .single();
    
    if (!testProject) {
      console.log('❌ No se encontró proyecto de test');
      return;
    }
    
    console.log('✅ Proyecto encontrado:', testProject.name);
    
    // Simular gasto excedido
    const completedTasks = testProject.tasks.filter(t => t.status === 'completed').length;
    const totalSpent = completedTasks * 200; // 200€ por tarea
    const budgetPercentage = (totalSpent / testProject.budget) * 100;
    
    console.log(`💰 Presupuesto: ${testProject.budget}€`);
    console.log(`💸 Gastado: ${totalSpent}€`);
    console.log(`📊 Porcentaje: ${budgetPercentage}%`);
    
    if (budgetPercentage >= 80) {
      console.log('🚨 PRESUPUESTO EXCEDIDO - Ejecutando automatización...');
      
      // Obtener automatización de presupuesto
      const { data: automation } = await supabase
        .from('automations')
        .select('*')
        .ilike('name', '%presupuesto%')
        .eq('is_active', true)
        .single();
        
      if (!automation) {
        console.log('❌ Automatización no encontrada');
        return;
      }
      
      // Obtener perfil del usuario
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testProject.user_id)
        .single();
      
      // Preparar datos para envío de email
      const emailData = {
        to: 'juangpdev@gmail.com', // Usar tu email para la prueba
        subject: `⚠️ Alerta de Presupuesto - ${testProject.name} (${Math.round(budgetPercentage)}% utilizado)`,
        template: JSON.parse(automation.actions)[0].parameters.template,
        variables: {
          project_name: testProject.name,
          client_name: testProject.clients?.name || 'Cliente Test',
          budget_total: testProject.budget.toLocaleString('es-ES'),
          budget_spent: totalSpent.toLocaleString('es-ES'),
          budget_percentage: Math.round(budgetPercentage),
          budget_remaining: Math.max(0, testProject.budget - totalSpent).toLocaleString('es-ES'),
          user_name: userProfile?.full_name || 'Juan García',
          user_email: userProfile?.email || 'juangpdev@gmail.com',
          user_company: 'INSTELCA S.L.U'
        }
      };
      
      // Reemplazar variables en el template
      let htmlContent = emailData.template;
      Object.entries(emailData.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, value);
      });
      
      console.log('📧 Enviando email de alerta...');
      
      // Llamar al API de envío de email
      const response = await fetch('http://localhost:3000/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: htmlContent,
          replyTo: emailData.variables.user_email
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email enviado exitosamente!');
        console.log('📧 ID del email:', result.id);
        
        // Registrar ejecución
        await supabase
          .from('automation_executions')
          .insert({
            automation_id: automation.id,
            user_id: testProject.user_id,
            client_id: testProject.client_id,
            execution_id: `budget-test-${Date.now()}`,
            status: 'success',
            metadata: {
              project_id: testProject.id,
              project_name: testProject.name,
              budget_percentage: Math.round(budgetPercentage),
              budget_spent: totalSpent,
              trigger_type: 'budget_exceeded_test'
            },
            executed_at: new Date().toISOString()
          });
          
        console.log('📊 Ejecución registrada en la base de datos');
        
      } else {
        console.error('❌ Error enviando email:', response.status);
      }
      
    } else {
      console.log('✅ Presupuesto dentro del límite');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

executeActualBudgetMonitoring();
