const fs = require('fs');
const path = require('path');

// Añadir el import y el componente ThemeToggleHeader a páginas específicas
const pagesWithoutToggle = [
    'app/dashboard/invoices/InvoicesPageClient.tsx',
    'app/dashboard/projects/ProjectsPageClient.tsx',
    'app/dashboard/time-tracking/TimeTrackingClient.tsx'
];

pagesWithoutToggle.forEach(pagePath => {
    const fullPath = path.join(__dirname, pagePath);

    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Verificar si ya tiene el import
        if (!content.includes('ThemeToggleHeader')) {
            console.log(`Adding ThemeToggleHeader to ${pagePath}`);

            // Añadir import cerca del top
            if (content.includes('import Sidebar')) {
                content = content.replace(
                    'import Sidebar from \'@/components/Sidebar\';',
                    'import Sidebar from \'@/components/Sidebar\';\nimport ThemeToggleHeader from \'@/components/ThemeToggleHeader\';'
                );
            }

            // Buscar patrones donde añadir el botón
            const patterns = [
                // Patrón común: botón de nueva acción
                /(<div className="flex items-center gap-\d+">\s*<button[\s\S]*?<\/button>\s*<\/div>)/,
                // Patrón de header
                /(<div className="flex items-center justify-between[\s\S]*?<\/div>)/
            ];

            patterns.forEach(pattern => {
                content = content.replace(pattern, (match) => {
                    if (match.includes('ThemeToggleHeader')) return match;

                    // Insertar ThemeToggleHeader antes del botón final
                    return match.replace(
                        /<\/div>$/,
                        '<ThemeToggleHeader />\n                                    </div>'
                    );
                });
            });

            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Updated ${pagePath}`);
        } else {
            console.log(`ℹ️  ${pagePath} already has ThemeToggleHeader`);
        }
    } else {
        console.log(`❌ File not found: ${pagePath}`);
    }
});

console.log('✨ Theme toggle addition complete!');
