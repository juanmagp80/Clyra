# Instrucciones para configurar Google OAuth

## 1. Ve a Google Cloud Console
https://console.cloud.google.com/

## 2. Crea un nuevo proyecto (o selecciona uno existente)

## 3. Habilita las APIs necesarias:
- Ve a "APIs & Services" > "Library"
- Busca y habilita: "Google Calendar API"  
- Busca y habilita: "Google+ API"

## 4. Crear credenciales OAuth 2.0:
- Ve a "APIs & Services" > "Credentials"
- Clic en "+ CREATE CREDENTIALS" > "OAuth client ID"
- Tipo: "Web application"
- JavaScript origins: http://localhost:3000
- Redirect URIs: http://localhost:3000/api/auth/google/callback

## 5. Copia las credenciales generadas y reemplaza en .env.local:
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui

## 6. Reinicia el servidor de desarrollo:
npm run dev

## Nota: Para producción, agrega también tus URLs de producción en Google Cloud Console
