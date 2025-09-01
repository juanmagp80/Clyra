'use client';

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useEffect, useState } from 'react';

interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    is_read: boolean;
    action_url?: string;
    created_at: string;
    action_data?: any;
    route?: string;
}

export function useNotifications(userEmail?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        try {
            const supabase = createSupabaseClient();
            
            console.log('🔔 Loading notifications for user email:', userEmail);
            
            // Primero obtenemos el user_id del usuario autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                console.error('❌ Error getting authenticated user:', userError);
                setLoading(false);
                return;
            }
            
            console.log('� User ID found:', user.id);
            
            // Ahora cargamos las notificaciones usando user_id
            const { data, error } = await supabase
                .from('user_notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('❌ Error loading notifications:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                return;
            }

            console.log('✅ Notifications loaded:', data?.length || 0);
            console.log('📋 Sample notification:', data?.[0]);
            setNotifications(data || []);
            setUnreadCount((data || []).filter((n: any) => !n.is_read).length);
        } catch (error) {
            console.error('❌ Exception loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const supabase = createSupabaseClient();
            
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
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!userEmail) return;

        try {
            const supabase = createSupabaseClient();
            
            // Primero obtenemos el user_id del usuario autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                console.error('❌ Error getting authenticated user:', userError);
                return;
            }
            
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
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const supabase = createSupabaseClient();
            
            const { error } = await supabase
                .from('user_notifications')
                .delete()
                .eq('id', notificationId);

            if (error) {
                console.error('Error deleting notification:', error);
                return;
            }

            // Actualizar estado local
            const notificationToDelete = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            
            if (notificationToDelete && !notificationToDelete.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    useEffect(() => {
        loadNotifications();
        
        // Configurar polling cada 30 segundos
        const interval = setInterval(loadNotifications, 30000);
        
        return () => clearInterval(interval);
    }, [userEmail]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: loadNotifications
    };
}
