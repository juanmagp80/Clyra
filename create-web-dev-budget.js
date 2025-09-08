const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCompleteTestScenario() {
    try {
        console.log('🚀 CREANDO ESCENARIO COMPLETO DE PRUEBA...\n');

        // Usar el ID del usuario logueado
        const userId = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
        console.log('👤 Usando usuario logueado:', userId);

        // 2. Crear clientes de prueba
        console.log('\n🏢 Creando clientes de prueba...');
        const clientsData = [
            {
                user_id: userId,
                name: 'TechStart Innovations S.L.',
                email: 'contacto@techstart.com',
                phone: '+34 691 234 567',
                company: 'TechStart Innovations S.L.',
                address: 'Paseo de la Castellana, 95',
                city: 'Madrid',
                province: 'Madrid',
                nif: 'B12345678',
                tag: 'desarrollo-web'
            },
            {
                user_id: userId,
                name: 'Digital Commerce Pro',
                email: 'info@digitalcommerce.com',
                phone: '+34 692 345 678',
                company: 'Digital Commerce Pro',
                address: 'Carrer de Mallorca, 401',
                city: 'Barcelona',
                province: 'Barcelona',
                nif: 'B87654321',
                tag: 'ecommerce'
            }
        ];

        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .insert(clientsData)
            .select('*');

        if (clientsError) {
            console.error('❌ Error creando clientes:', clientsError);
            return;
        }

        console.log(`✅ ${clients.length} clientes creados exitosamente`);

        // 3. Crear presupuesto de desarrollo web
        console.log('\n💰 Creando presupuesto de desarrollo web...');
        const { data: budget, error: budgetError } = await supabase
            .from('budgets')
            .insert([
                {
                    user_id: userId,
                    client_id: clients[0].id,
                    title: 'Plataforma E-commerce Completa',
                    description: 'Desarrollo de tienda online completa con panel admin, pasarela de pago, gestión de inventario y análisis avanzado',
                    status: 'draft',
                    total_amount: 0,
                    tax_rate: 21.00,
                    notes: 'Presupuesto para desarrollo completo de plataforma e-commerce con todas las funcionalidades modernas',
                    terms_conditions: 'Condiciones estándar de desarrollo. 50% al inicio, 50% al finalizar. Soporte incluido por 3 meses.'
                }
            ])
            .select('*')
            .single();

        if (budgetError) {
            console.error('❌ Error creando presupuesto:', budgetError);
            return;
        }

        console.log('✅ Presupuesto creado:', budget.title);

        // 4. Crear items del presupuesto
        console.log('\n📋 Creando items del presupuesto...');
        const budgetItems = [
            {
                budget_id: budget.id,
                title: 'Diseño UI/UX Completo',
                description: 'Wireframes, mockups, prototipo interactivo, diseño responsive para móvil/tablet/desktop',
                quantity: 1,
                unit_price: 4500.00,
                type: 'fixed'
            },
            {
                budget_id: budget.id,
                title: 'Frontend React/Next.js',
                description: 'Desarrollo frontend con React/Next.js, componentes reutilizables, optimización SEO',
                quantity: 80,
                unit_price: 85.00,
                type: 'hours'
            },
            {
                budget_id: budget.id,
                title: 'Backend & API Development',
                description: 'API REST completa, autenticación JWT, gestión de usuarios, base de datos PostgreSQL',
                quantity: 60,
                unit_price: 95.00,
                type: 'hours'
            },
            {
                budget_id: budget.id,
                title: 'Sistema de Pagos',
                description: 'Integración Stripe/PayPal, gestión de suscripciones, facturación automática',
                quantity: 25,
                unit_price: 120.00,
                type: 'hours'
            },
            {
                budget_id: budget.id,
                title: 'Panel de Administración',
                description: 'Dashboard admin completo, gestión productos, pedidos, usuarios, reportes avanzados',
                quantity: 45,
                unit_price: 90.00,
                type: 'hours'
            },
            {
                budget_id: budget.id,
                title: 'App Móvil (React Native)',
                description: 'Aplicación móvil nativa para iOS/Android con funcionalidades principales',
                quantity: 70,
                unit_price: 110.00,
                type: 'hours'
            },
            {
                budget_id: budget.id,
                title: 'Seguridad & Testing',
                description: 'Auditoría de seguridad, testing automatizado, pruebas de carga, certificados SSL',
                quantity: 20,
                unit_price: 130.00,
                type: 'hours'
            },
            {
                budget_id: budget.id,
                title: 'Deploy & DevOps',
                description: 'Configuración servidores AWS/Azure, CI/CD pipeline, monitoreo, backups automáticos',
                quantity: 15,
                unit_price: 140.00,
                type: 'hours'
            },
            {
                budget_id: budget.id,
                title: 'Soporte Post-Launch (3 meses)',
                description: 'Soporte técnico, corrección bugs, actualizaciones menores, monitoreo performance',
                quantity: 1,
                unit_price: 2800.00,
                type: 'fixed'
            }
        ];

        const { data: items, error: itemsError } = await supabase
            .from('budget_items')
            .insert(budgetItems)
            .select('*');

        if (itemsError) {
            console.error('❌ Error creando items:', itemsError);
            return;
        }

        console.log(`✅ ${items.length} items del presupuesto creados`);

        // 5. Verificar el total calculado
        const { data: updatedBudget } = await supabase
            .from('budgets')
            .select('*')
            .eq('id', budget.id)
            .single();

        console.log('\n🎯 PRESUPUESTO DESARROLLO WEB CREADO:');
        console.log(`   📋 Título: ${updatedBudget.title}`);
        console.log(`   🏢 Cliente: ${clients[0].name}`);
        console.log(`   💰 Total: €${updatedBudget.total_amount?.toLocaleString() || '0'}`);
        console.log(`   📊 Items: ${items.length} servicios incluidos`);
        console.log(`   📅 Estado: ${updatedBudget.status}`);

        // Mostrar algunos items principales
        console.log('\n📋 PRINCIPALES SERVICIOS:');
        items.slice(0, 5).forEach(item => {
            const total = item.quantity * item.unit_price;
            console.log(`   • ${item.title}: €${total.toLocaleString()}`);
        });

        console.log('\n🔥 ¡Presupuesto listo para optimizar con IA!');
        console.log('✅ Ahora puedes probar el Optimizador de Precios sin errores');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

createCompleteTestScenario();
