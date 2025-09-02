import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 Iniciando proceso de envío de presupuesto...');
        
        const { budgetId } = await request.json();

        if (!budgetId) {
            console.error('❌ Budget ID no proporcionado');
            return NextResponse.json(
                { error: 'Budget ID is required' },
                { status: 400 }
            );
        }

        console.log('📋 Budget ID recibido:', budgetId);

        // Verificar autenticación
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('❌ Error de autenticación:', authError);
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('✅ Usuario autenticado:', user.email);

        // Obtener el presupuesto completo con cliente y items
        console.log('🔍 Buscando presupuesto...');
        const { data: budget, error: budgetError } = await supabase
            .from('budgets')
            .select(`
                *,
                clients:client_id (
                    id,
                    name,
                    email,
                    company
                ),
                budget_items (
                    id,
                    title,
                    description,
                    quantity,
                    unit_price,
                    total,
                    type
                )
            `)
            .eq('id', budgetId)
            .eq('user_id', user.id)
            .single();

        if (budgetError || !budget) {
            console.error('❌ Error obteniendo presupuesto:', budgetError);
            return NextResponse.json(
                { error: 'Budget not found' },
                { status: 404 }
            );
        }

        console.log('✅ Presupuesto encontrado:', budget.title);
        console.log('📧 Email del cliente:', budget.clients?.email);

        if (!budget.clients?.email) {
            return NextResponse.json(
                { error: 'Client email not found' },
                { status: 400 }
            );
        }

        // Obtener información del perfil del usuario
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company_name, email')
            .eq('id', user.id)
            .single();

        console.log('👤 Perfil usuario:', profile?.full_name || user.email);

        // Verificar configuración de Resend
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️ RESEND_API_KEY no configurada, enviando simulado');
            return await sendSimulatedEmail(budget, supabase, budgetId, user.id);
        }

        // Generar contenido del email
        const emailHtml = generateBudgetEmailHtml(budget, profile);
        const fromEmail = process.env.FROM_EMAIL || 'noreply@resend.dev';

        console.log('📧 Enviando email real a:', budget.clients.email);
        console.log('📤 Desde:', fromEmail);

        try {
            // Enviar email con Resend
            const emailResult = await resend.emails.send({
                from: fromEmail,
                to: budget.clients.email,
                subject: `Presupuesto: ${budget.title}`,
                html: emailHtml,
            });

            if (emailResult.error) {
                console.error('❌ Error enviando email:', emailResult.error);
                return NextResponse.json(
                    { error: 'Failed to send email: ' + emailResult.error.message },
                    { status: 500 }
                );
            }

            console.log('✅ Email enviado exitosamente, ID:', emailResult.data?.id);

            // Actualizar el estado del presupuesto
            const { error: updateError } = await supabase
                .from('budgets')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString()
                })
                .eq('id', budgetId)
                .eq('user_id', user.id);

            if (updateError) {
                console.error('❌ Error actualizando presupuesto:', updateError);
                return NextResponse.json(
                    { error: 'Email sent but failed to update budget status' },
                    { status: 500 }
                );
            }

            console.log('✅ Presupuesto actualizado exitosamente');

            return NextResponse.json({
                success: true,
                message: '📧 Presupuesto enviado por email exitosamente',
                budgetTitle: budget.title,
                clientEmail: budget.clients.email,
                emailId: emailResult.data?.id,
                sentAt: new Date().toISOString()
            });

        } catch (emailError) {
            console.error('❌ Error en Resend:', emailError);
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('❌ Error en send-email route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Función de fallback para envío simulado
async function sendSimulatedEmail(budget: any, supabase: any, budgetId: string, userId: string) {
    console.log('📧 Modo simulación - enviando email a:', budget.clients.email);
    console.log('📄 Presupuesto:', budget.title, '- Total:', budget.total_amount);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Actualizar estado
    const { error: updateError } = await supabase
        .from('budgets')
        .update({
            status: 'sent',
            sent_at: new Date().toISOString()
        })
        .eq('id', budgetId)
        .eq('user_id', userId);

    if (updateError) {
        console.error('❌ Error actualizando presupuesto:', updateError);
        return NextResponse.json(
            { error: 'Failed to update budget status' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        message: '📧 Presupuesto enviado exitosamente (simulado)',
        budgetTitle: budget.title,
        clientEmail: budget.clients.email,
        sentAt: new Date().toISOString(),
        simulated: true
    });
}

// Generar HTML del email
function generateBudgetEmailHtml(budget: any, profile: any): string {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const subtotal = budget.total_amount || 0;
    const taxAmount = subtotal * (budget.tax_rate / 100);
    const total = subtotal + taxAmount;
    const companyName = profile?.company_name || profile?.full_name || 'Mi Empresa';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto - ${budget.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 2.5em;
        }
        .company-info {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
        }
        .budget-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .info-section h3 {
            color: #007bff;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .items-table th {
            background-color: #007bff;
            color: white;
        }
        .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .total-section {
            text-align: right;
            border-top: 2px solid #007bff;
            padding-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .total-final {
            font-size: 1.3em;
            font-weight: bold;
            color: #007bff;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9em;
        }
        @media (max-width: 600px) {
            .budget-info { grid-template-columns: 1fr; }
            .container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PRESUPUESTO</h1>
        </div>

        <div class="company-info">
            <h2>${companyName}</h2>
        </div>

        <div class="budget-info">
            <div class="info-section">
                <h3>Información del Cliente</h3>
                <p><strong>Cliente:</strong> ${budget.clients?.name || 'Cliente'}</p>
                ${budget.clients?.company ? `<p><strong>Empresa:</strong> ${budget.clients.company}</p>` : ''}
                <p><strong>Email:</strong> ${budget.clients?.email}</p>
            </div>
            <div class="info-section">
                <h3>Detalles del Presupuesto</h3>
                <p><strong>Número:</strong> #${budget.id.slice(0, 8).toUpperCase()}</p>
                <p><strong>Fecha:</strong> ${formatDate(budget.created_at)}</p>
                <p><strong>Estado:</strong> Enviado</p>
                ${budget.expires_at ? `<p><strong>Válido hasta:</strong> ${formatDate(budget.expires_at)}</p>` : ''}
            </div>
        </div>

        <h3>${budget.title}</h3>
        ${budget.description ? `<p style="color: #666; margin-bottom: 30px;">${budget.description}</p>` : ''}

        <table class="items-table">
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${budget.budget_items?.map((item: any) => `
                    <tr>
                        <td><strong>${item.title}</strong></td>
                        <td>${item.description || '-'}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unit_price)}</td>
                        <td>${formatCurrency(item.total)}</td>
                    </tr>
                `).join('') || '<tr><td colspan="5">No hay items en este presupuesto</td></tr>'}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span><strong>Subtotal:</strong></span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
                <span><strong>IVA (${budget.tax_rate}%):</strong></span>
                <span>${formatCurrency(taxAmount)}</span>
            </div>
            <div class="total-row total-final">
                <span><strong>TOTAL:</strong></span>
                <span>${formatCurrency(total)}</span>
            </div>
        </div>

        ${budget.notes ? `
            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                <h3>Notas adicionales</h3>
                <p>${budget.notes}</p>
            </div>
        ` : ''}

        <div class="footer">
            <p>Presupuesto generado por ${companyName}</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
    </div>
</body>
</html>
    `;
}