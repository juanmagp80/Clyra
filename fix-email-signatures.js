const fs = require('fs');

// Leer el archivo
const filePath = '/home/juanma/Documentos/Clyra/app/api/contracts/send-email/route.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Reemplazos de firmas
const replacements = [
    {
        from: `EL PRESTADOR                    EL CLIENTE
\${companyName}                  \${clientName}`,
        to: `EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
\${companyName}                    \${clientName}
DNI: \${dniProvider}               DNI/CIF: \${dniClient}`
    },
    {
        from: `EL CONSULTOR                    EL CLIENTE
\${companyName}                  \${clientName}`,
        to: `EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
\${companyName}                    \${clientName}
DNI: \${dniProvider}               DNI/CIF: \${dniClient}`
    },
    {
        from: `EL DISEÑADOR                    EL CLIENTE
\${companyName}                  \${clientName}`,
        to: `EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
\${companyName}                    \${clientName}
DNI: \${dniProvider}               DNI/CIF: \${dniClient}`
    },
    {
        from: `EL CREADOR                      EL CLIENTE
\${companyName}                  \${clientName}`,
        to: `EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
\${companyName}                    \${clientName}
DNI: \${dniProvider}               DNI/CIF: \${dniClient}`
    }
];

// Aplicar reemplazos
replacements.forEach(replacement => {
    const regex = new RegExp(replacement.from.replace(/\$/g, '\\$').replace(/\{/g, '\\{').replace(/\}/g, '\\}'), 'g');
    content = content.replace(regex, replacement.to);
});

// Escribir el archivo actualizado
fs.writeFileSync(filePath, content);
console.log('✅ Todas las firmas del archivo send-email han sido actualizadas');