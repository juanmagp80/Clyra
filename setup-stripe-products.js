#!/usr/bin/env node

// Script para configurar productos y precios de Stripe
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
    try {
        console.log('🔍 Verificando productos existentes en Stripe...');
        
        // Listar productos existentes
        const products = await stripe.products.list({ limit: 10 });
        console.log(`📦 Productos existentes: ${products.data.length}`);
        
        products.data.forEach(product => {
            console.log(`  - ${product.name} (${product.id})`);
        });

        // Listar precios existentes
        const prices = await stripe.prices.list({ limit: 10 });
        console.log(`💰 Precios existentes: ${prices.data.length}`);
        
        prices.data.forEach(price => {
            console.log(`  - ${price.id}: ${price.unit_amount / 100} ${price.currency} / ${price.recurring?.interval || 'one-time'}`);
        });

        // Buscar si ya existe un producto para la suscripción pro
        let proProduct = products.data.find(p => p.name.toLowerCase().includes('pro') || p.name.toLowerCase().includes('profesional'));
        
        if (!proProduct) {
            console.log('🆕 Creando producto Pro...');
            proProduct = await stripe.products.create({
                name: 'Clyra Pro',
                description: 'Plan profesional de Clyra con todas las funcionalidades',
                type: 'service',
            });
            console.log(`✅ Producto creado: ${proProduct.id}`);
        }

        // Buscar si ya existe un precio mensual para el producto pro
        let monthlyPrice = prices.data.find(p => 
            p.product === proProduct.id && 
            p.recurring?.interval === 'month'
        );

        if (!monthlyPrice) {
            console.log('🆕 Creando precio mensual...');
            monthlyPrice = await stripe.prices.create({
                product: proProduct.id,
                unit_amount: 2900, // $29.00 en centavos
                currency: 'eur',
                recurring: {
                    interval: 'month',
                },
                nickname: 'Pro Monthly',
            });
            console.log(`✅ Precio mensual creado: ${monthlyPrice.id}`);
        }

        console.log('\n🎉 Configuración completada!');
        console.log('\n📋 Información para tu aplicación:');
        console.log(`Producto ID: ${proProduct.id}`);
        console.log(`Precio ID (mensual): ${monthlyPrice.id}`);
        console.log(`Precio: €${monthlyPrice.unit_amount / 100}/mes`);
        
        console.log('\n🔧 Actualizar en tu código:');
        console.log(`En SubscriptionStatus.tsx, cambiar:`);
        console.log(`priceId: '${monthlyPrice.id}' // En lugar de 'price_pro_monthly'`);

        return {
            productId: proProduct.id,
            priceId: monthlyPrice.id
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.type === 'StripeAuthenticationError') {
            console.log('🔑 Verifica que tu STRIPE_SECRET_KEY sea válida en .env.local');
        }
        process.exit(1);
    }
}

setupStripeProducts().catch(console.error);
