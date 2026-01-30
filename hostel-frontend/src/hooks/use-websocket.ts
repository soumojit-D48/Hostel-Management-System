'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { wsManager } from '@/lib/websocket';

export function useWebSocket() {
  const { user, token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      wsManager.disconnect();
      setIsConnected(false);
      return;
    }

    // Connect
    wsManager.connect(user.id, token, user.hostel?.id);

    // Monitor connection status
    const checkConnection = () => {
      setIsConnected(wsManager.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => {
      clearInterval(interval);
      // Don't disconnect here - keep connection alive across components
    };
  }, [isAuthenticated, user, token]);

  return {
    isConnected,
    socket: wsManager.getSocket(),
    subscribe: wsManager.on.bind(wsManager),
    unsubscribe: wsManager.off.bind(wsManager),
    emit: wsManager.emit.bind(wsManager),
  };
}