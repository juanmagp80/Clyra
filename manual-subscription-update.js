const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function manualSubscriptionUpdate() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    console.log('🔍 Verificando si existe alguna tabla de suscripciones...');
    
    // Intentar obtener información del usuario actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('❌ No hay sesión activa. Inicia sesión primero.');
      return;
    }
    
    console.log('✅ Usuario encontrado:', session.user.email);
    
    // Verificar si existe user_subscriptions
    let { data: subs, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (subsError) {
      console.log('❌ Error accediendo a user_subscriptions:', subsError.message);
      
      // Intentar con profiles en su lugar
      console.log('🔄 Intentando actualizar en la tabla profiles...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          plan_type: 'pro'
        })
        .eq('id', session.user.id)
        .select();
      
      if (profileError) {
        console.log('❌ Error actualizando profiles:', profileError.message);
      } else {
        console.log('✅ Suscripción actualizada en profiles:', profileData);
      }
      
      return;
    }
    
    if (subs && subs.length > 0) {
      console.log('✅ Registro encontrado en user_subscriptions');
      
      // Actualizar suscripción
      const { data: updated, error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          is_subscribed: true,
          plan_type: 'pro',
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
        })
        .eq('user_id', session.user.id)
        .select();
      
      if (updateError) {
        console.log('❌ Error actualizando:', updateError.message);
      } else {
        console.log('✅ Suscripción actualizada correctamente:', updated);
      }
    } else {
      console.log('📝 Creando nuevo registro de suscripción...');
      
      const { data: newSub, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: session.user.id,
          is_subscribed: true,
          plan_type: 'pro',
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select();
      
      if (insertError) {
        console.log('❌ Error creando registro:', insertError.message);
      } else {
        console.log('✅ Nuevo registro creado:', newSub);
      }
    }
    
    console.log('🎉 Proceso completado. Recarga la página para ver los cambios.');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

manualSubscriptionUpdate();
