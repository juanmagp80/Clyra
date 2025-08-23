-- Agregar columna template_data a la tabla projects
ALTER TABLE projects 
ADD COLUMN template_data JSONB DEFAULT NULL;

-- Agregar comentario para documentar la columna
COMMENT ON COLUMN projects.template_data IS 'Datos del template usado para crear el proyecto (fases, entregables, pricing)';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'template_data';
