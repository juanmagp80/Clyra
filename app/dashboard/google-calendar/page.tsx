'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { googleCalendarMCP } from '@/src/lib/google-calendar-mcp-client';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Settings, 
  PlayCircle, 
  StopCircle, 
  RefreshCcw,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  client?: {
    name: string;
    email: string;
  };
  status: string;
}

interface AutomationStats {
  date: string;
  sent: number;
  errors: number;
  total: number;
}

export default function GoogleCalendarIntegrationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    loadUpcomingMeetings();
    loadAutomationStats();
    checkGoogleConnection();
    
    // Verificar mensajes de URL (success/error de OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'connected') {
      showMessage('success', '¡Google Calendar conectado exitosamente!');
      setGoogleConnected(true);
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (error) {
      const errorMessages: { [key: string]: string } = {
        oauth_error: 'Error en la autenticación con Google',
        no_code: 'No se recibió código de autorización',
        invalid_state: 'Estado de OAuth inválido',
        callback_failed: 'Error en el callback de Google'
      };
      showMessage('error', errorMessages[error] || 'Error conectando con Google Calendar');
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const response = await fetch('/api/google-calendar/status');
      if (response.ok) {
        const data = await response.json();
        setGoogleConnected(data.connected);
      }
    } catch (error) {
      console.error('Error verificando conexión Google:', error);
      setGoogleConnected(false);
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const checkConnection = async () => {
    try {
      const connected = await googleCalendarMCP.checkConnection();
      setIsConnected(connected);
    } catch (error) {
      console.error('Error verificando conexión:', error);
      setIsConnected(false);
    }
  };

  const loadUpcomingMeetings = async () => {
    try {
      const result = await googleCalendarMCP.getUpcomingMeetings(undefined, 25);
      if (result.success) {
        setUpcomingMeetings(result.data.meetings);
      }
    } catch (error) {
      console.error('Error cargando reuniones:', error);
    }
  };

  const loadAutomationStats = async () => {
    try {
      const result = await googleCalendarMCP.getAutomationStats();
      if (result.success) {
        setAutomationStats(result.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSyncCalendar = async () => {
    setIsLoading(true);
    try {
      const result = await googleCalendarMCP.syncUserCalendar('current-user');
      if (result.success) {
        showMessage('success', result.message || 'Calendario sincronizado');
        await loadUpcomingMeetings();
      } else {
        showMessage('error', result.error || 'Error sincronizando calendario');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado');
    }
    setIsLoading(false);
  };

  const handleStartAutomation = async () => {
    setIsLoading(true);
    try {
      const result = await googleCalendarMCP.startAutomation();
      if (result.success) {
        showMessage('success', 'Automatización iniciada exitosamente');
      } else {
        showMessage('error', result.error || 'Error iniciando automatización');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado');
    }
    setIsLoading(false);
  };

  const handleStopAutomation = async () => {
    setIsLoading(true);
    try {
      const result = await googleCalendarMCP.stopAutomation();
      if (result.success) {
        showMessage('success', 'Automatización detenida');
      } else {
        showMessage('error', result.error || 'Error deteniendo automatización');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado');
    }
    setIsLoading(false);
  };

  const handleRunManualCheck = async () => {
    setIsLoading(true);
    try {
      const result = await googleCalendarMCP.runReminderCheck();
      if (result.success) {
        showMessage('success', result.message || 'Verificación completada');
        await loadAutomationStats();
      } else {
        showMessage('error', result.error || 'Error en verificación');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado');
    }
    setIsLoading(false);
  };

  const handleSendReminder = async (eventId: string, reminderType: '1_hour' | '3_hours' | '24_hours') => {
    setIsLoading(true);
    try {
      const result = await googleCalendarMCP.sendMeetingReminder(eventId, reminderType);
      if (result.success) {
        showMessage('success', result.message || 'Recordatorio enviado');
      } else {
        showMessage('error', result.error || 'Error enviando recordatorio');
      }
    } catch (error) {
      showMessage('error', 'Error inesperado');
    }
    setIsLoading(false);
  };

  const getTimeUntilMeeting = (startTime: string) => {
    const now = new Date();
    const meeting = new Date(startTime);
    const hoursUntil = (meeting.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 1) {
      const minutesUntil = Math.round(hoursUntil * 60);
      return `${minutesUntil} min`;
    }
    return `${hoursUntil.toFixed(1)}h`;
  };

  const getReminderBadgeColor = (startTime: string) => {
    const now = new Date();
    const meeting = new Date(startTime);
    const hoursUntil = (meeting.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil <= 1.5 && hoursUntil > 0.5) return 'destructive';
    if (hoursUntil <= 3.5 && hoursUntil > 2.5) return 'default';
    if (hoursUntil <= 25 && hoursUntil > 23) return 'secondary';
    return 'outline';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Calendar</h1>
          <p className="text-muted-foreground">
            Integración con Google Calendar y automatización de recordatorios
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                MCP Conectado
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                MCP Desconectado
              </>
            )}
          </Badge>

          <Badge variant={googleConnected ? 'default' : 'secondary'}>
            {googleConnected ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Google Conectado
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                Google Pendiente
              </>
            )}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isLoading}
          >
            <RefreshCcw className="w-4 h-4 mr-1" />
            Verificar
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="meetings">Reuniones</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Reuniones Hoy
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {upcomingMeetings.filter(m => {
                    const today = new Date().toDateString();
                    return new Date(m.start_time).toDateString() === today;
                  }).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Próximas 3h
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {upcomingMeetings.filter(m => {
                    const now = new Date();
                    const meeting = new Date(m.start_time);
                    const hoursUntil = (meeting.getTime() - now.getTime()) / (1000 * 60 * 60);
                    return hoursUntil > 0 && hoursUntil <= 3;
                  }).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recordatorios Hoy
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {automationStats?.sent || 0}
                </div>
                {automationStats?.errors ? (
                  <p className="text-xs text-red-500">
                    {automationStats.errors} errores
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estado Sistema
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Activo
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Controla la sincronización y automatización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleSyncCalendar}
                  disabled={isLoading || !googleConnected}
                  className="w-full"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Sincronizar Calendario
                </Button>

                {!googleConnected && (
                  <Button 
                    onClick={handleConnectGoogle}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Conectar Google Calendar
                  </Button>
                )}
                
                <Button 
                  onClick={handleRunManualCheck}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Verificar Recordatorios
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración Rápida</CardTitle>
                <CardDescription>
                  Enlaces a configuración externa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Google Cloud Console
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Supabase Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reuniones Próximas</CardTitle>
              <CardDescription>
                Reuniones en las próximas 25 horas que pueden necesitar recordatorios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay reuniones próximas</p>
                    <p className="text-sm">
                      Crea reuniones en el calendario para que aparezcan aquí
                    </p>
                  </div>
                ) : (
                  upcomingMeetings.map((meeting) => (
                    <div 
                      key={meeting.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{meeting.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>
                            📅 {new Date(meeting.start_time).toLocaleString('es-ES')}
                          </span>
                          <span>
                            ⏰ En {getTimeUntilMeeting(meeting.start_time)}
                          </span>
                          {meeting.client && (
                            <span>
                              👤 {meeting.client.name} ({meeting.client.email})
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={getReminderBadgeColor(meeting.start_time)}>
                          {(() => {
                            const now = new Date();
                            const meetingTime = new Date(meeting.start_time);
                            const hoursUntil = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                            
                            if (hoursUntil <= 1.5 && hoursUntil > 0.5) return '1h';
                            if (hoursUntil <= 3.5 && hoursUntil > 2.5) return '3h';
                            if (hoursUntil <= 25 && hoursUntil > 23) return '24h';
                            return 'Fuera de ventana';
                          })()}
                        </Badge>
                        
                        {meeting.client?.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const now = new Date();
                              const meetingTime = new Date(meeting.start_time);
                              const hoursUntil = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                              
                              let reminderType: '1_hour' | '3_hours' | '24_hours' = '1_hour';
                              if (hoursUntil <= 3.5 && hoursUntil > 2.5) reminderType = '3_hours';
                              if (hoursUntil <= 25 && hoursUntil > 23) reminderType = '24_hours';
                              
                              handleSendReminder(meeting.id, reminderType);
                            }}
                            disabled={isLoading}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control de Automatización</CardTitle>
              <CardDescription>
                Gestionar el sistema automático de recordatorios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button 
                  onClick={handleStartAutomation}
                  disabled={isLoading}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Iniciar Automatización
                </Button>
                
                <Button 
                  onClick={handleStopAutomation}
                  disabled={isLoading}
                  variant="outline"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Detener
                </Button>
              </div>

              {automationStats && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Estadísticas de Hoy</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {automationStats.sent}
                      </div>
                      <div className="text-muted-foreground">Enviados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {automationStats.errors}
                      </div>
                      <div className="text-muted-foreground">Errores</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {automationStats.total}
                      </div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>
                Estado de la configuración y enlaces de ayuda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  La configuración se gestiona principalmente a través de variables de entorno 
                  en el servidor MCP. Consulta el README.md del proyecto para más detalles.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Estado de Conexiones</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Google Calendar API</span>
                      <Badge variant={isConnected ? 'default' : 'destructive'}>
                        {isConnected ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Supabase Database</span>
                      <Badge variant="default">Conectado</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Email Service</span>
                      <Badge variant={isConnected ? 'default' : 'secondary'}>
                        {isConnected ? 'Configurado' : 'Por configurar'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Documentación</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Guía de Configuración
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Solución de Problemas
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
