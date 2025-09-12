import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import { authMiddleware } from '../../../auth/middleware';

export async function GET(request: NextRequest) {
    // Extraer el id de la URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const id = pathSegments[pathSegments.length - 2]; // El id está antes de 'pdf' en la ruta
    
    if (!id) {
        return new NextResponse('ID de presupuesto no encontrado', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
    
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ 
            cookies: () => cookieStore,
        });

        // Obtener la sesión actual
        const {
            data: { session },
            error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Error getting session:', sessionError);
            return new NextResponse('Error de autenticación', {
                status: 401,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Si no hay sesión, intentar refrescarla
        if (!session) {
            try {
                const { data: { session: refreshedSession }, error: refreshError } = 
                    await supabase.auth.refreshSession();
                
                if (refreshError || !refreshedSession) {
                    console.error('Error refreshing session:', refreshError);
                    return new NextResponse('Sesión expirada. Por favor, inicie sesión nuevamente.', {
                        status: 401,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                }
            } catch (refreshError) {
                console.error('Error in refresh attempt:', refreshError);
                return new NextResponse('Error al refrescar la sesión', {
                    status: 401,
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        }

        // Verificar que tenemos un usuario válido
        const user = session?.user;
        if (!user) {
            return new NextResponse('Usuario no encontrado', {
                status: 401,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Asegurarse de que la sesión sea válida
        if (!session.user.id) {
            return new NextResponse('Sesión inválida', { 
                status: 401,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Obtener el presupuesto con sus items y datos del cliente
        const { data: budget, error: budgetError } = await supabase
            .from('budgets')
            .select(`
                *,
                budget_items(*),
                clients(
                    name,
                    email,
                    address,
                    phone,
                    tax_id
                )
            `)
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();

        if (budgetError || !budget) {
            console.error('Error fetching budget:', budgetError);
            return new NextResponse('Budget not found', { status: 404 });
        }

        // Crear el documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Configurar la respuesta como un stream
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
            const result = Buffer.concat(chunks);
            // El PDF se enviará en la respuesta más abajo
        });

        // Encabezado
        doc.fontSize(20)
            .text('PRESUPUESTO', { align: 'center' })
            .moveDown();

        // Información del presupuesto
        doc.fontSize(12)
            .text(`Número: #${budget.id}`)
            .text(`Fecha: ${new Date(budget.created_at).toLocaleDateString('es-ES')}`)
            .text(`Estado: ${budget.status.toUpperCase()}`)
            .moveDown();

        // Información del cliente
        doc.fontSize(14)
            .text('CLIENTE', { underline: true })
            .fontSize(12)
            .text(budget.clients.name)
            .text(budget.clients.address || '')
            .text(budget.clients.email)
            .text(`CIF/NIF: ${budget.clients.tax_id || ''}`)
            .moveDown();

        // Tabla de items
        doc.fontSize(14)
            .text('DETALLES DEL PRESUPUESTO', { underline: true })
            .moveDown();

        // Encabezados de la tabla
        const startX = 50;
        const startY = doc.y;
        const columnWidth = 100;

        doc.fontSize(10)
            .text('Descripción', startX, startY)
            .text('Cantidad', startX + 300, startY)
            .text('Precio', startX + 380, startY)
            .text('Total', startX + 460, startY)
            .moveDown();

        // Línea separadora
        doc.moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown();

        // Items
        let subtotal = 0;
        budget.budget_items.forEach((item: any) => {
            const itemTotal = item.quantity * item.unit_price;
            subtotal += itemTotal;

            doc.text(item.title, startX)
                .text(item.quantity.toString(), startX + 300)
                .text(`€${item.unit_price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, startX + 380)
                .text(`€${itemTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, startX + 460)
                .moveDown();

            if (item.description) {
                doc.fontSize(8)
                    .text(item.description, startX, doc.y - 10, { width: 280 })
                    .fontSize(10)
                    .moveDown();
            }
        });

        // Línea separadora
        doc.moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown();

        // Totales
        const tax = (subtotal * (budget.tax_rate || 0)) / 100;
        const total = subtotal + tax;

        doc.fontSize(10)
            .text('Subtotal:', 380, doc.y)
            .text(`€${subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 460)
            .moveDown();

        doc.text(`IVA (${budget.tax_rate}%):`, 380)
            .text(`€${tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 460)
            .moveDown();

        doc.fontSize(12)
            .text('TOTAL:', 380)
            .text(`€${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 460)
            .moveDown();

        // Notas y condiciones
        if (budget.notes) {
            doc.moveDown()
                .fontSize(14)
                .text('NOTAS ADICIONALES', { underline: true })
                .fontSize(10)
                .text(budget.notes)
                .moveDown();
        }

        if (budget.terms_conditions) {
            doc.moveDown()
                .fontSize(14)
                .text('TÉRMINOS Y CONDICIONES', { underline: true })
                .fontSize(10)
                .text(budget.terms_conditions)
                .moveDown();
        }

        // Finalizar el documento y retornar una promesa
        doc.end();

        return new Promise<NextResponse>((resolve, reject) => {
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const headers = new Headers();
                headers.append('Content-Type', 'application/pdf');
                headers.append('Content-Disposition', `attachment; filename="presupuesto-${id}.pdf"`);

                resolve(new NextResponse(buffer, {
                    status: 200,
                    headers
                }));
            });

            doc.on('error', (err) => {
                reject(new NextResponse('Error al generar el PDF', {
                    status: 500,
                    headers: { 'Content-Type': 'text/plain' }
                }));
            });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        let errorMessage = 'Error al generar el PDF';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return new NextResponse(errorMessage, { 
            status: 500,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
}
