import { NextRequest, NextResponse } from 'next/server';
import { runBudgetMonitoring } from '@/src/lib/budget-monitoring';

// API endpoint para ejecutar el monitoreo de presupuestos
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Iniciando monitoreo de presupuestos...');
    
    // TODO: Añadir autenticación/autorización aquí
    // const authHeader = request.headers.get('authorization');
    
    const result = await runBudgetMonitoring();
    
    if (result.success) {
      console.log('✅ API: Monitoreo completado exitosamente');
      return NextResponse.json({
        success: true,
        message: result.message,
        alertsSent: result.alertsSent,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ API: Error en monitoreo:', result.message);
      return NextResponse.json({
        success: false,
        message: result.message,
        error: 'Monitoreo falló'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ API: Error crítico en monitoreo:', error);
    return NextResponse.json({
      success: false,
      message: 'Error crítico en monitoreo de presupuestos',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// GET para verificar el estado del sistema
export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Budget Monitoring',
    status: 'active',
    description: 'Sistema de monitoreo automático de presupuestos excedidos',
    usage: 'POST para ejecutar monitoreo manual',
    timestamp: new Date().toISOString()
  });
}
