-- Crear tabla project_notes para notas de proyectos
CREATE TABLE IF NOT EXISTS project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_created_at ON project_notes(created_at);

-- RLS (Row Level Security) para project_notes
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver/editar notas de sus propios proyectos
CREATE POLICY project_notes_policy ON project_notes
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Comentario en la tabla
COMMENT ON TABLE project_notes IS 'Notas asociadas a proyectos';
COMMENT ON COLUMN project_notes.id IS 'Identificador único de la nota';
COMMENT ON COLUMN project_notes.project_id IS 'ID del proyecto al que pertenece la nota';
COMMENT ON COLUMN project_notes.content IS 'Contenido de la nota';
COMMENT ON COLUMN project_notes.created_at IS 'Fecha de creación de la nota';
COMMENT ON COLUMN project_notes.updated_at IS 'Fecha de última actualización de la nota';
