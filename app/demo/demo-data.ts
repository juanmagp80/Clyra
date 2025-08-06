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

// Datos demo para el calendario
export const demoCalendarEvents = [
  {
    id: 'demo-event-1',
    title: 'Reunión inicial - TechStart',
    description: 'Definir scope y timeline del proyecto de landing page',
    start_time: '2024-12-27T10:00:00',
    end_time: '2024-12-27T11:30:00',
    type: 'client_call',
    status: 'scheduled',
    is_billable: true,
    hourly_rate: 75,
    location: '',
    meeting_url: 'https://meet.google.com/abc-defg-hij',
    client_id: 'demo-1',
    project_id: 'demo-proj-1',
    user_id: 'demo-user',
    created_at: '2024-12-25T09:00:00'
  },
  {
    id: 'demo-event-2',
    title: 'Diseño de wireframes',
    description: 'Crear wireframes detallados para la nueva landing page',
    start_time: '2024-12-27T14:00:00',
    end_time: '2024-12-27T17:00:00',
    type: 'work',
    status: 'in_progress',
    is_billable: true,
    hourly_rate: 65,
    location: 'Oficina casa',
    meeting_url: '',
    client_id: 'demo-1',
    project_id: 'demo-proj-1',
    user_id: 'demo-user',
    created_at: '2024-12-25T09:15:00'
  },
  {
    id: 'demo-event-3',
    title: 'Descanso y café ☕',
    description: 'Tiempo de descanso para mantener la productividad',
    start_time: '2024-12-27T12:00:00',
    end_time: '2024-12-27T12:15:00',
    type: 'break',
    status: 'completed',
    is_billable: false,
    hourly_rate: 0,
    location: '',
    meeting_url: '',
    client_id: '',
    project_id: '',
    user_id: 'demo-user',
    created_at: '2024-12-25T09:30:00'
  },
  {
    id: 'demo-event-4',
    title: 'Review menú digital - Restaurante Oliva',
    description: 'Presentación del primer prototipo del menú digital',
    start_time: '2024-12-28T11:00:00',
    end_time: '2024-12-28T12:00:00',
    type: 'meeting',
    status: 'scheduled',
    is_billable: true,
    hourly_rate: 70,
    location: 'Restaurante Oliva',
    meeting_url: '',
    client_id: 'demo-2',
    project_id: 'demo-proj-3',
    user_id: 'demo-user',
    created_at: '2024-12-25T10:00:00'
  },
  {
    id: 'demo-event-5',
    title: 'Desarrollo frontend',
    description: 'Implementación de componentes React para la landing',
    start_time: '2024-12-28T09:00:00',
    end_time: '2024-12-28T13:00:00',
    type: 'work',
    status: 'scheduled',
    is_billable: true,
    hourly_rate: 65,
    location: 'Oficina casa',
    meeting_url: '',
    client_id: 'demo-1',
    project_id: 'demo-proj-1',
    user_id: 'demo-user',
    created_at: '2024-12-25T10:15:00'
  },
  {
    id: 'demo-event-6',
    title: 'Planificación semanal',
    description: 'Revisar objetivos y planificar tareas de la próxima semana',
    start_time: '2024-12-29T09:00:00',
    end_time: '2024-12-29T10:00:00',
    type: 'admin',
    status: 'scheduled',
    is_billable: false,
    hourly_rate: 0,
    location: '',
    meeting_url: '',
    client_id: '',
    project_id: '',
    user_id: 'demo-user',
    created_at: '2024-12-25T10:30:00'
  }
];

