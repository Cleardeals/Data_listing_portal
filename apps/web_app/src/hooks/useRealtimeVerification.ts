// Custom hook for real-time user verification status updates
import { useEffect, useState } from 'react';
import { realtimeUserService } from '@/lib/realtimeUserService';

interface UserVerificationStatus {
  id: string;
  email: string;
  is_verified: boolean;
  role: string;
  group: string;
}

export const useRealtimeVerification = (currentUserId?: string) => {
  const [verificationStatus, setVerificationStatus] = useState<UserVerificationStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if service is available (browser environment)
    if (!realtimeUserService) {
      console.log('⚠️ [useRealtimeVerification] Real-time service not available (server-side), skipping subscriptions');
      return;
    }

    // Subscribe to user verification status updates
    const userStatusSubscription = realtimeUserService.getUserStatus().subscribe(
      (userUpdate) => {
        console.log('🔄 [Hook] User verification status update:', userUpdate);
        
        // Only update if this is the current user or no specific user ID is provided
        if (!currentUserId || (userUpdate && userUpdate.id === currentUserId)) {
          setVerificationStatus(userUpdate);
        }
      }
    );

    // Subscribe to connection status
    const connectionSubscription = realtimeUserService.getConnectionStatus().subscribe(
      (connected) => {
        setIsConnected(connected);
      }
    );

    return () => {
      userStatusSubscription.unsubscribe();
      connectionSubscription.unsubscribe();
    };
  }, [currentUserId]);

  // Method to manually check current user status
  const refreshStatus = async () => {
    if (realtimeUserService) {
      await realtimeUserService.refresh();
    }
  };

  return {
    verificationStatus,
    isConnected,
    refreshStatus
  };
};
