// Script para depurar el formulario de CompanyConfig
// Añade esto temporalmente al final de saveCompanyData para debug

console.log('=== DEBUG COMPANY CONFIG ===');
console.log('1. Datos del formulario:', companyData);
console.log('2. Validación del formulario:', validateForm());
console.log('3. Errores encontrados:', errors);
console.log('4. Cliente Supabase:', !!supabase);

// Verificar autenticación
const { data: authData, error: authError } = await supabase.auth.getUser();
console.log('5. Usuario autenticado:', authData.user?.id);
console.log('6. Error de auth:', authError);

if (authData.user) {
    console.log('7. Datos a guardar:', {
        user_id: authData.user.id,
        company_name: companyData.companyName,
        nif: companyData.nif.toUpperCase(),
        address: companyData.address,
        postal_code: companyData.postalCode,
        city: companyData.city,
        province: companyData.province,
        country: companyData.country,
        phone: companyData.phone || null,
        email: companyData.email || null,
        website: companyData.website || null,
        registration_number: companyData.registrationNumber || null,
        social_capital: companyData.socialCapital || null,
        updated_at: new Date().toISOString()
    });
}

console.log('=== FIN DEBUG ===');
