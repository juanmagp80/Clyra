// lib/automationActions.ts
import { PredefinedAutomation } from './predefinedAutomations';

// Simulación de envío de email (reemplaza por tu integración real)
async function sendEmail(to: string, subject: string, body: string) {
  // Aquí iría la integración real con tu proveedor de email
  console.log(`Enviando email a ${to}: ${subject} - ${body}`);
}

// 1. Seguimiento de facturas
export async function handleInvoiceFollowup(payload: any, user_id: string) {
  await sendEmail(
    payload.clientEmail,
    "Recordatorio de factura pendiente",
    `Hola ${payload.clientName}, tu factura ${payload.invoiceNumber} está por vencer.`
  );
}

// 2. Onboarding de cliente
export async function handleClientOnboarding(payload: any, user_id: string) {
  await sendEmail(
    payload.clientEmail,
    "¡Bienvenido a la plataforma!",
    `Hola ${payload.clientName}, gracias por confiar en nosotros.`
  );
}

// 3. Hito de proyecto
export async function handleProjectMilestone(payload: any, user_id: string) {
  await sendEmail(
    payload.clientEmail,
    "¡Hito de proyecto alcanzado!",
    `Hola ${payload.clientName}, hemos alcanzado el hito: ${payload.milestoneName}.`
  );
}

// 4. Control de tiempo
export async function handleTimeTracking(payload: any, user_id: string) {
  await sendEmail(
    payload.userEmail,
    "Recordatorio de registro de horas",
    `No has registrado horas en los últimos 3 días. ¡No olvides hacerlo!`
  );
}

// 5. Comunicación con cliente
export async function handleClientCommunication(payload: any, user_id: string) {
  await sendEmail(
    payload.clientEmail,
    "Seguimiento de comunicación",
    `Hace 7 días que no contactas a ${payload.clientName}. ¿Quieres enviarle un mensaje?`
  );
}

// Manejador central
export async function executeAutomationAction(trigger_type: string, payload: any, user_id: string) {
  switch (trigger_type) {
    case 'invoice_followup':
      await handleInvoiceFollowup(payload, user_id);
      break;
    case 'client_onboarding':
      await handleClientOnboarding(payload, user_id);
      break;
    case 'project_milestone':
      await handleProjectMilestone(payload, user_id);
      break;
    case 'time_tracking':
      await handleTimeTracking(payload, user_id);
      break;
    case 'client_communication':
      await handleClientCommunication(payload, user_id);
      break;
    default:
      break;
  }
}
