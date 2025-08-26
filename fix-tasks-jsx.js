// Script para arreglar la sintaxis JSX del archivo TasksPageClient.tsx

const fs = require('fs');
const path = require('path');

const filePath = './app/dashboard/tasks/TasksPageClient.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Buscar la línea problemática y corregir la estructura
const lines = content.split('\n');

// Encontrar la línea donde empieza el problema (alrededor de la línea 775)
let startIdx = lines.findIndex(line => line.includes('Lista de tareas Premium'));
let endIdx = lines.findIndex((line, idx) => idx > startIdx && line.includes('Modales Premium'));

console.log('Start index:', startIdx);
console.log('End index:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
    // Crear nueva estructura simplificada
    const newSection = `                    {/* Lista de tareas Premium */}
                    <div className="space-y-6">
                        {filteredTasks.length === 0 ? (
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-400/10 to-blue-500/10 rounded-2xl blur-xl"></div>
                                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-16 border border-white/40 shadow-2xl text-center">
                                    <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl inline-block mb-6">
                                        <Tag className="h-20 w-20 text-slate-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-700 mb-4">No hay tareas</h3>
                                    <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                                        {tasks.length === 0
                                            ? "Aún no has creado ninguna tarea. ¡Comienza creando tu primera tarea!"
                                            : "No hay tareas que coincidan con los filtros actuales."
                                        }
                                    </p>
                                    {tasks.length === 0 && (
                                        <Button
                                            onClick={() => setShowNewTaskModal(true)}
                                            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
                                        >
                                            <Plus className="mr-2 h-5 w-5" />
                                            Crear primera tarea
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <div key={task.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{task.title}</h3>
                                            {task.description && (
                                                <p className="text-slate-600 mb-3">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span>{task.status}</span>
                                                <span>{task.priority}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline">
                                                ⚙️
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Modales Premium */}`;

    // Reemplazar la sección problemática
    const newLines = [
        ...lines.slice(0, startIdx),
        ...newSection.split('\n'),
        ...lines.slice(endIdx)
    ];

    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent);
    console.log('Archivo corregido exitosamente');
} else {
    console.log('No se pudieron encontrar las líneas de referencia');
}
