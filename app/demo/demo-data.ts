// Datos de demo realistas para el tour interactivo

export const demoUser = {
  name: 'Ana García',
  email: 'ana@freelancer.demo',
  company: 'Ana García Diseño'
};

export const demoClients = [
  {
    id: 'demo-1',
    name: 'TechStart Solutions',
    email: 'contacto@techstart.com',
    phone: '+34 912 345 678',
    company: 'TechStart Solutions',
    created_at: '2024-12-01',
    projects_count: 3,
    total_revenue: 15420
  },
  {
    id: 'demo-2',
    name: 'María López',
    email: 'maria@restauranteoliva.com',
    phone: '+34 654 321 987',
    company: 'Restaurante Oliva',
    created_at: '2024-11-15',
    projects_count: 2,
    total_revenue: 8500
  },
  {
    id: 'demo-3',
    name: 'Carlos Martín',
    email: 'carlos@fitnesscenter.com',
    phone: '+34 698 147 258',
    company: 'FitnessCenter Pro',
    created_at: '2024-10-20',
    projects_count: 4,
    total_revenue: 22300
  },
  {
    id: 'demo-4',
    name: 'Laura Sánchez',
    email: 'laura@boutiquemoda.com',
    phone: '+34 612 789 456',
    company: 'Boutique Moda',
    created_at: '2024-09-10',
    projects_count: 1,
    total_revenue: 4200
  }
];

export const demoProjects = [
  {
    id: 'demo-proj-1',
    client_id: 'demo-1',
    title: 'Rediseño de Landing Page',
    description: 'Modernización completa de la página principal con enfoque en conversión',
    status: 'in_progress',
    priority: 'high',
    budget: 5500,
    start_date: '2024-12-01',
    end_date: '2025-01-15',
    progress: 65,
    created_at: '2024-12-01'
  },
  {
    id: 'demo-proj-2',
    client_id: 'demo-1',
    title: 'Identidad Corporativa',
    description: 'Desarrollo de logo, paleta de colores y manual de marca',
    status: 'completed',
    priority: 'medium',
    budget: 3200,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    progress: 100,
    created_at: '2024-11-01'
  },
  {
    id: 'demo-proj-3',
    client_id: 'demo-2',
    title: 'Menú Digital Interactivo',
    description: 'Diseño de menú digital con códigos QR para mesas',
    status: 'in_progress',
    priority: 'high',
    budget: 2800,
    start_date: '2024-12-10',
    end_date: '2024-12-28',
    progress: 40,
    created_at: '2024-12-10'
  },
  {
    id: 'demo-proj-4',
    client_id: 'demo-3',
    title: 'App Móvil de Entrenamientos',
    description: 'Aplicación móvil para seguimiento de rutinas y progreso',
    status: 'planning',
    priority: 'high',
    budget: 12500,
    start_date: '2025-01-05',
    end_date: '2025-03-30',
    progress: 10,
    created_at: '2024-12-15'
  },
  {
    id: 'demo-proj-5',
    client_id: 'demo-4',
    title: 'E-commerce de Moda',
    description: 'Tienda online con catálogo de productos y pasarela de pago',
    status: 'completed',
    priority: 'medium',
    budget: 4200,
    start_date: '2024-09-10',
    end_date: '2024-10-25',
    progress: 100,
    created_at: '2024-09-10'
  }
];

