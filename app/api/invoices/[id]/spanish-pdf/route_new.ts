import { generateSpanishFiscalQR } from '@/lib/spanish-invoice-utils';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabaseClient();

        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const invoiceId = params.id;

        // Obtener datos de la factura
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
                *,
                clients (
                    name,
                    nif,
                    address,
                    postal_code,
                    city,
                    country
                )
            `)
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single();

        if (invoiceError || !invoice) {
            return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
        }

        // Obtener configuración de la empresa
        const { data: companyConfig, error: companyError } = await supabase
            .from('company_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (companyError || !companyConfig) {
            return NextResponse.json({
                error: 'Configuración de empresa no encontrada. Configure los datos fiscales primero.'
            }, { status: 400 });
        }

        // Generar HTML para el PDF (sin puppeteer por ahora)
        const htmlContent = generateSpanishInvoiceHTML(invoice, companyConfig);

        // Retornar HTML directamente (sin PDF por ahora para evitar errores)
        return new NextResponse(htmlContent, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="Factura_${invoice.invoice_number?.replace('/', '_') || invoice.id}.html"`
            }
        });

    } catch (error) {
        console.error('Error generando HTML de factura:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

function generateSpanishInvoiceHTML(invoice: any, company: any): string {
    const client = invoice.clients;

    // Generar datos del QR
    const companyData = {
        companyName: company.company_name,
        nif: company.nif,
        address: company.address,
        postalCode: company.postal_code,
        city: company.city,
        province: company.province,
        country: company.country || 'España',
        phone: company.phone,
        email: company.email,
        website: company.website,
        registrationNumber: company.registration_number,
        socialCapital: parseFloat(company.social_capital || '0'),
    };

    const invoiceData = {
        invoiceNumber: invoice.invoice_number || `FAC-${invoice.id}`,
        date: invoice.created_at,
        dueDate: invoice.due_date,
        clientName: client?.name || 'Cliente',
        clientNIF: client?.nif || '',
        clientAddress: client?.address || '',
        clientCity: client?.city || '',
        clientPostalCode: client?.postal_code || '',
        clientProvince: '',
        items: [{
            description: invoice.description || 'Servicios profesionales',
            quantity: 1,
            unitPrice: parseFloat(invoice.amount || '0'),
            vatRate: parseFloat(invoice.tax_rate || '21'),
            vatAmount: parseFloat(invoice.tax_amount || '0'),
            total: parseFloat(invoice.total_amount || '0')
        }],
        subtotal: parseFloat(invoice.amount || '0'),
        totalVAT: parseFloat(invoice.tax_amount || '0'),
        total: parseFloat(invoice.total_amount || '0'),
        notes: '',
        paymentTerms: 'Transferencia bancaria'
    };

    const qrData = generateSpanishFiscalQR(companyData, invoiceData);

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura ${invoice.invoice_number || invoice.id}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
                font-size: 12px;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 30px;
                min-height: 100vh;
            }
            
            .header {
                border-bottom: 3px solid #1e40af;
                padding-bottom: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .company-info h1 {
                color: #1e3a8a;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .company-details {
                font-size: 13px;
                color: #666;
                line-height: 1.5;
            }
            
            .invoice-title {
                text-align: right;
            }
            
            .invoice-badge {
                background: #1e40af;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                margin-bottom: 15px;
                display: inline-block;
            }
            
            .invoice-badge h2 {
                font-size: 20px;
                margin-bottom: 5px;
            }
            
            .invoice-number {
                font-family: 'Courier New', monospace;
                font-size: 16px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    <h1>${company.company_name}</h1>
                    <div class="company-details">
                        <div><strong>NIF:</strong> ${company.nif}</div>
                        <div>${company.address}</div>
                        <div>${company.postal_code} ${company.city}</div>
                        <div>${company.province}, ${company.country || 'España'}</div>
                        ${company.phone ? `<div><strong>Tel:</strong> ${company.phone}</div>` : ''}
                        ${company.email ? `<div><strong>Email:</strong> ${company.email}</div>` : ''}
                        ${company.website ? `<div><strong>Web:</strong> ${company.website}</div>` : ''}
                    </div>
                </div>
                <div class="invoice-title">
                    <div class="invoice-badge">
                        <h2>FACTURA</h2>
                        <div class="invoice-number">${invoice.invoice_number || `FAC-${invoice.id}`}</div>
                    </div>
                </div>
            </div>

            <h2>Facturar a: ${client?.name || 'Cliente'}</h2>
            <div>
                ${client?.nif ? `<div><strong>NIF:</strong> ${client.nif}</div>` : ''}
                ${client?.address ? `<div>${client.address}</div>` : ''}
                ${client?.postal_code || client?.city ? `<div>${client?.postal_code || ''} ${client?.city || ''}</div>` : ''}
                <div>${client?.country || 'España'}</div>
            </div>

            <h3>Descripción: ${invoice.description || 'Servicios profesionales'}</h3>
            
            <div>
                <p><strong>Base imponible:</strong> ${parseFloat(invoice.amount || '0').toFixed(2)} €</p>
                <p><strong>IVA (${parseFloat(invoice.tax_rate || '21').toFixed(0)}%):</strong> ${parseFloat(invoice.tax_amount || '0').toFixed(2)} €</p>
                <p><strong>TOTAL:</strong> ${parseFloat(invoice.total_amount || '0').toFixed(2)} €</p>
            </div>

            <div style="margin-top: 20px; font-size: 10px; color: #666;">
                QR Data: ${qrData}
            </div>
        </div>
    </body>
    </html>
    `;
}
