// Funciones para obtener automáticamente datos de eventos desde la base de datos
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';

const supabase = createSupabaseAdmin();

// ========================================
// 🔄 DETECTORES AUTOMÁTICOS DE EVENTOS
// ========================================

// Obtener datos completos de contrato firmado
export async function getContractSignedData(contractId: string, userId: string) {
    try {
        // Obtener contrato con datos del cliente
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select(`
                *,
                clients (
                    id,
                    name,
                    company,
                    email,
                    phone
                )
            `)
            .eq('id', contractId)
            .eq('user_id', userId)
            .single();

        if (contractError || !contract) {
            throw new Error('Contrato no encontrado');
        }

        return {
            trigger: 'contract_signed',
            context: {
                client: {
                    name: contract.clients?.name || 'Cliente',
                    company: contract.clients?.company || '',
                    email: contract.clients?.email || '',
                    phone: contract.clients?.phone || ''
                },
                contract: {
                    id: contract.id,
                    title: contract.title || 'Contrato de Servicios',
                    value: contract.contract_value || 0,
                    project: contract.project_details || contract.description || 'Proyecto',
                    startDate: contract.start_date || new Date().toISOString().split('T')[0],
                    endDate: contract.end_date || '',
                    status: contract.status || 'firmado',
                    description: contract.description || ''
                },
                company: {
                    name: 'Tu Empresa', // Esto se puede obtener de company_settings
                    email: '', // Se puede obtener del perfil del usuario
                }
            }
        };
    } catch (error) {
        console.error('Error obteniendo datos del contrato:', error);
        throw error;
    }
}

// Obtener datos completos de pago recibido
export async function getPaymentReceivedData(invoiceId: string, userId: string) {
    try {
        // Obtener factura con datos del cliente
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
                *,
                clients (
                    id,
                    name,
                    company,
                    email
                ),
                projects (
                    id,
                    name,
                    description
                )
            `)
            .eq('id', invoiceId)
            .eq('user_id', userId)
            .single();

        if (invoiceError || !invoice) {
            throw new Error('Factura no encontrada');
        }

        return {
            trigger: 'payment_received',
            context: {
                client: {
                    name: invoice.clients?.name || 'Cliente',
                    company: invoice.clients?.company || '',
                    email: invoice.clients?.email || ''
                },
                payment: {
                    amount: invoice.amount || 0,
                    currency: 'EUR',
                    date: invoice.paid_date || new Date().toISOString(),
                    invoiceNumber: invoice.invoice_number || invoice.id,
                    project: invoice.projects?.name || 'Proyecto'
                },
                project: {
                    name: invoice.projects?.name || 'Proyecto',
                    description: invoice.projects?.description || ''
                }
            }
        };
    } catch (error) {
        console.error('Error obteniendo datos del pago:', error);
        throw error;
    }
}

// Obtener datos completos de proyecto completado
export async function getProjectCompletedData(projectId: string, userId: string) {
    try {
        // Obtener proyecto con datos del cliente
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select(`
                *,
                clients (
                    id,
                    name,
                    company,
                    email
                )
            `)
            .eq('id', projectId)
            .eq('user_id', userId)
            .single();

        if (projectError || !project) {
            throw new Error('Proyecto no encontrado');
        }

        // Obtener tareas del proyecto para estadísticas
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id, status, total_time_seconds')
            .eq('project_id', projectId)
            .eq('user_id', userId);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const totalHours = (tasks?.reduce((sum, t) => sum + (t.total_time_seconds || 0), 0) || 0) / 3600;

        return {
            trigger: 'project_completed',
            context: {
                client: {
                    name: project.clients?.name || 'Cliente',
                    company: project.clients?.company || '',
                    email: project.clients?.email || ''
                },
                project: {
                    id: project.id,
                    name: project.name || 'Proyecto',
                    description: project.description || '',
                    startDate: project.start_date || '',
                    completedDate: new Date().toISOString().split('T')[0],
                    budget: project.budget || 0,
                    status: project.status || 'completed'
                },
                statistics: {
                    totalTasks,
                    completedTasks,
                    totalHours: Math.round(totalHours * 10) / 10
                }
            }
        };
    } catch (error) {
        console.error('Error obteniendo datos del proyecto:', error);
        throw error;
    }
}

// Obtener datos completos de nuevo cliente registrado
export async function getClientRegisteredData(clientId: string, userId: string) {
    try {
        // Obtener cliente con proyectos asociados
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select(`
                *,
                projects (
                    id,
                    name,
                    budget,
                    status
                )
            `)
            .eq('id', clientId)
            .eq('user_id', userId)
            .single();

        if (clientError || !client) {
            throw new Error('Cliente no encontrado');
        }

        return {
            trigger: 'client_onboarding',
            context: {
                client: {
                    id: client.id,
                    name: client.name || 'Nuevo Cliente',
                    company: client.company || '',
                    email: client.email || '',
                    phone: client.phone || '',
                    address: client.address || '',
                    registrationDate: client.created_at || new Date().toISOString()
                },
                projects: client.projects || [],
                onboarding: {
                    source: client.source || 'direct',
                    referral: client.referral || '',
                    estimatedValue: client.projects?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) || 0
                }
            }
        };
    } catch (error) {
        console.error('Error obteniendo datos del cliente:', error);
        throw error;
    }
}

// Obtener datos de reunión programada desde calendar_events
export async function getMeetingScheduledData(eventId: string, userId: string) {
    try {
        // Obtener evento del calendario
        const { data: event, error: eventError } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('id', eventId)
            .eq('user_id', userId)
            .single();

        if (eventError || !event) {
            throw new Error('Evento no encontrado');
        }

        // Intentar obtener datos del cliente si está especificado
        let clientData = null;
        if (event.client_id) {
            const { data: client } = await supabase
                .from('clients')
                .select('id, name, company, email')
                .eq('id', event.client_id)
                .single();
            clientData = client;
        }

        return {
            trigger: 'meeting_scheduled',
            context: {
                meeting: {
                    id: event.id,
                    title: event.title || 'Reunión',
                    description: event.description || '',
                    startTime: event.start_time,
                    endTime: event.end_time,
                    location: event.location || 'Por definir',
                    type: event.event_type || 'reunion'
                },
                client: clientData ? {
                    name: clientData.name,
                    company: clientData.company,
                    email: clientData.email
                } : null,
                attendees: event.attendees || [],
                preparation: {
                    agenda: event.agenda || '',
                    materials: event.materials || ''
                }
            }
        };
    } catch (error) {
        console.error('Error obteniendo datos de la reunión:', error);
        throw error;
    }
}

// Obtener datos de factura enviada
export async function getInvoiceSentData(invoiceId: string, userId: string) {
    try {
        // Obtener factura con datos del cliente y proyecto
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
                *,
                clients (
                    id,
                    name,
                    company,
                    email
                ),
                projects (
                    id,
                    name,
                    description
                )
            `)
            .eq('id', invoiceId)
            .eq('user_id', userId)
            .single();

        if (invoiceError || !invoice) {
            throw new Error('Factura no encontrada');
        }

        return {
            trigger: 'invoice_sent',
            context: {
                client: {
                    name: invoice.clients?.name || 'Cliente',
                    company: invoice.clients?.company || '',
                    email: invoice.clients?.email || ''
                },
                invoice: {
                    id: invoice.id,
                    number: invoice.invoice_number || invoice.id,
                    amount: invoice.amount || 0,
                    currency: 'EUR',
                    issueDate: invoice.issue_date || new Date().toISOString().split('T')[0],
                    dueDate: invoice.due_date || '',
                    status: invoice.status || 'sent',
                    description: invoice.description || ''
                },
                project: {
                    name: invoice.projects?.name || 'Proyecto',
                    description: invoice.projects?.description || ''
                },
                payment: {
                    terms: invoice.payment_terms || '30 días',
                    methods: ['Transferencia bancaria', 'PayPal'] // Esto se puede personalizar
                }
            }
        };
    } catch (error) {
        console.error('Error obteniendo datos de la factura:', error);
        throw error;
    }
}