export const demoInvoices = [
  {
    id: 'demo-inv-1',
    client_id: 'demo-1',
    project_id: 'demo-proj-2',
    title: 'Identidad Corporativa - TechStart',
    amount: 2688,
    tax_rate: 21,
    tax_amount: 564.48,
    total_amount: 3252.48,
    status: 'paid',
    issue_date: '2024-11-30',
    due_date: '2024-12-30',
    paid_date: '2024-12-05',
    created_at: '2024-11-30'
  },
  {
    id: 'demo-inv-2',
    client_id: 'demo-1',
    project_id: 'demo-proj-1',
    title: 'Rediseño Landing - Pago 1 de 2',
    amount: 2750,
    tax_rate: 21,
    tax_amount: 577.5,
    total_amount: 3327.5,
    status: 'paid',
    issue_date: '2024-12-15',
    due_date: '2025-01-15',
    paid_date: '2024-12-20',
    created_at: '2024-12-15'
  },
  {
    id: 'demo-inv-3',
    client_id: 'demo-2',
    project_id: 'demo-proj-3',
    title: 'Menú Digital - Anticipo',
    amount: 1400,
    tax_rate: 21,
    tax_amount: 294,
    total_amount: 1694,
    status: 'sent',
    issue_date: '2024-12-20',
    due_date: '2025-01-20',
    created_at: '2024-12-20'
  },
  {
    id: 'demo-inv-4',
    client_id: 'demo-4',
    project_id: 'demo-proj-5',
    title: 'E-commerce Boutique Moda',
    amount: 3471.07,
    tax_rate: 21,
    tax_amount: 728.93,
    total_amount: 4200,
    status: 'paid',
    issue_date: '2024-10-25',
    due_date: '2024-11-25',
    paid_date: '2024-11-10',
    created_at: '2024-10-25'
  },
  {
    id: 'demo-inv-5',
    client_id: 'demo-3',
    project_id: 'demo-proj-4',
    title: 'App Móvil FitnessCenter - Fase 1',
    amount: 4958.68,
    tax_rate: 21,
    tax_amount: 1041.32,
    total_amount: 6000,
    status: 'paid',
    issue_date: '2024-11-01',
    due_date: '2024-12-01',
    paid_date: '2024-11-28',
    created_at: '2024-11-01'
  },
  {
    id: 'demo-inv-6',
    client_id: 'demo-2',
    project_id: 'demo-proj-3',
    title: 'Menú Digital - Pago Final',
    amount: 2479.34,
    tax_rate: 21,
    tax_amount: 520.66,
    total_amount: 3000,
    status: 'draft',
    issue_date: '2024-12-25',
    due_date: '2025-01-25',
    created_at: '2024-12-25'
  },
  {
    id: 'demo-inv-7',
    client_id: 'demo-3',
    project_id: 'demo-proj-6',
    title: 'Sistema de Reservas - Desarrollo',
    amount: 7438.02,
    tax_rate: 21,
    tax_amount: 1561.98,
    total_amount: 9000,
    status: 'sent',
    issue_date: '2024-12-10',
    due_date: '2025-01-10',
    created_at: '2024-12-10'
  },
  {
    id: 'demo-inv-8',
    client_id: 'demo-1',
    project_id: 'demo-proj-1',
    title: 'Rediseño Landing - Pago Final',
    amount: 2750,
    tax_rate: 21,
    tax_amount: 577.5,
    total_amount: 3327.5,
    status: 'draft',
    issue_date: '2024-12-25',
    due_date: '2025-01-25',
    created_at: '2024-12-25'
  }
];

export const demoTimeEntries = [
  {
    id: 'demo-time-1',
    project_id: 'demo-proj-1',
    description: 'Análisis de la landing actual y wireframes',
    hours: 4.5,
    date: '2024-12-18',
    created_at: '2024-12-18'
  },
  {
    id: 'demo-time-2',
    project_id: 'demo-proj-1',
    description: 'Diseño de mockups para la nueva landing',
    hours: 6,
    date: '2024-12-17',
    created_at: '2024-12-17'
  },
  {
    id: 'demo-time-3',
    project_id: 'demo-proj-3',
    description: 'Reunión con cliente y definición de requisitos',
    hours: 2,
    date: '2024-12-16',
    created_at: '2024-12-16'
  },
  {
    id: 'demo-time-4',
    project_id: 'demo-proj-1',
    description: 'Desarrollo frontend de componentes',
    hours: 8,
    date: '2024-12-15',
    created_at: '2024-12-15'
  }
];

export const demoStats = {
  totalClients: demoClients.length,
  activeProjects: demoProjects.filter(p => p.status === 'in_progress').length,
  totalRevenue: demoInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
  hoursThisMonth: demoTimeEntries.reduce((sum, entry) => sum + entry.hours, 0),
  pendingInvoices: demoInvoices.filter(inv => inv.status === 'sent').length,
  overdueInvoices: 0,
  completedProjects: demoProjects.filter(p => p.status === 'completed').length,
  averageProjectValue: demoProjects.reduce((sum, p) => sum + p.budget, 0) / demoProjects.length
};
