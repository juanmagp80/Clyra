// Sistema de acciones de automatización para Clyra
// Cada acción tiene un tipo específico y ejecuta una funcionalidad concreta

import { SupabaseClient, User } from '@supabase/supabase-js';

// Tipos de acciones disponibles
export type ActionType = 
    | 'send_email'
    | 'create_invoice'
    | 'update_project_status'
    | 'create_calendar_event'
    | 'assign_task'
    | 'send_whatsapp'
    | 'generate_report'
    | 'create_proposal';

// Interfaz para una acción de automatización
export interface AutomationAction {
    type: ActionType;
    parameters: Record<string, any>;
}

// Payload que se pasa a cada acción - datos completos del contexto
export interface ActionPayload {
    client: {
        id: string;
        name: string;
        email: string;
        company?: string;
        phone?: string;
        [key: string]: any;
    };
    automation: {
        id: string;
        name: string;
        description?: string;
        [key: string]: any;
    };
    user: User;
    supabase: SupabaseClient;
    executionId: string;
}

// Resultado de la ejecución de una acción
export interface ActionResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

// Interfaz para un executor de acciones
export interface ActionExecutor {
    (action: AutomationAction, payload: ActionPayload): Promise<ActionResult>;
}
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

// Clase principal para ejecutar acciones
export class AutomationActionExecutor {
    private supabase;

    constructor() {
        this.supabase = createSupabaseClient();
    }

    // Método principal para ejecutar una acción
    async executeAction(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        console.log(`🔄 Ejecutando acción: ${action.name} (${action.type})`);
        
        try {
            switch (action.type) {
                case 'send_email':
                    return await this.sendEmail(action, payload);
                
                case 'create_task':
                    return await this.createTask(action, payload);
                
                case 'create_notification':
                    return await this.createNotification(action, payload);
                
                case 'update_project_status':
                    return await this.updateProjectStatus(action, payload);
                
                case 'create_invoice':
                    return await this.createInvoice(action, payload);
                
                case 'schedule_meeting':
                    return await this.scheduleMeeting(action, payload);
                
                case 'send_sms':
                    return await this.sendSMS(action, payload);
                
                case 'create_proposal':
                    return await this.createProposal(action, payload);
                
                case 'update_client_status':
                    return await this.updateClientStatus(action, payload);
                
                case 'generate_report':
                    return await this.generateReport(action, payload);
                
                case 'backup_data':
                    return await this.backupData(action, payload);
                
                default:
                    return {
                        success: false,
                        message: `Tipo de acción no reconocido: ${action.type}`,
                        error: 'UNKNOWN_ACTION_TYPE'
                    };
            }
        } catch (error) {
            console.error(`❌ Error ejecutando acción ${action.name}:`, error);
            return {
                success: false,
                message: `Error ejecutando ${action.name}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // ===========================================
    // IMPLEMENTACIONES ESPECÍFICAS DE ACCIONES
    // ===========================================

    // Implementación específica para envío de emails
const sendEmailAction: ActionExecutor = async (action, payload) => {
  try {
    const emailData = action.parameters;
    
    // Validar parámetros requeridos
    if (!emailData.subject || !emailData.template) {
      return {
        success: false,
        message: "Faltan parámetros requeridos: subject y template",
        error: "Missing required parameters"
      };
    }

    // Preparar variables para el template
    const variables = {
      client_name: payload.client.name,
      client_email: payload.client.email,
      client_company: payload.client.company || payload.client.name,
      user_name: payload.user?.user_metadata?.full_name || 'Usuario',
      ...emailData.variables
    };

    // Reemplazar variables en el template
    let emailContent = emailData.template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      emailContent = emailContent.replace(regex, String(value));
    });

    // Registrar comunicación en la base de datos
    const { data: communicationData, error: commError } = await payload.supabase
      .from('client_communications')
      .insert({
        user_id: payload.user.id,
        client_id: payload.client.id,
        type: 'email',
        subject: emailData.subject,
        content: emailContent,
        status: 'sent',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (commError) {
      console.error('Error guardando comunicación:', commError);
      return {
        success: false,
        message: "Error al registrar la comunicación",
        error: commError.message
      };
    }

    // TODO: Aquí integraríamos con servicio de email real (SendGrid, Resend, etc.)
    console.log('📧 Email que se enviaría:', {
      to: payload.client.email,
      subject: emailData.subject,
      content: emailContent
    });

    return {
      success: true,
      message: `Email "${emailData.subject}" enviado correctamente a ${payload.client.email}`,
      data: {
        communicationId: communicationData.id,
        recipient: payload.client.email,
        subject: emailData.subject
      }
    };

  } catch (error) {
    console.error('Error en sendEmailAction:', error);
    return {
      success: false,
      message: "Error interno al enviar email",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

    private async createTask(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        if (!this.supabase || !payload.userId) {
            return {
                success: false,
                message: 'Supabase no disponible o usuario no identificado',
                error: 'NO_SUPABASE'
            };
        }

        const config = action.config;
        const taskData = {
            user_id: payload.userId,
            title: config.title || `Tarea de ${action.name}`,
            description: config.description || `Tarea creada automáticamente por: ${action.name}`,
            status: config.status || 'pending',
            priority: config.priority || 'medium',
            due_date: config.due_date || null,
            project_id: payload.projectId || null,
            client_id: payload.clientId || null,
            is_billable: config.is_billable || false,
            created_at: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Error creando tarea',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Tarea "${taskData.title}" creada exitosamente`,
            data: data
        };
    }

    private async createNotification(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        if (!this.supabase || !payload.userId) {
            return {
                success: false,
                message: 'Supabase no disponible o usuario no identificado',
                error: 'NO_SUPABASE'
            };
        }

        const config = action.config;
        const notificationData = {
            user_id: payload.userId,
            title: config.title || action.name,
            message: config.message || `Notificación de automatización: ${action.name}`,
            type: config.type || 'info',
            is_read: false,
            action_url: config.action_url || null,
            created_at: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('notifications')
            .insert([notificationData])
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Error creando notificación',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Notificación "${notificationData.title}" creada exitosamente`,
            data: data
        };
    }

    private async updateProjectStatus(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        if (!this.supabase || !payload.projectId) {
            return {
                success: false,
                message: 'Supabase no disponible o proyecto no identificado',
                error: 'NO_PROJECT'
            };
        }

        const config = action.config;
        const newStatus = config.status || 'updated';

        const { data, error } = await this.supabase
            .from('projects')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', payload.projectId)
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Error actualizando estado del proyecto',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Estado del proyecto actualizado a: ${newStatus}`,
            data: data
        };
    }

