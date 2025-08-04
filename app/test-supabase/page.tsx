'use client';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState('Checking...');
  
  // Crear instancia del cliente de Supabase
  const supabase = createSupabaseClient();

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 Testing Supabase connection...');
        
        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Supabase connection error:', error);
          setStatus(`Error: ${error.message}`);
        } else {
          console.log('✅ Supabase connected successfully');
          setStatus('Connected successfully');
        }
      } catch (err) {
        console.error('💥 Exception testing Supabase:', err);
        setStatus(`Exception: ${err}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Supabase Connection Test</h2>
      <p>Status: {status}</p>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p>Key Length: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length}</p>
    </div>
  );
}
