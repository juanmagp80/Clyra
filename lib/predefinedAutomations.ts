// lib/predefinedAutomations.ts

export interface PredefinedAutomation {
  name: string;
  description: string;
  trigger_type: string;
  is_public: boolean;
  // Puedes agregar más campos si tu tabla los requiere
}

export const predefinedAutomations: PredefinedAutomation[] = [
  {
    name: "Seguimiento de facturas",
    description: "Notifica cuando una factura está por vencer",
    trigger_type: "invoice_followup",
    is_public: false,
  },
  {
    name: "Onboarding de cliente",
    description: "Da la bienvenida a un nuevo cliente",
    trigger_type: "client_onboarding",
    is_public: false,
  },
  {
    name: "Hito de proyecto",
    description: "Notifica cuando se alcanza un hito del proyecto",
    trigger_type: "project_milestone",
    is_public: false,
  },
  {
    name: "Control de tiempo",
    description: "Alerta si no se registran horas en 3 días",
    trigger_type: "time_tracking",
    is_public: false,
  },
  {
    name: "Comunicación con cliente",
    description: "Notifica si no hay contacto en 7 días",
    trigger_type: "client_communication",
    is_public: false,
  },
];
