// Script para actualizar automatizaciones predefinidas
// Ejecutar en la consola del navegador (F12)

async function updateAutomations() {
    console.log('🔄 Actualizando automatizaciones predefinidas...');

    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('❌ No hay usuario autenticado');
        return;
    }

    console.log('👤 Usuario:', user.id);

    try {
        // Eliminar automatizaciones predefinidas existentes
        console.log('🗑️ Eliminando automatizaciones predefinidas existentes...');
        const { error: deleteError } = await supabase
            .from('automations')
            .delete()
            .eq('user_id', user.id)
            .eq('is_public', true);

        if (deleteError) {
            console.error('❌ Error eliminando:', deleteError);
            return;
        }

        console.log('✅ Automatizaciones predefinidas eliminadas');
        console.log('🔄 Las nuevas automatizaciones se cargarán automáticamente al refrescar la página');

        // Refrescar automáticamente después de 2 segundos
        setTimeout(() => {
            console.log('🔄 Refrescando página...');
            window.location.reload();
        }, 2000);

        return '✅ Proceso completado. Refrescando página...';

    } catch (error) {
        console.error('❌ Error:', error);
        return 'Error ejecutando el proceso';
    }
}

// Ejecutar la función
updateAutomations();
