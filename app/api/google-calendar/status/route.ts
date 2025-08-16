import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Por ahora, verificamos si hay tokens de Google Calendar en la base de datos
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .select('id, email, expires_at')
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (error) {
      console.error('❌ Error verificando tokens Google:', error);
      return NextResponse.json({ connected: false, error: error.message });
    }

    const connected = data && data.length > 0;
    
    return NextResponse.json({ 
      connected,
      tokenCount: data?.length || 0,
      lastConnection: data?.[0]?.email || null
    });

  } catch (error) {
    console.error('❌ Error en verificación de estado:', error);
    return NextResponse.json({ connected: false, error: 'Error interno' });
  }
}
