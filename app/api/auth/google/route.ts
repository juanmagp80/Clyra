import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  try {
    // Configurar los scopes necesarios para Google Calendar
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    // Generar URL de autorización
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: 'clyra-google-calendar'
    });

    console.log('🔗 Redirigiendo a Google OAuth:', authUrl);

    // Redirigir al usuario a Google
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error en autenticación Google:', error);
    return NextResponse.json(
      { error: 'Error iniciando autenticación con Google' },
      { status: 500 }
    );
  }
}
