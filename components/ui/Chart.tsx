'use client';

import { useEffect, useRef, useState } from 'react';

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: any;
  options?: any;
  className?: string;
}

export function Chart({ type, data, options = {}, className = "" }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Por ahora, usar un fallback simple
    setIsLoading(false);
    setError('Chart.js no está disponible - usando fallback simple');
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-gray-600 text-sm">Gráfico no disponible</p>
          <p className="text-xs text-gray-400 mt-1">Usando datos: {JSON.stringify(data).slice(0, 50)}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ maxHeight: '400px' }}
      />
    </div>
  );
}

// Componente para gráficos simples sin Chart.js como fallback
export function SimpleBarChart({ data, className = "" }: { data: number[], className?: string }) {
  const maxValue = Math.max(...data);
  
  return (
    <div className={`flex items-end justify-between space-x-2 p-4 ${className}`}>
      {data.map((value, index) => {
        const height = (value / maxValue) * 100;
        return (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-8 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all duration-500 hover:from-indigo-600 hover:to-indigo-500"
              style={{ height: `${height}px`, minHeight: '4px' }}
            />
            <span className="text-xs text-gray-600 mt-1">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
