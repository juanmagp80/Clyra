// Test directo de la API de optimización de desarrollo
const testAPI = async () => {
  try {
    console.log('🔍 Probando API de optimización de desarrollo...');
    
    const response = await fetch('http://localhost:3000/api/ai/optimize-development', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Aquí necesitarías las cookies de autenticación reales
      },
    });

    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Respuesta de la API:');
    console.log('📊 Raw Data:', JSON.stringify(data.raw_data, null, 2));
    console.log('🧠 Analysis:', JSON.stringify(data.analysis, null, 2));
    
    // Verificar métricas específicas
    if (data.raw_data?.metrics) {
      console.log('\n🔢 MÉTRICAS DETALLADAS:');
      console.log('- Total horas:', data.raw_data.metrics.totalHours);
      console.log('- Horas facturables:', data.raw_data.metrics.billableHours);
      console.log('- Revenue total:', data.raw_data.metrics.totalRevenue);
      console.log('- Event revenue:', data.raw_data.metrics.eventRevenue);
      console.log('- Invoice revenue:', data.raw_data.metrics.invoiceRevenue);
      console.log('- Eventos encontrados:', data.raw_data.events);
      console.log('- Tareas encontradas:', data.raw_data.tasks);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
};

// Ejecutar el test
testAPI();
