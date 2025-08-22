// Script temporal para forzar el estado de suscripción del usuario
// Ejecutar desde la consola del navegador cuando esté logueado como amazonjgp80@gmail.com

async function forceUpdateSubscriptionStatus() {
    console.log('🔄 Forzando actualización del estado de suscripción...');
    
    try {
        // Simular que el usuario tiene una suscripción activa
        const updatedTrialInfo = {
            hasActiveSubscription: true,
            status: 'active',
            plan: 'pro',
            daysRemaining: null,
            isExpired: false,
            trialEndsAt: null,
            canUseFeatures: true,
            usage: {
                clients: 0,
                projects: 0,
                storage: 0,
                emails: 0
            },
            limits: {
                maxClients: -1,
                maxProjects: -1,
                maxStorageGB: -1
            }
        };
        
        // Guardar en localStorage como respaldo
        localStorage.setItem('forceActiveSubscription', 'true');
        localStorage.setItem('trialInfo', JSON.stringify(updatedTrialInfo));
        
        console.log('✅ Estado de suscripción forzado a activo');
        console.log('🔄 Recarga la página para ver los cambios');
        
        // Recargar la página automáticamente
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error forzando estado:', error);
    }
}

// Ejecutar la función
forceUpdateSubscriptionStatus();
