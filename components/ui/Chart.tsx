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
  const chartRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Importación dinámica para evitar problemas de SSR
        const { Chart as ChartJS, registerables } = await import('chart.js');
        
        if (!isMounted) return;

        // Registrar todos los componentes necesarios
        ChartJS.register(...registerables);

        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            // Destruir chart anterior si existe
            if (chartRef.current) {
              chartRef.current.destroy();
            }

            // Configurar opciones por defecto
            const defaultOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
              ...options
            };

            // Crear nuevo chart
            chartRef.current = new ChartJS(ctx, {
              type,
              data,
              options: defaultOptions
            });
          }
        }
      } catch (err) {
        console.error('Error initializing chart:', err);
        if (isMounted) {
          setError('Error al cargar el gráfico');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initChart();

    return () => {
      isMounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-sm font-medium">Error al cargar gráfico</div>
          <div className="text-xs">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <div className="text-sm">Cargando gráfico...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
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
