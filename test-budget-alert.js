require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBudgetAlert() {
  try {
    console.log('🧪 Probando alerta de presupuesto excedido...');

    // Obtener la automatización de presupuesto
    const { data: automation, error: autoError } = await supabase
      .from('automations')
      .select('*')
      .ilike('name', '%presupuesto%')
      .single();

    if (autoError || !automation) {
      console.error('❌ No se encontró automatización de presupuesto');
      return;
    }

    console.log('✅ Automatización encontrada:', automation.name);

    // Datos de prueba
    const testData = {
      project_name: 'Desarrollo Web Corporativo',
      budget_total: '10.000',
      budget_spent: '8.500',
      budget_percentage: '85',
      budget_remaining: '1.500',
      client_name: 'Juan Magallón',
      client_email: 'juangpdev@gmail.com',
      user_name: 'Juan García',
      user_email: 'juangpdev@gmail.com',
      user_company: 'Mi Empresa'
    };

    // Mostrar el template con las variables reemplazadas
    const actions = JSON.parse(automation.actions);
    const emailAction = Array.isArray(actions) ? actions[0] : actions;

    let template = emailAction.parameters.template;
    let subject = emailAction.parameters.subject;

    // Reemplazar variables en el template de prueba
    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, String(value));
      subject = subject.replace(regex, String(value));
    });

    console.log('\\n📧 Subject con variables reemplazadas:');
    console.log(subject);

    console.log('\\n📧 Template renderizado (primeros 500 caracteres):');
    console.log(template.substring(0, 500) + '...');

    console.log('\\n🔍 Variables detectadas en el template:');
    const variableRegex = /{{([^}]+)}}/g;
    const remainingVariables = [];
    let match;
    while ((match = variableRegex.exec(template)) !== null) {
      if (!remainingVariables.includes(match[1])) {
        remainingVariables.push(match[1]);
      }
    }

    if (remainingVariables.length > 0) {
      console.log('⚠️ Variables sin reemplazar:', remainingVariables);
    } else {
      console.log('✅ Todas las variables fueron reemplazadas correctamente');
    }

    console.log('\\n🎯 Características del email:');
    console.log('- Header de alerta rojo profesional');
    console.log('- Información del responsable destacada');
    console.log('- Tabla detallada del presupuesto');
    console.log('- Botón para contacto directo');
    console.log('- Diseño responsive para móviles');

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

testBudgetAlert();
