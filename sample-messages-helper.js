// Script para agregar mensajes de ejemplo para testing del análisis de conversación
// Ejecutar en la consola del navegador cuando estés en el dashboard

async function addSampleMessages(clientId) {
  if (!clientId) {
    console.error('❌ Debes proporcionar un clientId. Ejemplo: addSampleMessages("client-id-aqui")');
    return;
  }

  const messages = [
    {
      message: 'Hola, me gustaría solicitar información sobre sus servicios de desarrollo web.',
      sender_type: 'client',
      days_ago: 5
    },
    {
      message: '¡Hola! Gracias por contactarme. Estaré encantado de ayudarte con tu proyecto web. ¿Podrías contarme más detalles sobre lo que tienes en mente?',
      sender_type: 'freelancer',
      days_ago: 5
    },
    {
      message: 'Necesito una página web para mi negocio de consultoría. Algo profesional pero moderno. Mi presupuesto es de aproximadamente €3000.',
      sender_type: 'client',
      days_ago: 4
    },
    {
      message: 'Perfecto, eso está dentro de lo que puedo ofrecerte. Con €3000 podemos crear una web muy profesional. ¿Tienes algún diseño de referencia o colores corporativos específicos?',
      sender_type: 'freelancer',
      days_ago: 4
    },
    {
      message: 'Me gusta el estilo minimalista, colores azul y blanco principalmente. ¿Cuánto tiempo tomaría el proyecto?',
      sender_type: 'client',
      days_ago: 3
    },
    {
      message: 'Excelente elección de colores. Para un proyecto de esta envergadura, estimo entre 3-4 semanas. Te incluiría diseño responsive, optimización SEO básica y un panel de administración sencillo.',
      sender_type: 'freelancer',
      days_ago: 3
    },
    {
      message: 'Suena muy bien. ¿Podrías enviarme una propuesta formal con los detalles?',
      sender_type: 'client',
      days_ago: 2
    },
    {
      message: 'Por supuesto. Te enviaré la propuesta detallada esta tarde con todos los entregables, cronograma y términos de pago. ¿Hay algún deadline específico que deba considerar?',
      sender_type: 'freelancer',
      days_ago: 2
    },
    {
      message: 'Idealmente me gustaría tenerla lista para finales del próximo mes. ¿Es factible?',
      sender_type: 'client',
      days_ago: 1
    },
    {
      message: 'Sí, totalmente factible. Con 4 semanas tenemos tiempo suficiente para hacer un trabajo de calidad. Te envío la propuesta hoy y podemos empezar la próxima semana si te parece bien.',
      sender_type: 'freelancer',
      days_ago: 1
    }
  ];

  console.log('🚀 Agregando mensajes de ejemplo...');

  try {
    for (const msg of messages) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - msg.days_ago);

      const response = await fetch('/api/ai/add-sample-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: clientId,
          message: msg.message,
          senderType: msg.sender_type,
          createdAt: createdAt.toISOString()
        })
      });

      if (!response.ok) {
        console.error(`❌ Error agregando mensaje: ${msg.message.substring(0, 50)}...`);
      } else {
        console.log(`✅ Mensaje agregado: ${msg.message.substring(0, 50)}...`);
      }
    }

    console.log('🎉 ¡Mensajes de ejemplo agregados exitosamente!');
    console.log('📊 Ahora puedes usar el "Analizador de Conversaciones" con este cliente.');
    console.log('🔄 Recarga la página para ver los mensajes en el selector.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Función para obtener el ID del primer cliente
async function getFirstClientId() {
  try {
    const response = await fetch('/api/clients');
    const data = await response.json();
    
    if (data.length > 0) {
      console.log('📋 Clientes disponibles:');
      data.forEach((client, index) => {
        console.log(`${index + 1}. ${client.name} (ID: ${client.id})`);
      });
      return data[0].id;
    } else {
      console.log('❌ No hay clientes disponibles. Crea un cliente primero.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error);
    return null;
  }
}

// Función de ayuda
function help() {
  console.log(`
🧠 HELPER: Mensajes de Ejemplo para Análisis de Conversación

📋 Comandos disponibles:

1. Ver clientes:
   getFirstClientId()

2. Agregar mensajes de ejemplo:
   addSampleMessages("tu-client-id-aqui")

3. Agregar a primer cliente automáticamente:
   getFirstClientId().then(id => id && addSampleMessages(id))

✨ Los mensajes simulan una conversación real de consulta y negociación
   de un proyecto web, perfecta para probar el análisis de IA.
  `);
}

// Mostrar ayuda al cargar
console.log('🧠 Script de mensajes de ejemplo cargado. Ejecuta help() para ver comandos.');
