import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 Iniciando proceso de envío de contrato...');

        const { contractId } = await request.json();

        if (!contractId) {
            return NextResponse.json(
                { error: 'ID del contrato requerido' },
                { status: 400 }
            );
        }

        // Crear cliente Supabase server
        const supabase = await createSupabaseServerClient();

        // Obtener datos de autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('❌ Error de autenticación:', authError);
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        console.log('👤 Perfil usuario:', user.email);

        // Obtener datos del perfil
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Error obteniendo perfil:', profileError);
        }

        console.log('🏢 Empresa:', profile?.company_name || 'No configurada');

        // Validar configuración de email
        if (!process.env.RESEND_API_KEY) {
            console.error('❌ RESEND_API_KEY no está configurado');
            return NextResponse.json(
                { error: 'Configuración de email no disponible' },
                { status: 500 }
            );
        }

        console.log('🔑 Verificando configuración de Resend...');
        console.log('🔑 RESEND_API_KEY presente:', !!process.env.RESEND_API_KEY);
        console.log('🔑 FROM_EMAIL:', process.env.FROM_EMAIL || 'noreply@taskelio.app');

        // Obtener datos del contrato con joins
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select(`
                *,
                clients (
                    name,
                    email,
                    company,
                    phone
                )
            `)
            .eq('id', contractId)
            .single();

        if (contractError) {
            console.error('❌ Error obteniendo contrato:', contractError);
            return NextResponse.json(
                { error: 'Contrato no encontrado' },
                { status: 404 }
            );
        }

        if (!contract.clients?.email) {
            console.error('❌ El cliente no tiene email configurado');
            return NextResponse.json(
                { error: 'El cliente no tiene email configurado' },
                { status: 400 }
            );
        }

        console.log('📧 Enviando email a:', contract.clients.email);

        try {
            console.log('📄 Generando PDF del contrato...');
            const pdfBuffer = await generateContractPDF(contract, profile);
            console.log('✅ PDF generado correctamente, tamaño:', pdfBuffer.length, 'bytes');

            // Generar HTML del email
            const emailHtml = generateEmailHtml(contract, profile, user);

            // Configurar el email con el PDF adjunto usando dominio verificado
            const freelancerName = profile?.full_name || user.email?.split('@')[0] || 'Freelancer';
            const fromEmail = `${freelancerName} <noreply@taskelio.app>`;

            const emailData = {
                from: fromEmail,
                to: [contract.clients.email],
                subject: `Contrato de Servicios - ${contract.title}`,
                html: emailHtml,
                attachments: [
                    {
                        filename: `Contrato_${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                        content: pdfBuffer,
                    }
                ]
            };

            console.log('📧 Enviando email con PDF adjunto...');
            const emailResult = await resend.emails.send(emailData);

            if (emailResult.error) {
                console.error('❌ Error enviando email:', emailResult.error);
                return NextResponse.json(
                    { error: 'Error enviando email', details: emailResult.error },
                    { status: 500 }
                );
            }

            console.log('✅ Email enviado exitosamente:', emailResult.data?.id);

            // Actualizar el contrato como enviado
            const { error: updateError } = await supabase
                .from('contracts')
                .update({
                    sent_at: new Date().toISOString(),
                    status: 'sent'
                })
                .eq('id', contractId);

            if (updateError) {
                console.error('❌ Error actualizando contrato:', updateError);
            }

            return NextResponse.json({
                success: true,
                message: 'Contrato enviado exitosamente',
                emailId: emailResult.data?.id
            });

        } catch (pdfError) {
            console.error('❌ Error generando PDF:', pdfError);
            return NextResponse.json(
                { error: 'Error generando PDF del contrato', details: pdfError },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('❌ Error general:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error },
            { status: 500 }
        );
    }
}

// Función para generar HTML del email
function generateEmailHtml(contract: any, profile: any, user: any): string {
    // Usar nombre de empresa, nombre completo, o extraer nombre del email
    const extractNameFromEmail = (email: string) => {
        return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const companyName = profile?.company_name || profile?.full_name ||
        (user?.email ? extractNameFromEmail(user.email) : 'Freelancer');
    const userName = profile?.full_name ||
        (user?.email ? extractNameFromEmail(user.email) : 'Freelancer');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contrato de Servicios</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 30px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2563eb;
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 10px 0;
            }
            .header .subtitle {
                color: #64748b;
                font-size: 22px;
                font-weight: 700;
                margin: 0;
            }
            .content p {
                font-size: 16px;
                margin-bottom: 15px;
            }
            .contract-details {
                background: #f1f5f9;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .contract-details h3 {
                color: #1e293b;
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 15px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
            }
            .detail-label {
                font-weight: 600;
                color: #475569;
            }
            .detail-value {
                color: #1e293b;
                font-weight: 500;
            }
            .attachment-notice {
                background: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 8px;
                padding: 16px;
                margin: 25px 0;
                text-align: center;
            }
            .attachment-notice h4 {
                color: #1d4ed8;
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
            }
            .attachment-notice p {
                color: #1e40af;
                font-size: 14px;
                margin: 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            .footer p {
                font-size: 16px;
                color: #64748b;
            }
            .footer .signature {
                font-size: 14px;
                color: #94a3b8;
                margin-top: 15px;
            }
            .cta-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 25px;
                border-radius: 8px;
                text-align: center;
                margin: 25px 0;
            }
            .cta-section h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                opacity: 0.9;
            }
            .company-info {
                text-align: center;
                margin-bottom: 20px;
            }
            .company-info h2 {
                color: #1e293b;
                margin: 0 0 5px 0;
                font-size: 24px;
            }
            .company-info p {
                margin: 10px 0 0 0;
                font-size: 18px;
                opacity: 0.9;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Contrato de Servicios</h1>
                <p class="subtitle">Documento contractual</p>
            </div>

            <div class="company-info">
                <h2>${companyName}</h2>
                ${companyName ? `<div style="font-size: 16px; color: #4a5568; margin-bottom: 8px;">${companyName}</div>` : ''}
                <p>Propuesta contractual profesional</p>
            </div>

            <div class="content">
                <p>Estimado/a <strong>${contract.clients?.name || 'Cliente'}</strong>,</p>
                
                <p>Nos complace enviarle el contrato de servicios para su revisión y firma. Este documento establece los términos y condiciones de nuestros servicios profesionales.</p>

                <div class="contract-details">
                    <h3>📄 Detalles del Contrato</h3>
                    <div class="detail-row">
                        <span class="detail-label">Título:</span>
                        <span class="detail-value">${contract.title}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tipo de Servicio:</span>
                        <span class="detail-value">${contract.service_type || 'General'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Cliente:</span>
                        <span class="detail-value">${contract.clients?.name}</span>
                    </div>
                    ${contract.clients?.company ? `
                    <div class="detail-row">
                        <span class="detail-label">Empresa:</span>
                        <span class="detail-value">${contract.clients.company}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Fecha de Creación:</span>
                        <span class="detail-value">${new Date(contract.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>

                <div class="attachment-notice">
                    <h4>📎 PDF Adjunto</h4>
                    <p>El contrato completo se encuentra adjunto a este email en formato PDF</p>
                </div>

                <div class="cta-section">
                    <h3>Próximos Pasos</h3>
                    <p style="margin: 0; color: #01579b; font-weight: 600;">
                        Por favor, revise el contrato adjunto y no dude en contactarnos si tiene alguna pregunta o comentario.
                    </p>
                </div>

                <p>Si tiene alguna pregunta sobre este contrato, no dude en ponerse en contacto con nosotros. Estamos aquí para ayudarle en todo lo que necesite.</p>
            </div>

            <div class="footer">
                <p><strong>Gracias por confiar en nosotros</strong></p>
                <div class="signature">
                    <p>${userName}<br>
                    ${companyName}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Función para generar PDF del contrato usando jsPDF
async function generateContractPDF(contract: any, profile: any): Promise<Buffer> {
    const { jsPDF } = await import('jspdf');

    try {
        // Crear documento PDF con jsPDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Configuración
        const marginLeft = 20;
        const marginTop = 20;
        const pageWidth = 210; // A4 width in mm
        const contentWidth = pageWidth - (marginLeft * 2);

        // Función para limpiar texto
        const cleanText = (text: string) => {
            return text
                .replace(/[^\x00-\x7F]/g, "") // Remover caracteres no ASCII
                .replace(/"/g, "'") // Reemplazar comillas dobles
                .replace(/[{}]/g, "") // Remover llaves
                .trim();
        };

        let currentY = marginTop;

        // Header
        doc.setFillColor(37, 99, 235); // Color azul
        doc.rect(marginLeft, currentY, contentWidth, 3, 'F');
        currentY += 10;

        // Título principal
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235);
        const title = 'CONTRATO DE SERVICIOS';
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, currentY);
        currentY += 15;

        // Título del contrato
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        const contractTitle = cleanText(contract.title);
        const contractTitleWidth = doc.getTextWidth(contractTitle);
        const contractTitleX = (pageWidth - contractTitleWidth) / 2;
        doc.text(contractTitle, contractTitleX, currentY);
        currentY += 20;

        // Información del cliente
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('INFORMACION DEL CLIENTE', marginLeft, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        if (contract.clients?.name) {
            doc.text(`Cliente: ${cleanText(contract.clients.name)}`, marginLeft + 5, currentY);
            currentY += 6;
        }
        if (contract.clients?.company) {
            doc.text(`Empresa: ${cleanText(contract.clients.company)}`, marginLeft + 5, currentY);
            currentY += 6;
        }
        if (contract.clients?.email) {
            doc.text(`Email: ${contract.clients.email}`, marginLeft + 5, currentY);
            currentY += 6;
        }
        currentY += 10;

        // Detalles del servicio
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('DETALLES DEL SERVICIO', marginLeft, currentY);
        currentY += 8;

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Tipo de Servicio: ${contract.service_type || 'General'}`, marginLeft + 5, currentY);
        currentY += 6;
        doc.text(`Fecha de Creacion: ${new Date(contract.created_at).toLocaleDateString('es-ES')}`, marginLeft + 5, currentY);
        currentY += 15;

        // Contenido del contrato según el tipo de servicio
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('TERMINOS Y CONDICIONES', marginLeft, currentY);
        currentY += 8;

        // Generar contenido según el tipo de servicio
        const contractContent = generateContractContent(contract.service_type || 'general', contract, profile);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Dividir contenido en líneas
        const lines = doc.splitTextToSize(contractContent, contentWidth);

        for (const line of lines) {
            if (currentY > 260) { // Nueva página si es necesario
                doc.addPage();
                currentY = marginTop;
            }
            doc.text(line, marginLeft, currentY);
            currentY += 5;
        }

        // Firma
        currentY += 15;
        if (currentY > 240) {
            doc.addPage();
            currentY = marginTop;
        }

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('FIRMAS:', marginLeft, currentY);
        currentY += 15;

        doc.setFontSize(9);
        doc.text('Prestador del Servicio:', marginLeft, currentY);
        doc.text('Cliente:', marginLeft + 90, currentY);
        currentY += 20;

        doc.text('_________________________', marginLeft, currentY);
        doc.text('_________________________', marginLeft + 90, currentY);
        currentY += 8;

        const providerName = profile?.full_name || 'Prestador del Servicio';
        doc.text(cleanText(providerName), marginLeft, currentY);
        doc.text(cleanText(contract.clients?.name || 'Cliente'), marginLeft + 90, currentY);

        // Convertir a buffer
        const pdfArrayBuffer = doc.output('arraybuffer');
        return Buffer.from(pdfArrayBuffer);

    } catch (error) {
        console.error('Error generando PDF con jsPDF:', error);
        throw new Error(`Error generando PDF: ${error}`);
    }
}

// Función para generar contenido del contrato según el tipo
function generateContractContent(serviceType: string, contract: any, profile: any): string {
    const companyName = profile?.company_name || 'La Empresa';
    const providerName = profile?.full_name || 'El Prestador';
    const clientName = contract.clients?.name || 'El Cliente';

    const baseContent = `
OBJETO DEL CONTRATO:
${companyName} se compromete a prestar servicios profesionales de ${serviceType} segun las especificaciones acordadas.

OBLIGACIONES DEL PRESTADOR:
- Ejecutar los servicios con la maxima calidad y profesionalismo
- Cumplir con los plazos establecidos
- Mantener confidencialidad sobre la informacion del cliente
- Proporcionar soporte y asesoria durante la ejecucion

OBLIGACIONES DEL CLIENTE:
- Proporcionar toda la informacion necesaria para la ejecucion
- Realizar los pagos en las fechas acordadas
- Colaborar activamente en el desarrollo del proyecto
- Revisar y aprobar entregables en tiempo oportuno

CONDICIONES GENERALES:
- Este contrato se rige por la legislacion vigente
- Cualquier modificacion debe ser acordada por escrito
- Los derechos de propiedad intelectual se establecen segun lo acordado
- La resolucion de conflictos se hara mediante arbitraje

VIGENCIA:
Este contrato entra en vigencia desde su firma y permanece activo hasta la completion satisfactoria de los servicios acordados.
    `;

    return baseContent;
}