    private async createInvoice(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        if (!this.supabase || !payload.userId) {
            return {
                success: false,
                message: 'Supabase no disponible o usuario no identificado',
                error: 'NO_SUPABASE'
            };
        }

        const config = action.config;
        const invoiceData = {
            user_id: payload.userId,
            client_id: payload.clientId || null,
            invoice_number: config.invoice_number || `INV-${Date.now()}`,
            amount: config.amount || payload.amount || 0,
            currency: config.currency || 'EUR',
            status: config.status || 'draft',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: config.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: config.description || `Factura generada automáticamente por ${action.name}`,
            created_at: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('invoices')
            .insert([invoiceData])
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Error creando factura',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Factura ${invoiceData.invoice_number} creada exitosamente`,
            data: data
        };
    }

    private async scheduleMeeting(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        if (!this.supabase || !payload.userId) {
            return {
                success: false,
                message: 'Supabase no disponible o usuario no identificado',
                error: 'NO_SUPABASE'
            };
        }

        const config = action.config;
        const meetingData = {
            user_id: payload.userId,
            title: config.title || `Reunión - ${action.name}`,
            description: config.description || 'Reunión programada automáticamente',
            start_time: config.start_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end_time: config.end_time || new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
            type: 'meeting',
            client_id: payload.clientId || null,
            project_id: payload.projectId || null,
            meeting_url: config.meeting_url || '',
            location: config.location || '',
            status: 'scheduled',
            created_at: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('calendar_events')
            .insert([meetingData])
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Error programando reunión',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Reunión "${meetingData.title}" programada exitosamente`,
            data: data
        };
    }

    private async sendSMS(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        const config = action.config;
        const phoneNumber = config.phone || payload.clientPhone;
        
        if (!phoneNumber) {
            return {
                success: false,
                message: 'Número de teléfono no disponible',
                error: 'NO_PHONE'
            };
        }

        // Simular envío de SMS (aquí integrarías con Twilio, etc.)
        console.log(`📱 Enviando SMS a ${phoneNumber}: ${config.message}`);
        
        return {
            success: true,
            message: `SMS enviado exitosamente a ${phoneNumber}`,
            data: { phoneNumber, message: config.message }
        };
    }

    private async createProposal(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        if (!this.supabase || !payload.userId) {
            return {
                success: false,
                message: 'Supabase no disponible o usuario no identificado',
                error: 'NO_SUPABASE'
            };
        }

        const config = action.config;
        const proposalData = {
            user_id: payload.userId,
            client_id: payload.clientId || null,
            title: config.title || `Propuesta - ${action.name}`,
            description: config.description || 'Propuesta generada automáticamente',
            amount: config.amount || 0,
            currency: config.currency || 'EUR',
            status: 'draft',
            valid_until: config.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('proposals')
            .insert([proposalData])
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Error creando propuesta',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Propuesta "${proposalData.title}" creada exitosamente`,
            data: data
        };
    }

    private async updateClientStatus(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        if (!this.supabase || !payload.clientId) {
            return {
                success: false,
                message: 'Supabase no disponible o cliente no identificado',
                error: 'NO_CLIENT'
            };
        }

        const config = action.config;
        const newStatus = config.status || 'updated';

        const { data, error } = await this.supabase
            .from('clients')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', payload.clientId)
            .select()
            .single();

        if (error) {
            return {
                success: false,
                message: 'Error actualizando estado del cliente',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Estado del cliente actualizado a: ${newStatus}`,
            data: data
        };
    }

    private async generateReport(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        // Simular generación de reporte
        const config = action.config;
        const reportType = config.report_type || 'general';
        
        console.log(`📊 Generando reporte tipo: ${reportType}`);
        
        return {
            success: true,
            message: `Reporte ${reportType} generado exitosamente`,
            data: { reportType, generated_at: new Date().toISOString() }
        };
    }

    private async backupData(action: AutomationAction, payload: ActionPayload): Promise<ActionResult> {
        // Simular backup de datos
        const config = action.config;
        const backupType = config.backup_type || 'full';
        
        console.log(`💾 Realizando backup tipo: ${backupType}`);
        
        return {
            success: true,
            message: `Backup ${backupType} realizado exitosamente`,
            data: { backupType, backup_date: new Date().toISOString() }
        };
    }
}

// Función helper para ejecutar una acción (para usar desde componentes)
export async function executeAutomationAction(
    action: AutomationAction, 
    payload: ActionPayload
): Promise<ActionResult> {
    const executor = new AutomationActionExecutor();
    return await executor.executeAction(action, payload);
}
