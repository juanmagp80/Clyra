// Test directo del endpoint de validación
const fetch = require('node-fetch');

async function testValidationEndpoint() {
    try {
        const token = 'jKe1b9c5sXh5R4TnYlocyxs7SWD4TBtc';
        
        console.log('🔍 Testing validation endpoint...');
        console.log('Token:', token);
        
        const response = await fetch('http://localhost:3000/api/client-portal/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        const text = await response.text();
        console.log('Response body:', text);
        
        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Response is not JSON');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testValidationEndpoint();
