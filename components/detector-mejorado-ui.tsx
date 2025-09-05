'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Mail, 
  CheckCircle, 
  Clock, 
  User, 
  CreditCard, 
  FileText,
  Zap,
  BarChart3,
  Play,
  Pause,
  Settings,
  Sparkles
} from 'lucide-react';

interface DetectedEvent {
  type: string;
  clientName?: string;
  projectName?: string;
  amount?: number;
  description?: string;
  timestamp?: string;
}

interface DetectorUIProps {
  userId: string;
  userEmail?: string;
}

export default function DetectorMejoradoUI({ userId, userEmail }: DetectorUIProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [periodHours, setPeriodHours] = useState('24');
  const [detectedEvents, setDetectedEvents] = useState<DetectedEvent[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<any[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const eventTypeConfig = {
    'contract_signed': {
      icon: <FileText className="h-4 w-4" />,
      label: 'Contrato Firmado',
      color: 'bg-green-100 text-green-800',
      description: 'Genera email de bienvenida y confirmación del proyecto'
    },
    'payment_received': {
      icon: <CreditCard className="h-4 w-4" />,
      label: 'Pago Recibido',
      color: 'bg-blue-100 text-blue-800',
      description: 'Envía confirmación de pago y próximos pasos'
    },
    'project_completed': {
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Proyecto Terminado',
      color: 'bg-purple-100 text-purple-800',
      description: 'Email de entrega final y solicitud de feedback'
    },
    'client_registered': {
      icon: <User className="h-4 w-4" />,
      label: 'Cliente Nuevo',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Onboarding automático y proceso de bienvenida'
    }
  };

  const detectEvents = async () => {
    setIsDetecting(true);
    try {
      const response = await fetch(`/api/ai/workflows/auto?userId=${userId}&hours=${periodHours}`);
      const data = await response.json();
      
      if (data.success) {
        setDetectedEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error detecting events:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const processEvents = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/workflows/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoDetect: true,
          userId: userId,
          hours: parseInt(periodHours)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedEmails(data.generatedEmails || []);
        // Actualizar eventos detectados
        await detectEvents();
      }
    } catch (error) {
      console.error('Error processing events:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAutoMode = async () => {
    setIsAutoMode(!isAutoMode);
    // Aquí podrías configurar un webhook o cron job
    if (!isAutoMode) {
      // Activar modo automático
      await processEvents();
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel de Control Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-xl">Detector Automático de Eventos</CardTitle>
            </div>
            <Badge variant={isAutoMode ? "default" : "secondary"}>
              {isAutoMode ? "Automático 24/7" : "Manual"}
            </Badge>
          </div>
          <CardDescription>
            Sistema inteligente que detecta eventos en tu base de datos y genera emails contextuales automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuración */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Período de detección:</label>
              <select 
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={periodHours} 
                onChange={(e) => setPeriodHours(e.target.value)}
              >
                <option value="1">Última hora</option>
                <option value="6">Últimas 6 horas</option>
                <option value="24">Últimas 24 horas</option>
                <option value="168">Última semana</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={detectEvents}
                disabled={isDetecting}
              >
                <Search className="h-4 w-4 mr-2" />
                {isDetecting ? 'Detectando...' : 'Detectar Eventos'}
              </Button>
              
              <Button 
                onClick={processEvents}
                disabled={isProcessing || detectedEvents.length === 0}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isProcessing ? 'Procesando...' : 'Generar Emails'}
              </Button>
            </div>
          </div>

          {/* Modo Automático */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Modo Automático 24/7</h4>
                <p className="text-sm text-gray-600">
                  Detecta y procesa eventos automáticamente cada hora
                </p>
              </div>
            </div>
            <Button 
              variant={isAutoMode ? "destructive" : "default"}
              onClick={toggleAutoMode}
            >
              {isAutoMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isAutoMode ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Eventos Detectados */}
      {detectedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Eventos Detectados ({detectedEvents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detectedEvents.map((event, index) => {
                const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig];
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${config?.color || 'bg-gray-100'}`}>
                        {config?.icon || <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{config?.label || event.type}</h4>
                        <p className="text-sm text-gray-600">
                          {event.clientName && `Cliente: ${event.clientName}`}
                          {event.projectName && ` • Proyecto: ${event.projectName}`}
                          {event.amount && ` • €${event.amount.toLocaleString()}`}
                        </p>
                        <p className="text-xs text-gray-500">{config?.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {new Date(event.timestamp || Date.now()).toLocaleDateString()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emails Generados */}
      {generatedEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Emails Generados ({generatedEmails.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedEmails.map((email, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{email.subject}</h4>
                    <Badge variant="outline">
                      {new Date(email.created_at).toLocaleString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Para: {email.client_name || 'Cliente'} • Tipo: {email.event_type}
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {email.content.substring(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guía Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>¿Qué hace cada tipo de evento?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${config.color}`}>
                  {config.icon}
                </div>
                <div>
                  <h4 className="font-medium">{config.label}</h4>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
