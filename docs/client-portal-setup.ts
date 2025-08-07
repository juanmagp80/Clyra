/* 
 * INSTRUCCIONES PARA CONFIGURAR EL PORTAL DE CLIENTE
 * ================================================
 * 
 * Si estás viendo errores en el portal de cliente, es probable que necesites
 * configurar la variable de entorno SUPABASE_SERVICE_ROLE_KEY.
 * 
 * PASOS PARA CONFIGURACIÓN:
 * 
 * 1. Ir a tu proyecto en Supabase (https://supabase.com/dashboard)
 * 
 * 2. En la sección "Settings" > "API", encontrarás dos claves:
 *    - anon/public key (ya la tienes como NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *    - service_role key (la necesitas como SUPABASE_SERVICE_ROLE_KEY)
 * 
 * 3. Copia la "service_role key" y agrégala a tu archivo .env.local:
 * 
 *    SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
 * 
 * 4. Asegúrate de que has ejecutado la migración de comunicación con clientes:
 *    - Ve a Supabase > SQL Editor
 *    - Ejecuta el contenido del archivo: /database/client_communication_migration.sql
 * 
 * 5. Reinicia tu servidor de desarrollo:
 *    npm run dev
 * 
 * IMPORTANTE:
 * - La service_role key tiene permisos administrativos completos
 * - NUNCA la expongas en el código del frontend
 * - Solo úsala en APIs del servidor (como estamos haciendo)
 * - Agrégala a .env.local (no a .env que puede ser público)
 * 
 * Con estas configuraciones, el portal del cliente debería funcionar correctamente.
 */

// Este archivo es solo para documentación
export {};
