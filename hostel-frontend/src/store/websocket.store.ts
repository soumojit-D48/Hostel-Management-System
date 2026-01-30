import { create } from 'zustand';

interface WebSocketState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastEvent: any | null;
  
  setConnected: (connected: boolean) => void;
  setReconnectAttempts: (attempts: number) => void;
  setLastEvent: (event: any) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  isConnected: false,
  reconnectAttempts: 0,
  lastEvent: null,
  
  setConnected: (connected) => set({ isConnected: connected }),
  setReconnectAttempts: (attempts) => set({ reconnectAttempts: attempts }),
  setLastEvent: (event) => set({ lastEvent: event }),
}));