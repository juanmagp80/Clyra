import { SupabaseService } from '../services/SupabaseService.js';
import { EmailService } from '../services/EmailService.js';

/**
 * Script de prueba para verificar la integración del sistema
 * Ejecutar con: npm run test-integration
 */

async function testIntegration() {
  console.log('🧪 PRUEBA DE INTEGRACIÓN MCP GOOGLE CALENDAR');
  console.log('===========================================');
  
  let allTestsPassed = true;
  const errors: string[] = [];

  // Test 1: Conexión con Supabase
  console.log('\n1. 📡 Probando conexión con Supabase...');
  try {
    const supabase = new SupabaseService();
    const meetings = await supabase.getUpcomingMeetings(undefined, 24);
    console.log(`   ✅ Conexión exitosa - ${meetings.length} reuniones encontradas`);
  } catch (error) {
    console.log(`   ❌ Error conectando con Supabase: ${error}`);
    allTestsPassed = false;
    errors.push('Supabase connection failed');
  }

  // Test 2: Servicio de Email
  console.log('\n2. 📧 Probando servicio de email...');
  try {
    const email = new EmailService();
    const isConnected = await email.verifyConnection();
    
    if (isConnected) {
      console.log('   ✅ Configuración de email válida');
    } else {
      console.log('   ❌ Error en configuración de email');
      allTestsPassed = false;
      errors.push('Email configuration failed');
    }
  } catch (error) {
    console.log(`   ❌ Error verificando email: ${error}`);
    allTestsPassed = false;
    errors.push('Email service failed');
  }

  // Test 3: Variables de entorno
  console.log('\n3. 🔧 Verificando variables de entorno...');
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY', 
    'EMAIL_USER',
    'EMAIL_PASS',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missingVars: string[] = [];
  
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length === 0) {
    console.log('   ✅ Todas las variables de entorno configuradas');
  } else {
    console.log(`   ⚠️ Variables faltantes: ${missingVars.join(', ')}`);
    console.log('   💡 Editar archivo .env con las credenciales necesarias');
  }

  // Test 4: Estructura de base de datos
  console.log('\n4. 🗄️ Verificando estructura de base de datos...');
  try {
    const supabase = new SupabaseService();
    
    // Verificar tabla calendar_events
    const { data: calendarEvents, error: calendarError } = await (supabase as any).supabase
      .from('calendar_events')
      .select('id')
      .limit(1);
    
    if (calendarError) {
      console.log(`   ❌ Tabla calendar_events no disponible: ${calendarError.message}`);
      allTestsPassed = false;
      errors.push('calendar_events table missing');
    } else {
      console.log('   ✅ Tabla calendar_events accesible');
    }

    // Verificar tabla meeting_reminders
    const { data: reminders, error: reminderError } = await (supabase as any).supabase
      .from('meeting_reminders')
      .select('id')
      .limit(1);
    
    if (reminderError) {
      console.log(`   ⚠️ Tabla meeting_reminders no disponible: ${reminderError.message}`);
      console.log('   💡 Ejecutar schema.sql en la base de datos');
    } else {
      console.log('   ✅ Tabla meeting_reminders accesible');
    }

  } catch (error) {
    console.log(`   ❌ Error verificando base de datos: ${error}`);
    allTestsPassed = false;
    errors.push('Database structure verification failed');
  }

  // Resumen final
  console.log('\n📊 RESUMEN DE PRUEBAS');
  console.log('====================');
  
  if (allTestsPassed) {
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ El sistema está listo para usar');
    console.log('\n🚀 Para iniciar el servidor:');
    console.log('   npm run dev');
  } else {
    console.log('❌ Algunas pruebas fallaron');
    console.log('\n🔧 Errores encontrados:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log('\n💡 Consultar README.md para solución de problemas');
  }

  // Información adicional
  console.log('\n📋 INFORMACIÓN DEL SISTEMA');
  console.log('==========================');
  console.log(`Node.js: ${process.version}`);
  console.log(`Plataforma: ${process.platform}`);
  console.log(`Arquitectura: ${process.arch}`);
  console.log(`Directorio: ${process.cwd()}`);
  
  return allTestsPassed;
}

// Test específico para recordatorios
async function testReminderSystem() {
  console.log('\n🔔 PRUEBA DEL SISTEMA DE RECORDATORIOS');
  console.log('=====================================');

  try {
    const supabase = new SupabaseService();
    
    // Obtener reuniones próximas
    const upcomingMeetings = await supabase.getUpcomingMeetings(undefined, 25);
    console.log(`📊 Reuniones próximas (25 horas): ${upcomingMeetings.length}`);
    
    if (upcomingMeetings.length === 0) {
      console.log('💡 Para probar el sistema de recordatorios:');
      console.log('   1. Crear una reunión en el calendario');
      console.log('   2. Asignar un cliente con email');
      console.log('   3. Programar para 1-3 horas en el futuro');
      console.log('   4. Ejecutar esta prueba nuevamente');
      return;
    }

    // Mostrar reuniones encontradas
    upcomingMeetings.forEach((meeting, index) => {
      const hoursUntil = (new Date(meeting.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60);
      console.log(`\n${index + 1}. ${meeting.title}`);
      console.log(`   📅 ${new Date(meeting.startTime).toLocaleString('es-ES')}`);
      console.log(`   ⏰ En ${hoursUntil.toFixed(1)} horas`);
      console.log(`   👤 Cliente: ${meeting.client?.name || 'Sin asignar'}`);
      console.log(`   📧 Email: ${meeting.client?.email || 'Sin email'}`);
      
      // Determinar si califica para recordatorio
      if (hoursUntil >= 0.5 && hoursUntil <= 1.5) {
        console.log(`   🔔 Califica para recordatorio de 1 hora`);
      } else if (hoursUntil >= 2.5 && hoursUntil <= 3.5) {
        console.log(`   🔔 Califica para recordatorio de 3 horas`);
      } else if (hoursUntil >= 23 && hoursUntil <= 25) {
        console.log(`   🔔 Califica para recordatorio de 24 horas`);
      } else {
        console.log(`   ⏳ Fuera de ventana de recordatorio`);
      }
    });

  } catch (error) {
    console.log(`❌ Error en prueba de recordatorios: ${error}`);
  }
}

// Ejecutar pruebas
async function main() {
  try {
    const testsPassed = await testIntegration();
    await testReminderSystem();
    
    process.exit(testsPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testIntegration, testReminderSystem };
