-- Agregar columna sent_at a la tabla contracts
ALTER TABLE contracts 
ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;