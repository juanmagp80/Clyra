'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
    ArrowLeft,
    Check,
    Clock,
    Copy,
    Download,
    Edit,
    FileText,
    Mail,
    Send,
    Sparkles,
    User
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { showToast } from '@/utils/toast';
// import { demoClients, demoInvoices, demoProjects, demoUser } from '../../demo-data';
interface DemoClient {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
}
interface DemoInvoice {
    id: string;
    title?: string;
    client_id?: string;
    project_id?: string;
    issue_date?: string;
    due_date?: string;
    paid_date?: string;
    status?: string;
    amount?: number;
    tax_rate?: number;
    tax_amount?: number;
    total_amount?: number;
}
interface DemoProject {
    id: string;
    title?: string;
}
const demoClients: DemoClient[] = [];
const demoInvoices: DemoInvoice[] = [];
const demoProjects: DemoProject[] = [];
const demoUser = { company: 'Demo Company', name: 'Demo User', email: 'demo@demo.com' };

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default function DemoInvoiceDetailsPage({ params }: Props) {
    const [invoice, setInvoice] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [project, setProject] = useState<any>(null);
    useEffect(() => {
        (async () => {
            const { id } = await params;
            const inv = demoInvoices.find(inv => inv.id === id);
            if (!inv) {
                notFound();
                return;
            }
            setInvoice(inv);
            setClient(demoClients.find(c => c.id === inv.client_id));
            setProject(demoProjects.find(p => p.id === inv.project_id));
        })();
    }, [params]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            paid: 'bg-green-100 text-green-800 border-green-200',
            sent: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            overdue: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };

        const labels = {
            paid: 'Pagada',
            sent: 'Enviada',
            draft: 'Borrador',
            overdue: 'Vencida',
            cancelled: 'Cancelada'
        };

        return (
            <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    // Función para simular acciones
    const handleAction = (action: string) => {
        showToast.error(`Demo: ${action}. ¡Crea tu cuenta para usar esta funcionalidad!`);
    };

    // Datos ficticios para la factura detallada
    const invoiceItems = [
        {
            description: 'Diseño de identidad corporativa completa',
            quantity: 1,
            rate: 1800,
            amount: 1800
        },
        {
            description: 'Aplicaciones de la marca (papelería, tarjetas)',
            quantity: 1,
            rate: 600,
            amount: 600
        },
        {
            description: 'Manual de marca y guidelines',
            quantity: 1,
            rate: 288,
            amount: 288
        }
    ];

    return (
        <div className="p-6">
            {/* Header con navegación */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/demo/invoices">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Facturas
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Detalle de Factura</h1>
                        <p className="text-muted-foreground">Factura #{invoice.id.replace('demo-inv-', 'FAC-2024-00')}</p>
                    </div>
                </div>
                <Link href="/register">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Crear cuenta gratis
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto">
                {/* Invoice Header */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    {invoice.title}
                                </h2>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <span>Factura #{invoice.id.replace('demo-inv-', 'FAC-2024-00')}</span>
                                    <span>•</span>
                                    <span>{formatDate(invoice.issue_date)}</span>
                                    <span>•</span>
                                    {getStatusBadge(invoice.status)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {invoice.status === 'draft' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAction('Enviar factura')}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar
                                    </Button>
                                )}
                                {invoice.status === 'sent' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAction('Enviar recordatorio')}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Recordar
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => handleAction('Imprimir factura')}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Imprimir
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleAction('Descargar PDF')}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar
                                </Button>
                                <Button
                                    onClick={() => handleAction('Editar factura')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="p-6">
                        {/* Company and Client Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* From */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                    De
                                </h3>
                                <div className="text-slate-900">
                                    <p className="font-semibold text-lg">{demoUser.company}</p>
                                    <p className="text-slate-600">{demoUser.name}</p>
                                    <p className="text-slate-600">{demoUser.email}</p>
                                    <p className="text-slate-600">Calle Ejemplo 123</p>
                                    <p className="text-slate-600">28001 Madrid, España</p>
                                    <p className="text-slate-600">CIF: B12345678</p>
                                </div>
                            </div>

                            {/* To */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                    Para
                                </h3>
                                <div className="text-slate-900">
                                    <p className="font-semibold text-lg">{client?.company}</p>
                                    <p className="text-slate-600">{client?.name}</p>
                                    <p className="text-slate-600">{client?.email}</p>
                                    <p className="text-slate-600">{client?.phone}</p>
                                    <p className="text-slate-600">Dirección del cliente</p>
                                    <p className="text-slate-600">Ciudad, CP, País</p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Fecha de emisión</p>
                                <p className="text-slate-900 font-semibold">{formatDate(invoice.issue_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Fecha de vencimiento</p>
                                <p className="text-slate-900 font-semibold">{formatDate(invoice.due_date)}</p>
                            </div>
                            {invoice.paid_date && (
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Fecha de pago</p>
                                    <p className="text-green-600 font-semibold flex items-center">
                                        <Check className="w-4 h-4 mr-1" />
                                        {formatDate(invoice.paid_date)}
                                    </p>
                                </div>
                            )}
                            {project && (
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Proyecto</p>
                                    <p className="text-slate-900 font-semibold">{project.title}</p>
                                </div>
                            )}
                        </div>

                        {/* Invoice Items */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Conceptos</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Descripción</th>
                                            <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 w-20">Cant.</th>
                                            <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700 w-24">Precio</th>
                                            <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700 w-24">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceItems.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-100">
                                                <td className="py-4 px-2 text-slate-900">{item.description}</td>
                                                <td className="py-4 px-2 text-center text-slate-600">{item.quantity}</td>
                                                <td className="py-4 px-2 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                                                <td className="py-4 px-2 text-right font-semibold text-slate-900">{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs">
                                <div className="space-y-2">
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(invoice.amount)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-600">IVA ({invoice.tax_rate}%):</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(invoice.tax_amount)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2">
                                        <div className="flex justify-between py-2">
                                            <span className="text-lg font-semibold text-slate-900">Total:</span>
                                            <span className="text-xl font-bold text-slate-900">{formatCurrency(invoice.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        {invoice.status === 'paid' && (
                            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-800">Factura pagada</span>
                                </div>
                                <p className="text-green-700 text-sm">
                                    Pagada el {formatDate(invoice.paid_date!)} - Gracias por tu pago puntual.
                                </p>
                            </div>
                        )}

                        {invoice.status === 'sent' && (
                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                    <span className="font-semibold text-yellow-800">Pendiente de pago</span>
                                </div>
                                <p className="text-yellow-700 text-sm">
                                    Vence el {formatDate(invoice.due_date)} - Se enviará un recordatorio automático si no se recibe el pago.
                                </p>
                            </div>
                        )}

                        {/* Payment Instructions */}
                        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-semibold text-slate-900 mb-2">Instrucciones de pago</h4>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p><strong>Transferencia bancaria:</strong></p>
                                <p>IBAN: ES21 1234 5678 9012 3456 7890</p>
                                <p>BIC: BANKESMMXXX</p>
                                <p>Concepto: Factura #{invoice.id.replace('demo-inv-', 'FAC-2024-00')}</p>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-900 mb-2">Notas adicionales</h4>
                            <p className="text-sm text-slate-600">
                                Gracias por confiar en nuestros servicios. El trabajo ha sido completado según las especificaciones acordadas.
                                Para cualquier consulta, no dude en contactarnos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleAction('Duplicar factura')}
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar factura
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleAction('Crear factura rectificativa')}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Factura rectificativa
                    </Button>
                    <Link href={`/demo/clients/${client?.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                            <User className="w-4 h-4 mr-2" />
                            Ver cliente
                        </Button>
                    </Link>
                </div>

                {/* CTA Section */}
                <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            ¿Te gusta lo que ves?
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Crea facturas profesionales como esta en minutos. Automatiza tu facturación
                            y mantén el control total de tus ingresos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Comenzar gratis
                                </Button>
                            </Link>
                            <Link href="/demo/invoices">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                    Ver más facturas
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
