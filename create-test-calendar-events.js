#!/usr/bin/env node

/**
 * Script para crear eventos de prueba en el calendario
 * Esto permite probar las sugerencias de IA con datos reales
 */

// Primero intentamos cargar variables de entorno desde archivos de configuración
const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno manualmente
function loadEnvVariables() {
    const envFiles = ['.env.local', '.env'];

    for (const envFile of envFiles) {
        const envPath = path.join(__dirname, envFile);
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');

            for (const line of lines) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match && !process.env[match[1]]) {
                    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
                }
            }
            console.log(`📄 Variables cargadas desde ${envFile}`);
            break;
        }
    }
}

// Cargar variables de entorno
loadEnvVariables();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuración de Supabase...');
console.log(`URL encontrada: ${supabaseUrl ? '✅' : '❌'}`);
console.log(`Key encontrada: ${supabaseKey ? '✅' : '❌'}`);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Configuración de Supabase no encontrada');
    console.log('\n📋 Para configurar las variables de entorno:');
    console.log('1. Crea un archivo .env.local en la raíz del proyecto');
    console.log('2. Agrega las siguientes líneas:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima');
    console.log('\n💡 Puedes encontrar estas credenciales en tu panel de Supabase');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para generar fechas
function getDateString(daysOffset, hour, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

// Eventos de prueba para demostrar las capacidades de IA
const testEvents = [
    // === EVENTOS DE HOY (para métricas del día) ===
    {
        title: 'Reunión con TechCorp - Review Proyecto',
        description: 'Revisión semanal del progreso del proyecto TechCorp',
        start_time: getDateString(0, 9, 0),   // Hoy 9:00
        end_time: getDateString(0, 10, 30),   // Hoy 10:30
        type: 'client_call',
        client_id: 'techcorp-001',
        project_id: 'project-techcorp-web',
        is_billable: true,
        hourly_rate: 85,
        status: 'completed',  // Completado para métricas
        productivity_score: 95
    },
    {
        title: 'Desarrollo Frontend - Dashboard',
        description: 'Implementación de nuevas funcionalidades del dashboard',
        start_time: getDateString(0, 10, 45), // Hoy 10:45
        end_time: getDateString(0, 12, 45),   // Hoy 12:45
        type: 'work',
        client_id: 'techcorp-001',
        project_id: 'project-techcorp-web',
        is_billable: true,
        hourly_rate: 85,
        status: 'completed',
        productivity_score: 88
    },
    {
        title: 'Descanso - Almuerzo',
        description: 'Pausa para almuerzo',
        start_time: getDateString(0, 12, 45), // Hoy 12:45
        end_time: getDateString(0, 13, 45),   // Hoy 13:45
        type: 'break',
        is_billable: false,
        status: 'completed',
        productivity_score: 0
    },
    {
        title: 'Preparación Propuesta - StartupXYZ',
        description: 'Crear propuesta para nuevo cliente StartupXYZ',
        start_time: getDateString(0, 14, 0),  // Hoy 14:00
        end_time: getDateString(0, 16, 0),    // Hoy 16:00
        type: 'proposal_work',
        client_id: 'startupxyz-001',
        is_billable: true,
        hourly_rate: 75,
        status: 'in_progress', // En progreso
        productivity_score: 82
    },
    {
        title: 'Focus Time - Código Limpio',
        description: 'Tiempo dedicado a refactoring y optimización',
        start_time: getDateString(0, 16, 30), // Hoy 16:30
        end_time: getDateString(0, 18, 0),    // Hoy 18:00
        type: 'focus',
        is_billable: false, // No facturable, trabajo interno
        status: 'scheduled', // Programado para más tarde
        productivity_score: 90
    },

    // === EVENTOS DE AYER (para patrones históricos) ===
    {
        title: 'Reunión con TechCorp - Planning',
        description: 'Planificación sprint siguiente',
        start_time: getDateString(-1, 9, 0),  // Ayer 9:00
        end_time: getDateString(-1, 10, 0),   // Ayer 10:00
        type: 'meeting',
        client_id: 'techcorp-001',
        project_id: 'project-techcorp-web',
        is_billable: true,
        hourly_rate: 85,
        status: 'completed',
        productivity_score: 92
    },
    {
        title: 'Desarrollo Backend - API REST',
        description: 'Implementación endpoints de la API',
        start_time: getDateString(-1, 10, 30), // Ayer 10:30
        end_time: getDateString(-1, 12, 30),   // Ayer 12:30
        type: 'work',
        client_id: 'techcorp-001',
        project_id: 'project-techcorp-api',
        is_billable: true,
        hourly_rate: 85,
        status: 'completed',
        productivity_score: 96
    },
    {
        title: 'Research - Nuevas Tecnologías',
        description: 'Investigación sobre frameworks modernos',
        start_time: getDateString(-1, 14, 0),  // Ayer 14:00
        end_time: getDateString(-1, 16, 0),    // Ayer 16:00
        type: 'focus',
        is_billable: false,
        status: 'completed',
        productivity_score: 78
    },

    // === EVENTOS DE HACE 2 DÍAS (más historial) ===
    {
        title: 'Call Cliente - InnovateCorp',
        description: 'Primera llamada con cliente potencial',
        start_time: getDateString(-2, 11, 0),  // Hace 2 días 11:00
        end_time: getDateString(-2, 12, 0),    // Hace 2 días 12:00
        type: 'client_call',
        client_id: 'innovatecorp-001',
        is_billable: true,
        hourly_rate: 90,
        status: 'completed',
        productivity_score: 85
    },
    {
        title: 'Preparación Factura - TechCorp',
        description: 'Preparación y envío de factura mensual',
        start_time: getDateString(-2, 15, 0),  // Hace 2 días 15:00
        end_time: getDateString(-2, 16, 30),   // Hace 2 días 16:30
        type: 'invoice_prep',
        client_id: 'techcorp-001',
        is_billable: false, // Tarea administrativa
        status: 'completed',
        productivity_score: 70
    },

    // === EVENTOS FUTUROS (para sugerencias de programación) ===
    {
        title: 'Reunión con StartupXYZ - Kickoff',
        description: 'Reunión de inicio de proyecto',
        start_time: getDateString(1, 10, 0),  // Mañana 10:00
        end_time: getDateString(1, 11, 30),   // Mañana 11:30
        type: 'meeting',
        client_id: 'startupxyz-001',
        project_id: 'project-startupxyz-mvp',
        is_billable: true,
        hourly_rate: 75,
        status: 'scheduled',
        productivity_score: null
    },
    {
        title: 'Focus Session - Deep Work',
        description: 'Sesión de trabajo profundo sin interrupciones',
        start_time: getDateString(2, 9, 0),   // Pasado mañana 9:00
        end_time: getDateString(2, 12, 0),    // Pasado mañana 12:00
        type: 'focus',
        is_billable: false,
        status: 'scheduled',
        productivity_score: null
    }
];

async function createTestEvents() {
    try {
        console.log('🚀 Iniciando creación de eventos de prueba...');

        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('❌ Error: No hay usuario autenticado');
            console.log('Por favor, inicia sesión en la aplicación primero');
            return;
        }

        console.log(`👤 Usuario autenticado: ${user.email}`);

        // Verificar si la tabla existe
        const { data: tables, error: tableError } = await supabase
            .from('calendar_events')
            .select('id')
            .limit(1);

        if (tableError) {
            console.error('❌ Error: La tabla calendar_events no existe o no es accesible');
            console.log('Ejecuta las migraciones de base de datos primero');
            return;
        }

        // Agregar user_id a todos los eventos
        const eventsWithUser = testEvents.map(event => ({
            ...event,
            user_id: user.id
        }));

        // Insertar eventos
        console.log(`📅 Insertando ${eventsWithUser.length} eventos de prueba...`);

        const { data, error } = await supabase
            .from('calendar_events')
            .insert(eventsWithUser)
            .select();

        if (error) {
            console.error('❌ Error insertando eventos:', error);
            return;
        }

        console.log('✅ Eventos creados exitosamente!');
        console.log(`📊 Total de eventos insertados: ${data.length}`);

        // Mostrar resumen de eventos por tipo
        const eventsByType = eventsWithUser.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});

        console.log('\n📈 Resumen por tipo de evento:');
        Object.entries(eventsByType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count} eventos`);
        });

        // Mostrar eventos de hoy
        const todayEvents = eventsWithUser.filter(e => e.start_time.startsWith(new Date().toISOString().slice(0, 10)));
        console.log(`\n📅 Eventos de hoy: ${todayEvents.length}`);

        const completedToday = todayEvents.filter(e => e.status === 'completed');
        const billableToday = completedToday.filter(e => e.is_billable);
        const revenueToday = billableToday.reduce((sum, e) => {
            const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
            return sum + (duration * e.hourly_rate);
        }, 0);

        console.log(`✅ Completados hoy: ${completedToday.length}/${todayEvents.length}`);
        console.log(`💰 Ingresos hoy: €${Math.round(revenueToday)}`);

        console.log('\n🤖 ¡Ahora las sugerencias de IA mostrarán datos reales!');
        console.log('🔄 Recarga la página del calendario para ver los cambios');

    } catch (error) {
        console.error('❌ Error inesperado:', error);
    }
}

// Ejecutar script
createTestEvents();