// Función principal para detectar y obtener datos automáticamente
export async function getEventDataAutomatically(eventType: string, entityId: string, userId: string) {
    switch (eventType) {
        case 'contract_signed':
            return await getContractSignedData(entityId, userId);
        
        case 'payment_received':
            return await getPaymentReceivedData(entityId, userId);
        
        case 'project_completed':
            return await getProjectCompletedData(entityId, userId);
        
        case 'client_registered':
        case 'client_onboarding':
            return await getClientRegisteredData(entityId, userId);
        
        case 'meeting_scheduled':
            return await getMeetingScheduledData(entityId, userId);
        
        case 'invoice_sent':
            return await getInvoiceSentData(entityId, userId);
        
        default:
            throw new Error(`Tipo de evento no soportado: ${eventType}`);
    }
}

// Función para detectar automáticamente cambios en la base de datos
export async function detectRecentEvents(userId: string, hours: number = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const detectedEvents = [];

    try {
        // Detectar contratos recién firmados (estado changed to 'signed')
        const { data: signedContracts } = await supabase
            .from('contracts')
            .select('id, title, status, updated_at')
            .eq('user_id', userId)
            .eq('status', 'signed')
            .gte('updated_at', cutoffTime);

        for (const contract of signedContracts || []) {
            detectedEvents.push({
                type: 'contract_signed',
                entityId: contract.id,
                timestamp: contract.updated_at,
                description: `Contrato firmado: ${contract.title}`
            });
        }

        // Detectar pagos recién recibidos
        const { data: paidInvoices } = await supabase
            .from('invoices')
            .select('id, invoice_number, amount, paid_date')
            .eq('user_id', userId)
            .eq('status', 'paid')
            .gte('paid_date', cutoffTime);

        for (const invoice of paidInvoices || []) {
            detectedEvents.push({
                type: 'payment_received',
                entityId: invoice.id,
                timestamp: invoice.paid_date,
                description: `Pago recibido: €${invoice.amount} (Factura ${invoice.invoice_number})`
            });
        }

        // Detectar proyectos recién completados
        const { data: completedProjects } = await supabase
            .from('projects')
            .select('id, name, status, updated_at')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('updated_at', cutoffTime);

        for (const project of completedProjects || []) {
            detectedEvents.push({
                type: 'project_completed',
                entityId: project.id,
                timestamp: project.updated_at,
                description: `Proyecto completado: ${project.name}`
            });
        }

        // Detectar nuevos clientes registrados
        const { data: newClients } = await supabase
            .from('clients')
            .select('id, name, company, created_at')
            .eq('user_id', userId)
            .gte('created_at', cutoffTime);

        for (const client of newClients || []) {
            detectedEvents.push({
                type: 'client_registered',
                entityId: client.id,
                timestamp: client.created_at,
                description: `Nuevo cliente: ${client.name} ${client.company ? `(${client.company})` : ''}`
            });
        }

        return detectedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (error) {
        console.error('Error detectando eventos recientes:', error);
        return [];
    }
}
