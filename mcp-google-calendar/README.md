# MCP Google Calendar Server

Servidor MCP (Model Context Protocol) para integrar Google Calendar con Supabase y automatizar recordatorios de reuniones.

## Características

- 🔄 **Sincronización bidireccional** entre Google Calendar y Supabase
- 📧 **Recordatorios automáticos** por email (1h, 3h, 24h antes)
- 🤖 **Automatización con cron** para verificación continua
- 📊 **Dashboard de estadísticas** y monitoreo
- 🔐 **Autenticación OAuth** con Google Calendar API
- 📱 **Templates de email** personalizables

## Instalación

1. **Clonar el repositorio e instalar dependencias**:
```bash
cd mcp-google-calendar
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
- Google Calendar API (OAuth 2.0)
- Supabase (URL y Service Role Key)
- Configuración de email (SMTP)

3. **Configurar base de datos**:
```bash
# Ejecutar schema.sql en tu base de datos Supabase
psql -h db.xxx.supabase.co -U postgres -d postgres -f schema.sql
```

## Configuración de Google Calendar API

1. **Crear proyecto en Google Cloud Console**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crear nuevo proyecto o seleccionar existente
   - Habilitar Google Calendar API

2. **Configurar OAuth 2.0**:
   - Ir a "Credenciales" > "Crear credenciales" > "ID de cliente OAuth 2.0"
   - Tipo: Aplicación web
   - Origenes autorizados: `http://localhost:3000`
   - URIs de redirección: `http://localhost:3001/auth/callback`

3. **Copiar credenciales**:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

## Uso

### 1. Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

### 2. Métodos disponibles

#### Sincronizar calendario
```javascript
await server.syncCalendarEvents({
  userId: 'user_123',
  timeMin: '2024-01-01T00:00:00Z', // Opcional
  timeMax: '2024-12-31T23:59:59Z'  // Opcional
});
```

#### Crear evento
```javascript
await server.createCalendarEvent({
  userId: 'user_123',
  title: 'Reunión con cliente',
  startDateTime: '2024-08-16T10:00:00Z',
  endDateTime: '2024-08-16T11:00:00Z',
  description: 'Revisión del proyecto',
  clientId: 'client_456',
  location: 'Oficina principal'
});
```

#### Enviar recordatorio manual
```javascript
await server.sendMeetingReminder({
  eventId: 'event_789',
  reminderType: '1_hour' // '1_hour', '3_hours', '24_hours'
});
```

#### Obtener reuniones próximas
```javascript
await server.getUpcomingMeetings({
  userId: 'user_123', // Opcional
  hoursAhead: 3       // Default: 3 horas
});
```

#### Controlar automatización
```javascript
// Iniciar
await server.toggleAutomation(true);

// Detener
await server.toggleAutomation(false);

// Estado
await server.getAutomationStatus();
```

### 3. Automatización de recordatorios

La automatización se ejecuta cada 15 minutos (configurable) y:

1. Busca reuniones próximas (1-3 horas)
2. Verifica si ya se envió el recordatorio
3. Envía email al cliente si corresponde
4. Registra el envío en la base de datos

## Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Google Calendar│◄──►│   MCP Server    │◄──►│    Supabase     │
│      API        │    │                 │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │  Email Service  │
                       │   (SMTP/Gmail)  │
                       └─────────────────┘
```

### Componentes principales

- **GoogleCalendarService**: Interacción con Google Calendar API
- **SupabaseService**: Gestión de datos y sincronización
- **EmailService**: Envío de recordatorios por email
- **MeetingReminderAutomation**: Lógica de automatización y cron jobs

## Tipos de recordatorios

### 24 horas antes
- **Cuándo**: 23-25 horas antes de la reunión
- **Propósito**: Notificación inicial para preparación

### 3 horas antes
- **Cuándo**: 2.5-3.5 horas antes de la reunión
- **Propósito**: Recordatorio de confirmación

### 1 hora antes
- **Cuándo**: 0.5-1.5 horas antes de la reunión
- **Propósito**: Recordatorio final y preparación inmediata

## Personalización

### Templates de email
Los templates están en `src/services/EmailService.ts` y incluyen:
- HTML responsive
- Información completa de la reunión
- Branding personalizable
- Versión texto plano

### Horarios de recordatorio
Configurables en `src/automations/MeetingReminderAutomation.ts`:
```javascript
// Ejemplo: modificar ventanas de tiempo
if (hoursUntilMeeting <= 1.2 && hoursUntilMeeting > 0.8) {
  reminderType = '1_hour';
}
```

## Monitoreo y logs

### Logs del sistema
```bash
# Ver logs en tiempo real
npm run dev

# Logs incluyen:
# ✅ Recordatorios enviados exitosamente
# ❌ Errores de envío o configuración  
# 📊 Estadísticas de sincronización
# 🔍 Debug de automatización
```

### Base de datos
Tabla `meeting_reminders` contiene:
- Historial completo de recordatorios
- Estados de éxito/error
- Métricas de rendimiento

## Solución de problemas

### Error de autenticación con Google
1. Verificar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
2. Confirmar URI de redirección en Google Cloud Console
3. Verificar que Google Calendar API esté habilitada

### Emails no se envían
1. Verificar credenciales SMTP en `.env`
2. Para Gmail: usar contraseña de aplicación (no contraseña normal)
3. Verificar firewall/puertos (587, 465)

### Eventos no se sincronizan
1. Verificar permisos de OAuth (scope de calendario)
2. Confirmar tokens de acceso válidos
3. Revisar logs de `GoogleCalendarService`

### Recordatorios no se envían automáticamente
1. Verificar que la automatización esté activa: `getAutomationStatus()`
2. Confirmar eventos tienen `type='meeting'` y `status='scheduled'`
3. Verificar clientes tienen email válido
4. Revisar tabla `meeting_reminders` para duplicados

## Desarrollo

### Estructura del proyecto
```
src/
├── index.ts                      # Servidor principal
├── config/
│   └── index.ts                 # Configuración general
├── services/
│   ├── GoogleCalendarService.ts # API Google Calendar
│   ├── SupabaseService.ts       # Base de datos
│   └── EmailService.ts          # Envío de emails
├── automations/
│   └── MeetingReminderAutomation.ts # Lógica de recordatorios
└── types/
    └── index.ts                 # Tipos TypeScript
```

### Comandos de desarrollo
```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar tests
npm test

# Linter
npm run lint
```

## Contribución

1. Fork del proyecto
2. Crear rama para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia

MIT License - ver archivo LICENSE para detalles.

## Soporte

- 📧 Email: soporte@clyra.com
- 📝 Issues: GitHub Issues
- 📖 Docs: [Documentación completa](https://docs.clyra.com)
