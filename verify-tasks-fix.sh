echo "🔍 Verificando corrección del problema en la página de tareas..."
echo ""

echo "📋 Verificando que tasks/page.tsx pasa userEmail:"
grep -n "userEmail" /home/juan/Documentos/clyra/app/dashboard/tasks/page.tsx

echo ""
echo "📋 Verificando que TasksPageClient usa el hook correctamente:"
grep -n "useTrialStatus" /home/juan/Documentos/clyra/app/dashboard/tasks/TasksPageClient.tsx

echo ""
echo "📋 Verificando que TrialBanner recibe userEmail:"
grep -n "TrialBanner.*userEmail" /home/juan/Documentos/clyra/app/dashboard/tasks/TasksPageClient.tsx

echo ""
echo "🎯 Estado esperado:"
echo "==================="
echo "✅ tasks/page.tsx debe pasar userEmail a TasksPageClient"
echo "✅ TasksPageClient debe usar useTrialStatus(userEmail)"
echo "✅ TrialBanner debe recibir userEmail como prop"
echo "✅ Con usuario PRO activo, el banner NO debe aparecer"

echo ""
echo "💡 Si el banner sigue apareciendo:"
echo "=================================="
echo "1. Hacer hard refresh (Ctrl+Shift+R)"
echo "2. Logout y login de nuevo"
echo "3. Limpiar cache del navegador"
echo "4. Verificar consola del navegador para errores"
