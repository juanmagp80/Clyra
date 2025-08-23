'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Timer } from 'lucide-react';

// Componente de prueba simple para cronómetro
export default function SimpleTimerTest() {
    const [timers, setTimers] = useState<{[key: string]: {running: boolean, startTime: number, elapsed: number}}>({});
    
    const formatTime = (seconds: number) => {
        console.log(`🕐 formatTime recibió: ${seconds} segundos`);
        
        // Verificar si recibimos algo extraño
        if (isNaN(seconds) || seconds < 0) {
            console.log(`⚠️ Valor inválido para formatTime: ${seconds}`);
            return "0s";
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        console.log(`🕐 formatTime calculó: ${hours}h ${minutes}m ${secs}s`);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };
    
    const toggleTimer = (taskId: string) => {
        console.log(`🔧 toggleTimer llamado para ${taskId}`);
        
        setTimers(prev => {
            console.log(`📊 Estado anterior:`, prev[taskId]);
            
            const timer = prev[taskId] || { running: false, startTime: 0, elapsed: 0 };
            console.log(`📋 Timer actual:`, timer);
            
            if (timer.running) {
                // Parar
                const now = Date.now();
                console.log(`⏰ Timestamp actual: ${now}`);
                console.log(`⏰ Timestamp inicio: ${timer.startTime}`);
                console.log(`⏰ Diferencia en ms: ${now - timer.startTime}`);
                
                const sessionTime = Math.floor((now - timer.startTime) / 1000);
                console.log(`⏹️ Sesión calculada: ${sessionTime} segundos`);
                console.log(`📈 Tiempo previo: ${timer.elapsed} segundos`);
                console.log(`📊 Total nuevo: ${timer.elapsed + sessionTime} segundos`);
                
                const newState = {
                    running: false,
                    startTime: 0,
                    elapsed: timer.elapsed + sessionTime
                };
                console.log(`💾 Nuevo estado:`, newState);
                
                return {
                    ...prev,
                    [taskId]: newState
                };
            } else {
                // Iniciar
                const now = Date.now();
                console.log(`▶️ INICIANDO - Timestamp: ${now}`);
                console.log(`▶️ INICIANDO - Fecha: ${new Date(now).toISOString()}`);
                console.log(`▶️ INICIANDO - Elapsed previo: ${timer.elapsed}`);
                
                const newState = {
                    running: true,
                    startTime: now,
                    elapsed: timer.elapsed
                };
                console.log(`💾 Estado inicial:`, newState);
                
                return {
                    ...prev,
                    [taskId]: newState
                };
            }
        });
    };
    
    // Actualizar timers cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(taskId => {
                    if (updated[taskId].running) {
                        const now = Date.now();
                        const sessionTime = Math.floor((now - updated[taskId].startTime) / 1000);
                        // No modificamos el estado aquí, solo para mostrar el tiempo actual
                    }
                });
                return updated;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);
    
    const getCurrentTime = (taskId: string) => {
        const timer = timers[taskId];
        console.log(`⏱️ getCurrentTime para ${taskId}:`, timer);
        
        if (!timer) {
            console.log(`❌ No hay timer para ${taskId}`);
            return 0;
        }
        
        if (timer.running) {
            const now = Date.now();
            const sessionTime = Math.floor((now - timer.startTime) / 1000);
            const total = timer.elapsed + sessionTime;
            console.log(`🏃 Timer corriendo ${taskId}: elapsed=${timer.elapsed}, session=${sessionTime}, total=${total}`);
            return total;
        }
        
        console.log(`⏸️ Timer parado ${taskId}: elapsed=${timer.elapsed}`);
        return timer.elapsed;
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Simple de Cronómetros</h1>
            
            {['task1', 'task2', 'task3'].map(taskId => {
                const timer = timers[taskId];
                const isRunning = timer?.running || false;
                const currentTime = getCurrentTime(taskId);
                
                return (
                    <div key={taskId} className="bg-white border rounded-lg p-4 mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Tarea {taskId}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Timer className="w-4 h-4 text-blue-500" />
                                <span className={`text-sm ${isRunning ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                    {formatTime(currentTime)}
                                </span>
                                {isRunning && <span className="text-green-500 animate-pulse">●</span>}
                            </div>
                        </div>
                        
                        <button
                            onClick={() => toggleTimer(taskId)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                                isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                        >
                            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                    </div>
                );
            })}
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Estado de Timers:</h3>
                <pre className="text-xs">{JSON.stringify(timers, null, 2)}</pre>
            </div>
        </div>
    );
}
