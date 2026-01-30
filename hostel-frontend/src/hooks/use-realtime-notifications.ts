'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { toast } from 'sonner';

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    const handleNotification = (notification: any) => {
      console.log('🔔 New notification:', notification);
      
      // Update queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

      // Show toast for important notifications
      if (notification.type === 'issue_assigned' || 
          notification.type === 'announcement_created' ||
          notification.priority === 'HIGH') {
        toast.info(notification.title, {
          description: notification.message,
          action: notification.link ? {
            label: 'View',
            onClick: () => window.location.href = notification.link,
          } : undefined,
        });
      }
    };

    subscribe('notification', handleNotification);

    return () => {
      unsubscribe('notification', handleNotification);
    };
  }, [isConnected, subscribe, unsubscribe, queryClient]);
}