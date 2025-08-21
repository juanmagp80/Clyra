-- MIGRACIÓN PARA CALENDARIO CON DATOS REALES
-- Ejecutar este script en Supabase SQL Editor para crear las tablas necesarias

-- ==================== CREAR TABLAS SI NO EXISTEN ====================

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    budget DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de eventos del calendario (versión simplificada)
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Información básica
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    -- Tipo de evento
    type VARCHAR(30) CHECK (type IN (
        'meeting', 'work', 'break', 'admin', 'focus', 'client_call', 
        'project_review', 'invoice_prep', 'proposal_work'
    )) NOT NULL DEFAULT 'work',
    
    -- Estado del evento
    status VARCHAR(20) CHECK (status IN (
        'scheduled', 'in_progress', 'completed', 'cancelled'
    )) DEFAULT 'scheduled',
    
    -- Integración CRM
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Facturación
    is_billable BOOLEAN DEFAULT false,
    hourly_rate DECIMAL(10,2),
    
    -- Ubicación y enlaces
    location VARCHAR(255),
    meeting_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ÍNDICES PARA PERFORMANCE ====================

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Índices para calendar_events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_project_id ON calendar_events(project_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_billable ON calendar_events(is_billable);

-- ==================== RLS (ROW LEVEL SECURITY) ====================

-- Habilitar RLS en todas las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas para clients
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para calendar_events
DROP POLICY IF EXISTS "Users can view their own events" ON calendar_events;
CREATE POLICY "Users can view their own events" ON calendar_events
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own events" ON calendar_events;
CREATE POLICY "Users can insert their own events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own events" ON calendar_events;
CREATE POLICY "Users can update their own events" ON calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own events" ON calendar_events;
CREATE POLICY "Users can delete their own events" ON calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- ==================== TRIGGERS PARA UPDATED_AT ====================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at 
    BEFORE UPDATE ON calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== COMENTARIOS ====================

COMMENT ON TABLE clients IS 'Tabla de clientes del CRM para cada usuario';
COMMENT ON TABLE projects IS 'Tabla de proyectos asociados a clientes';
COMMENT ON TABLE calendar_events IS 'Eventos del calendario con integración CRM y facturación';

-- ==================== FINALIZADO ====================

-- Mensaje de confirmación
SELECT 'Migración de calendario completada exitosamente! 🎉' as resultado;
