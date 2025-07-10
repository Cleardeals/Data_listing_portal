// Real-time provider to initialize the service at the app level
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { realtimeUserService } from '../lib/realtimeService';

interface RealtimeContextType {
  isInitialized: boolean;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isInitialized: false,
  isConnected: false
});

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🚀 Initializing real-time service...');
    
    // Initialize the service (this happens in the constructor)
    // The service is a singleton, so this just gets the instance
    const service = realtimeUserService;
    
    // Subscribe to connection status
    const connectionSubscription = service.getConnectionStatus().subscribe({
      next: (connected) => {
        console.log('📡 Real-time service connection status:', connected);
        setIsConnected(connected);
        if (connected && !isInitialized) {
          console.log('✅ Real-time service initialized and connected');
          setIsInitialized(true);
        }
      },
      error: (err) => {
        console.error('❌ Real-time service connection error:', err);
        setIsConnected(false);
      }
    });

    // Mark as initialized even if not connected yet
    if (!isInitialized) {
      setIsInitialized(true);
    }

    return () => {
      connectionSubscription.unsubscribe();
    };
  }, [isInitialized]);

  const contextValue: RealtimeContextType = {
    isInitialized,
    isConnected
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}
