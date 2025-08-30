'use client';

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
  route?: string; // Para redireccionar cuando hagan click
  action_data?: Record<string, any>; // Datos adicionales para la notificación
}

export function useNotifications(userEmail?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  // Cargar notificaciones
  const loadNotifications = async () => {
    if (!supabase || !userEmail) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar como leída
  const markAsRead = async (notificationId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    if (!supabase || !userEmail) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  // Crear nueva notificación (función helper)
  const createNotification = async (
    title: string, 
    message: string, 
    type: Notification['type'] = 'info',
    route?: string,
    actionData?: Record<string, any>
  ) => {
    if (!supabase || !userEmail) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          type,
          route,
          action_data: actionData,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error in createNotification:', error);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      // Actualizar estado local
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error in deleteNotification:', error);
    }
  };

  // Suscripción en tiempo real (opcional)
  useEffect(() => {
    if (!supabase || !userEmail) return;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('user_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const updatedNotification = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => 
                n.id === updatedNotification.id 
                  ? updatedNotification 
                  : n
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const deletedId = payload.old.id;
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
            if (!payload.old.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    setupRealtimeSubscription();
  }, [supabase, userEmail]);

  // Cargar notificaciones al inicializar
  useEffect(() => {
    loadNotifications();
  }, [userEmail]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    refetch: loadNotifications
  };
}
