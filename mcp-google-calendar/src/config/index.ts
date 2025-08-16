import dotenv from 'dotenv';

dotenv.config();

export const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
  server: {
    port: parseInt(process.env.MCP_SERVER_PORT || '3001'),
    host: process.env.MCP_SERVER_HOST || 'localhost',
  },
  automation: {
    cronPattern: process.env.MEETING_REMINDER_CRON || '*/15 * * * *',
    timezone: process.env.DEFAULT_TIMEZONE || 'America/Argentina/Buenos_Aires',
  },
  debug: process.env.DEBUG === 'true',
};

// Validar configuración requerida
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida no encontrada: ${envVar}`);
  }
}
