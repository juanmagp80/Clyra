-- Consulta para ver si un usuario tiene registros de time_entries
-- Reemplaza 'USER_ID_AQUI' por el id real del usuario nuevo

SELECT *
FROM time_entries
WHERE user_id = 'USER_ID_AQUI'
ORDER BY start_time DESC;

-- Si no devuelve filas, el usuario realmente no tiene registros de tiempo.