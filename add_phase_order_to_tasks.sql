-- Agregar columna phase_order a la tabla tasks para organizar tareas por fases
ALTER TABLE tasks 
ADD COLUMN phase_order INTEGER DEFAULT NULL;

-- Agregar comentario para documentar la columna
COMMENT ON COLUMN tasks.phase_order IS 'Orden de la fase a la que pertenece la tarea (1, 2, 3, etc)';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'phase_order';
