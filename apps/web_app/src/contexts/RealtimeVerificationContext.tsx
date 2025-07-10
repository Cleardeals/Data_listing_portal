// Real-time provider to initialize the verification service at the app level
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { realtimeUserService } from '../lib/realtimeUserService';

interface RealtimeVerificationContextType {
  isInitialized: boolean;
  isConnected: boolean;
}

const RealtimeVerificationContext = createContext<RealtimeVerificationContextType>({
  isInitialized: false,
  isConnected: false
});

interface RealtimeVerificationProviderProps {
  children: ReactNode;
}

export function RealtimeVerificationProvider({ children }: RealtimeVerificationProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🚀 [Web App] Initializing real-time verification service...');
    
    // Check if service is available (browser environment)
    if (!realtimeUserService) {
      console.log('⚠️ [Web App] Real-time service not available (server-side), marking as initialized');
      setIsInitialized(true);
      return;
    }
    
    // Initialize the service (this happens in the constructor)
    // The service is a singleton, so this just gets the instance
    const service = realtimeUserService;
    
    // Subscribe to connection status
    const connectionSubscription = service.getConnectionStatus().subscribe({
      next: (connected) => {
        console.log('📡 [Web App] Real-time verification service connection status:', connected);
        setIsConnected(connected);
        if (!isInitialized) {
          console.log('✅ [Web App] Real-time verification service initialized');
          setIsInitialized(true);
        }
      },
      error: (err) => {
        console.error('❌ [Web App] Real-time verification service connection error:', err);
        setIsConnected(false);
      }
    });

    // Mark as initialized even if not connected yet (polling will work)
    if (!isInitialized) {
      setIsInitialized(true);
    }

    return () => {
      connectionSubscription.unsubscribe();
    };
  }, [isInitialized]);

  const contextValue: RealtimeVerificationContextType = {
    isInitialized,
    isConnected
  };

  return (
    <RealtimeVerificationContext.Provider value={contextValue}>
      {children}
    </RealtimeVerificationContext.Provider>
  );
}

export function useRealtimeVerificationContext() {
  const context = useContext(RealtimeVerificationContext);
  if (!context) {
    throw new Error('useRealtimeVerificationContext must be used within a RealtimeVerificationProvider');
  }
  return context;
}