// Datos demo para tareas
export const demoTasks = [
  {
    id: 'demo-task-1',
    title: 'Completar wireframes de landing page',
    description: 'Finalizar los wireframes detallados para todas las secciones de la landing page de TechStart',
    status: 'in_progress',
    priority: 'high',
    due_date: '2024-12-27',
    completed_at: null,
    project_id: 'demo-proj-1',
    client_id: 'demo-1',
    estimated_hours: 6,
    actual_hours: 3.5,
    is_billable: true,
    tags: ['diseño', 'wireframes', 'landing'],
    user_id: 'demo-user',
    created_at: '2024-12-25T08:00:00'
  },
  {
    id: 'demo-task-2',
    title: 'Revisar feedback del cliente',
    description: 'Analizar los comentarios recibidos sobre el prototipo inicial del menú digital',
    status: 'pending',
    priority: 'medium',
    due_date: '2024-12-28',
    completed_at: null,
    project_id: 'demo-proj-3',
    client_id: 'demo-2',
    estimated_hours: 2,
    actual_hours: 0,
    is_billable: true,
    tags: ['review', 'feedback', 'menú'],
    user_id: 'demo-user',
    created_at: '2024-12-25T08:15:00'
  },
  {
    id: 'demo-task-3',
    title: 'Enviar propuesta para app móvil',
    description: 'Preparar y enviar la propuesta técnica y económica para la app de FitnessCenter Pro',
    status: 'completed',
    priority: 'high',
    due_date: '2024-12-26',
    completed_at: '2024-12-26T16:30:00',
    project_id: 'demo-proj-4',
    client_id: 'demo-3',
    estimated_hours: 4,
    actual_hours: 3.8,
    is_billable: false,
    tags: ['propuesta', 'app', 'fitness'],
    user_id: 'demo-user',
    created_at: '2024-12-24T09:00:00'
  },
  {
    id: 'demo-task-4',
    title: 'Implementar sistema de autenticación',
    description: 'Desarrollar el login y registro para la landing page con integración de redes sociales',
    status: 'pending',
    priority: 'medium',
    due_date: '2024-12-30',
    completed_at: null,
    project_id: 'demo-proj-1',
    client_id: 'demo-1',
    estimated_hours: 8,
    actual_hours: 0,
    is_billable: true,
    tags: ['desarrollo', 'auth', 'frontend'],
    user_id: 'demo-user',
    created_at: '2024-12-25T08:30:00'
  },
  {
    id: 'demo-task-5',
    title: 'Optimizar imágenes y assets',
    description: 'Comprimir y optimizar todas las imágenes para mejorar el rendimiento web',
    status: 'pending',
    priority: 'low',
    due_date: '2024-12-31',
    completed_at: null,
    project_id: 'demo-proj-1',
    client_id: 'demo-1',
    estimated_hours: 3,
    actual_hours: 0,
    is_billable: true,
    tags: ['optimización', 'imágenes', 'performance'],
    user_id: 'demo-user',
    created_at: '2024-12-25T08:45:00'
  },
  {
    id: 'demo-task-6',
    title: 'Configurar Google Analytics',
    description: 'Instalar y configurar tracking de GA4 para el nuevo sitio web',
    status: 'pending',
    priority: 'medium',
    due_date: '2024-12-29',
    completed_at: null,
    project_id: 'demo-proj-1',
    client_id: 'demo-1',
    estimated_hours: 2,
    actual_hours: 0,
    is_billable: true,
    tags: ['analytics', 'tracking', 'seo'],
    user_id: 'demo-user',
    created_at: '2024-12-25T09:00:00'
  },
  {
    id: 'demo-task-7',
    title: 'Diseñar iconografía personalizada',
    description: 'Crear iconos únicos para el menú digital que reflejen la identidad del restaurante',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2024-12-28',
    completed_at: null,
    project_id: 'demo-proj-3',
    client_id: 'demo-2',
    estimated_hours: 5,
    actual_hours: 2.2,
    is_billable: true,
    tags: ['diseño', 'iconos', 'identidad'],
    user_id: 'demo-user',
    created_at: '2024-12-25T09:15:00'
  }
];

// Extender las estadísticas demo
export const demoCalendarStats = {
  eventsToday: demoCalendarEvents.filter(e => 
    new Date(e.start_time).toDateString() === new Date().toDateString()
  ).length,
  eventsThisWeek: demoCalendarEvents.length,
  hoursScheduledToday: demoCalendarEvents
    .filter(e => new Date(e.start_time).toDateString() === new Date().toDateString())
    .reduce((sum, e) => {
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0),
  revenueToday: demoCalendarEvents
    .filter(e => new Date(e.start_time).toDateString() === new Date().toDateString() && e.is_billable)
    .reduce((sum, e) => {
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      return sum + (duration * e.hourly_rate);
    }, 0),
  productivityScore: 78,
  eventsInProgress: demoCalendarEvents.filter(e => e.status === 'in_progress').length
};

export const demoTaskStats = {
  totalTasks: demoTasks.length,
  completedTasks: demoTasks.filter(t => t.status === 'completed').length,
  inProgressTasks: demoTasks.filter(t => t.status === 'in_progress').length,
  pendingTasks: demoTasks.filter(t => t.status === 'pending').length,
  overdueTasks: demoTasks.filter(t => 
    t.status !== 'completed' && new Date(t.due_date) < new Date()
  ).length,
  totalEstimatedHours: demoTasks.reduce((sum, t) => sum + t.estimated_hours, 0),
  totalActualHours: demoTasks.reduce((sum, t) => sum + t.actual_hours, 0),
  completionRate: Math.round((demoTasks.filter(t => t.status === 'completed').length / demoTasks.length) * 100),
  averageTaskDuration: demoTasks.reduce((sum, t) => sum + t.estimated_hours, 0) / demoTasks.length
};
