#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Archivos a procesar
const filesToProcess = [
  'app/dashboard/calendar/CalendarPageClient.tsx',
  'app/dashboard/projects/ProjectsPageClient.tsx',
  'app/demo/projects/[id]/page.tsx',
  'app/demo/invoices/[id]/page.tsx',
  'app/test-subscription/page.tsx',
  'app/admin/meeting-reminder/page.tsx',
  'app/dashboard/clients/ClientsPageClient-bonsai.tsx',
  'app/dashboard/projects/ProjectsPageBonsai.tsx',
  'app/dashboard/projects/[id]/ProjectDetailsBonsai.tsx',
  'app/dashboard/tasks/TasksPageClient-clean.tsx',
  'app/dashboard/tasks/TasksPageClient.tsx',
  'app/dashboard/tasks/TasksPageClient-bonsai.tsx',
  'app/dashboard/clients/ClientsPageClient.tsx',
  'app/dashboard/reports/ReportsPageClient.tsx',
  'app/dashboard/reports/ReportsPageClientSimple.tsx',
  'app/dashboard/reports/ReportsPageClientSimplified.tsx',
  'app/dashboard/tasks/TasksPageClientPublic.tsx',
  'app/dashboard/upgrade/UpgradePageClient.tsx',
  'app/dashboard/proposals/ProposalsPageClient.tsx'
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Archivo no encontrado: ${filePath}`);
    return;
  }

  console.log(`Procesando: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Agregar import si no existe
  if (!content.includes("import { showToast } from '@/utils/toast';")) {
    // Buscar el último import para agregar el nuevo import
    const importRegex = /^import.*from.*[;']$/gm;
    const imports = content.match(importRegex);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      content = content.replace(lastImport, lastImport + "\nimport { showToast } from '@/utils/toast';");
      modified = true;
    }
  }

  // Reemplazar alert() simples con showToast
  const alertPatterns = [
    // alert('texto' + variable)
    { 
      pattern: /alert\('([^']+)'\s*\+\s*([^)]+)\)/g, 
      replacement: "showToast.error('$1' + $2)" 
    },
    // alert('texto')
    { 
      pattern: /alert\('([^']+)'\)/g, 
      replacement: "showToast.error('$1')" 
    },
    // alert("texto")
    { 
      pattern: /alert\("([^"]+)"\)/g, 
      replacement: 'showToast.error("$1")' 
    },
    // alert(`texto`)
    { 
      pattern: /alert\(`([^`]+)`\)/g, 
      replacement: "showToast.error(`$1`)" 
    }
  ];

  // Aplicar patrones de alert
  alertPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Convertir alerts específicos por contexto
  const specificReplacements = [
    // Mensajes de éxito
    {
      pattern: /showToast\.error\('([^']*exitosa?mente?[^']*)'\)/g,
      replacement: "showToast.success('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*creado[^']*)'\)/g,
      replacement: "showToast.success('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*actualizado[^']*)'\)/g,
      replacement: "showToast.success('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*eliminado[^']*)'\)/g,
      replacement: "showToast.success('$1')"
    },
    // Mensajes informativos o de demostración
    {
      pattern: /showToast\.error\('([^']*Demo[^']*)'\)/g,
      replacement: "showToast.success('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*IA recomienda[^']*)'\)/g,
      replacement: "showToast.success('$1')"
    },
    // Mensajes de validación (warnings)
    {
      pattern: /showToast\.error\('([^']*Por favor[^']*)'\)/g,
      replacement: "showToast.warning('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*obligatorios?[^']*)'\)/g,
      replacement: "showToast.warning('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*completar?[^']*)'\)/g,
      replacement: "showToast.warning('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*límite[^']*)'\)/g,
      replacement: "showToast.warning('$1')"
    },
    {
      pattern: /showToast\.error\('([^']*expirado[^']*)'\)/g,
      replacement: "showToast.warning('$1')"
    }
  ];

  // Aplicar reemplazos específicos
  specificReplacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Reemplazar confirm() con showToast.confirm() y hacer async
  const confirmPatterns = [
    // if (!confirm('texto')) return;
    {
      pattern: /if\s*\(\s*!confirm\('([^']+)'\)\s*\)\s*return;/g,
      replacement: "const confirmed = await showToast.confirm('$1');\n        if (!confirmed) return;"
    },
    // confirm('texto')
    {
      pattern: /confirm\('([^']+)'\)/g,
      replacement: "await showToast.confirm('$1')"
    }
  ];

  // Aplicar patrones de confirm
  confirmPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Guardar archivo si fue modificado
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Modificado: ${filePath}`);
  } else {
    console.log(`⏭️  Sin cambios: ${filePath}`);
  }
}

// Procesar todos los archivos
filesToProcess.forEach(processFile);

console.log('\n🎉 Conversión completada!');
console.log('\n📝 Recuerda:');
console.log('- Revisar los archivos modificados');
console.log('- Agregar async/await donde sea necesario');
console.log('- Ajustar los tipos de toast (success/error/warning) según el contexto');
