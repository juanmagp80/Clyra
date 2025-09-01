-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'warning', 'error', 'info')),
    is_read BOOLEAN DEFAULT FALSE,
    route TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Los usuarios pueden actualizar sus propias notificaciones (marcar como leídas)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Los usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Solo el sistema puede insertar notificaciones (o usuarios autenticados)
CREATE POLICY "Authenticated users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insertar algunas notificaciones de ejemplo (opcional)
-- INSERT INTO notifications (user_email, title, message, type, route) VALUES
-- ('tu-email@example.com', 'Bienvenido a Taskelio', 'Gracias por registrarte en nuestra plataforma', 'success', '/dashboard'),
-- ('tu-email@example.com', 'Configura tu perfil', 'Completa la información de tu empresa para comenzar', 'info', '/dashboard/settings/company'),
-- ('tu-email@example.com', 'Nuevo cliente agregado', 'Se ha agregado un nuevo cliente a tu lista', 'success', '/dashboard/clients');
