// Script para probar el endpoint de debug
async function testUserLookup() {
    const testEmails = [
        'juangpdev@gmail.com',
        'juanmagp26@gmail.com',
        'amazonjgp80@gmail.com',
        'refugestion@gmail.com'
    ];

    console.log('🔍 PROBANDO ENDPOINT DE DEBUG');
    console.log('=============================');

    for (const email of testEmails) {
        console.log(`\n🔸 Probando: ${email}`);
        
        try {
            const response = await fetch('http://localhost:3000/api/debug/user-lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail: email })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Response exitosa:');
                console.log('  - SQL Function:', result.sqlFunction.result || 'ERROR: ' + result.sqlFunction.error);
                console.log('  - Direct Lookup:', result.directLookup.result?.length > 0 ? 'FOUND' : 'NOT FOUND');
                if (result.directLookup.error) {
                    console.log('  - Direct Error:', result.directLookup.error);
                }
            } else {
                console.log('❌ Error en response:', result.error);
            }
        } catch (error) {
            console.log('❌ Error de conexión:', error.message);
        }
    }
}

// Ejecutar si el servidor está corriendo
testUserLookup();
