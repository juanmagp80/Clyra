// Sistema de acciones de automatización para Clyra
// Cada acción tiene un tipo específico y ejecuta una funcionalidad concreta

import { SupabaseClient, User } from '@supabase/supabase-js';
import emailService from './email-service';

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

// =============================================================================
// IMPLEMENTACIONES DE ACCIONES ESPECÍFICAS
// =============================================================================

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

        // Obtener información de la empresa del usuario
        let userCompany = 'Mi Empresa';
        try {
            const { data: userProfile, error: profileError } = await payload.supabase
                .from('profiles')
                .select('company_name')
                .eq('id', payload.user.id)
                .single();
            
            if (!profileError && userProfile?.company_name) {
                userCompany = userProfile.company_name;
            }
        } catch (error) {
            console.warn('⚠️ No se pudo obtener empresa del usuario, usando valor por defecto');
        }

        // Preparar variables para el template
        const variables = {
            client_name: payload.client.name,
            client_email: payload.client.email,
            client_company: payload.client.company || payload.client.name,
            user_name: payload.user?.user_metadata?.full_name || payload.user?.email?.split('@')[0] || 'Equipo Taskelio',
            user_email: payload.user?.email || 'noreply@taskelio.app',
            user_company: userCompany,
            // Variables de presupuesto
            project_name: (payload as any).project_name || '',
            budget_total: (payload as any).budget_total || '',
            budget_spent: (payload as any).budget_spent || '',
            budget_percentage: (payload as any).budget_percentage || '',
            budget_remaining: (payload as any).budget_remaining || '',
            // Variables de reunión
            meeting_title: (payload as any).meeting_title || '',
            meeting_date: (payload as any).meeting_date || '',
            meeting_time: (payload as any).meeting_time || '',
            meeting_location: (payload as any).meeting_location || '',
            ...emailData.variables
        };

        // Reemplazar variables en el template
        let emailContent = emailData.template;
        let emailSubject = emailData.subject;
        
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            emailContent = emailContent.replace(regex, String(value));
            emailSubject = emailSubject.replace(regex, String(value));
        });

        // Registrar comunicación en la base de datos (opcional)
        let communicationData = null;
        try {
            const { data: commData, error: commError } = await payload.supabase
                .from('client_communications')
                .insert({
                    user_id: payload.user.id,
                    client_id: payload.client.id,
                    type: 'email',
                    subject: emailSubject, // Usar el asunto con variables reemplazadas
                    content: emailContent,
                    status: 'sent',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (commError) {
                console.warn('⚠️ No se pudo registrar la comunicación (tabla no existe):', commError.message);
                // Continuar sin registrar la comunicación
            } else {
                communicationData = commData;
                console.log('✅ Comunicación registrada exitosamente');
            }
        } catch (commError) {
            console.warn('⚠️ Error registrando comunicación, continuando sin registrar:', commError);
            // Continuar sin fallar
        }

        // Determinar email de destino basado en el parámetro to_user
        const recipientEmail = emailData.to_user 
            ? (payload.user.email || 'noreply@taskelio.app')  // Enviar al usuario (freelancer)
            : (payload.client.email || ''); // Enviar al cliente (comportamiento por defecto)

        // Validar que tengamos un email válido
        if (!recipientEmail) {
            return {
                success: false,
                message: "No se encontró email válido para el destinatario",
                error: "Missing recipient email"
            };
        }

        console.log('📧 Enviando email a:', emailData.to_user ? 'Usuario' : 'Cliente', recipientEmail);

        // Enviar email usando el servicio real
        const emailResult = await emailService.sendEmail({
            to: recipientEmail,
            subject: emailSubject, // Usar el asunto con variables reemplazadas
            html: emailContent, // Ya viene como HTML del template
            from: `${variables.user_name} <noreply@taskelio.app>`, // Usar dominio verificado
            userId: payload.user.id
        });

        if (!emailResult.success) {
            return {
                success: false,
                message: `Error enviando email: ${emailResult.message}`,
                error: emailResult.error
            };
        }

        return {
            success: true,
            message: `Email "${emailSubject}" enviado correctamente a ${payload.client.email}`,
            data: {
                communicationId: communicationData?.id || null,
                recipient: payload.client.email,
                subject: emailSubject, // Usar el asunto con variables reemplazadas
                emailResult: emailResult.data
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

// Implementación específica para creación de tareas
const assignTaskAction: ActionExecutor = async (action, payload) => {
    try {
        const taskData = action.parameters;
        
        // Validar parámetros requeridos
        if (!taskData.title) {
            return {
                success: false,
                message: "El título de la tarea es requerido",
                error: "Missing required parameter: title"
            };
        }

        // Calcular fecha de vencimiento si se especifica días
        let dueDate = null;
        if (taskData.due_in_days) {
            const days = parseInt(taskData.due_in_days.toString());
            if (!isNaN(days)) {
                dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + days);
            }
        } else if (taskData.due_date) {
            dueDate = new Date(taskData.due_date);
        }

        // Reemplazar variables en título y descripción
        let processedTitle = taskData.title;
        let processedDescription = taskData.description || `Tarea automática generada para ${payload.client.name}`;

        // Reemplazos básicos
        const replacements = {
            '{{client_name}}': payload.client.name,
            '{{client_company}}': payload.client.company || payload.client.name,
            '{{user_name}}': payload.user?.user_metadata?.full_name || 'Usuario',
            // Variables específicas de proyecto si están disponibles
            '{{project_name}}': (payload as any).project_name || '',
            '{{project_id}}': (payload as any).project_id || '',
            '{{end_date}}': (payload as any).end_date || '',
            '{{days_overdue}}': (payload as any).days_overdue || '',
            '{{project_status}}': (payload as any).project_status || '',
            '{{budget}}': (payload as any).budget || ''
        };

        // Aplicar todos los reemplazos
        for (const [placeholder, value] of Object.entries(replacements)) {
            processedTitle = processedTitle.replace(new RegExp(placeholder, 'g'), value);
            processedDescription = processedDescription.replace(new RegExp(placeholder, 'g'), value);
        }

        // Crear la tarea
        const taskInsert = {
            user_id: payload.user.id,
            // NO incluir client_id porque no existe en la tabla tasks
            project_id: taskData.project_id || (payload as any).project_id || null,
            title: processedTitle,
            description: processedDescription,
            status: taskData.status || 'pending',
            priority: taskData.priority || 'medium',
            category: taskData.category || 'general', // Agregar categoría por defecto
            due_date: dueDate?.toISOString() || null
        };

        console.log('🔍 DEBUG: Datos para insertar tarea:', taskInsert);

        const { data: taskCreated, error: taskError } = await payload.supabase
            .from('tasks')
            .insert([taskInsert]) // Usar array como en el ejemplo
            .select()
            .single();

        if (taskError) {
            console.error('Error creando tarea:', taskError);
            console.error('Código de error:', taskError.code);
            console.error('Mensaje de error:', taskError.message);
            console.error('Detalles del error:', taskError.details);
            console.error('Hint del error:', taskError.hint);
            console.error('Datos que se intentaron insertar:', taskInsert);
            
            return {
                success: false,
                message: `Error al crear la tarea: ${taskError.message || taskError.code || 'Error desconocido'}`,
                error: taskError.message || JSON.stringify(taskError)
            };
        }

        return {
            success: true,
            message: `Tarea "${processedTitle}" creada y asignada correctamente`,
            data: {
                taskId: taskCreated.id,
                title: taskCreated.title,
                description: taskCreated.description,
                dueDate: taskCreated.due_date,
                client: payload.client.name,
                priority: taskCreated.priority,
                status: taskCreated.status
            }
        };

    } catch (error) {
        console.error('Error en assignTaskAction:', error);
        return {
            success: false,
            message: "Error interno al crear tarea",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

// Implementación específica para actualización de estado de proyecto
const updateProjectStatusAction: ActionExecutor = async (action, payload) => {
    try {
        const projectData = action.parameters;
        
        if (!projectData.project_id) {
            return {
                success: false,
                message: "ID del proyecto es requerido",
                error: "Missing required parameter: project_id"
            };
        }

        const newStatus = projectData.status || 'updated';
        
        const { data: projectUpdated, error: projectError } = await payload.supabase
            .from('projects')
            .update({ 
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectData.project_id)
            .eq('user_id', payload.user.id) // Seguridad: solo proyectos del usuario
            .select()
            .single();

        if (projectError) {
            console.error('Error actualizando proyecto:', projectError);
            return {
                success: false,
                message: "Error al actualizar el proyecto",
                error: projectError.message
            };
        }

        return {
            success: true,
            message: `Proyecto actualizado a estado: ${newStatus}`,
            data: {
                projectId: projectUpdated.id,
                status: projectUpdated.status,
                name: projectUpdated.name
            }
        };

    } catch (error) {
        console.error('Error en updateProjectStatusAction:', error);
        return {
            success: false,
            message: "Error interno al actualizar proyecto",
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

// Implementación para acciones no implementadas aún
const notImplementedAction: ActionExecutor = async (action, payload) => {
    return {
        success: false,
        message: `Acción '${action.type}' no implementada aún`,
        error: "NOT_IMPLEMENTED"
    };
};

// =============================================================================
// REGISTRO DE EJECUTORES DE ACCIONES
// =============================================================================

const actionExecutors: Record<ActionType, ActionExecutor> = {
    send_email: sendEmailAction,
    assign_task: assignTaskAction,
    update_project_status: updateProjectStatusAction,
    create_invoice: notImplementedAction,
    create_calendar_event: notImplementedAction,
    send_whatsapp: notImplementedAction,
    generate_report: notImplementedAction,
    create_proposal: notImplementedAction,
};

// =============================================================================
// FUNCIÓN PRINCIPAL DE EJECUCIÓN
// =============================================================================

/**
 * Ejecuta una acción de automatización específica
 */
export async function executeAutomationAction(
    action: AutomationAction,
    payload: ActionPayload
): Promise<ActionResult> {
    try {
        // Validar que la acción existe
        if (!action || !action.type) {
            return {
                success: false,
                message: "Acción inválida",
                error: "INVALID_ACTION"
            };
        }

        // Obtener el ejecutor para este tipo de acción
        const executor = actionExecutors[action.type];
        if (!executor) {
            return {
                success: false,
                message: `Tipo de acción no reconocido: ${action.type}`,
                error: "UNKNOWN_ACTION_TYPE"
            };
        }

        // Log de inicio
        console.log(`🚀 Ejecutando acción: ${action.type}`, {
            executionId: payload.executionId,
            client: payload.client.name,
            automation: payload.automation.name
        });

        // Ejecutar la acción
        const result = await executor(action, payload);

        // Log del resultado
        if (result.success) {
            console.log(`✅ Acción completada: ${action.type}`, result);
        } else {
            console.error(`❌ Acción falló: ${action.type}`, result);
        }

        return result;

    } catch (error) {
        console.error('Error crítico ejecutando acción:', error);
        return {
            success: false,
            message: "Error crítico durante la ejecución",
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
