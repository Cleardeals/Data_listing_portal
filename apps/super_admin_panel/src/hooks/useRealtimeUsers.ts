// Custom hook for real-time user data with SSR support
import { useState, useEffect, useCallback, useRef } from 'react';
import { Subscription } from 'rxjs';
import { realtimeUserService } from '../lib/realtimeService';
import { InternalUser, ExternalUser, fetchInternalUsers, fetchExternalUsers } from '../lib/supabaseUsers';

// Hook for internal users with real-time sync
export function useInternalUsersRealtime() {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const initialLoadDone = useRef(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch initial data from API (SSR compatible)
      const initialUsers = await fetchInternalUsers();
      console.log('✅ Loaded initial internal users:', initialUsers.length);
      setUsers(initialUsers);
      
      // Set initial data in realtime service to sync with observables
      if (realtimeUserService) {
        realtimeUserService.setInternalUsers(initialUsers);
      }
      initialLoadDone.current = true;
    } catch (err) {
      console.error('Failed to load initial internal users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let usersSubscription: Subscription | null = null;
    let connectionSubscription: Subscription | null = null;

    const setupSubscriptions = () => {
      console.log('🔗 Setting up internal users subscriptions...');
      
      // Check if service is available (browser environment)
      if (!realtimeUserService) {
        console.log('⚠️ Real-time service not available (server-side), skipping subscriptions');
        return;
      }
      
      // Subscribe to real-time updates FIRST
      usersSubscription = realtimeUserService.getInternalUsers().subscribe({
        next: (updatedUsers) => {
          console.log('🔄 Internal users real-time update received:', updatedUsers.length, 'users');
          console.log('📊 Initial load done:', initialLoadDone.current);
          
          // Always update the users state when real-time data comes in
          setUsers(updatedUsers);
          if (initialLoadDone.current) {
            setLoading(false);
          }
        },
        error: (err) => {
          console.error('❌ Error in internal users subscription:', err);
          setError('Real-time sync error');
        }
      });

      // Subscribe to connection status
      connectionSubscription = realtimeUserService.getConnectionStatus().subscribe({
        next: (connected: boolean) => {
          console.log('📡 Real-time connection status:', connected);
          setIsConnected(connected);
        }
      });
    };

    // Setup subscriptions first, then load initial data
    setupSubscriptions();
    
    // Load initial data after subscriptions are set
    loadInitialData();

    // Cleanup subscriptions
    return () => {
      console.log('🧹 Cleaning up internal users subscriptions...');
      if (usersSubscription) {
        usersSubscription.unsubscribe();
      }
      if (connectionSubscription) {
        connectionSubscription.unsubscribe();
      }
    };
  }, [loadInitialData]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // Update local state when operations are performed (optimistic updates)
  const updateUser = useCallback((updatedUser: InternalUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    // Also update the real-time service
    if (realtimeUserService) {
      const currentUsers = realtimeUserService.getCurrentInternalUsers();
      const updatedUsers = currentUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
      realtimeUserService.setInternalUsers(updatedUsers);
    }
  }, []);

  const addUser = useCallback((newUser: InternalUser) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    // Also update the real-time service
    if (realtimeUserService) {
      const currentUsers = realtimeUserService.getCurrentInternalUsers();
      realtimeUserService.setInternalUsers([...currentUsers, newUser]);
    }
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    // Also update the real-time service
    if (realtimeUserService) {
      const currentUsers = realtimeUserService.getCurrentInternalUsers();
      realtimeUserService.setInternalUsers(currentUsers.filter(user => user.id !== userId));
    }
  }, []);

  return {
    users,
    loading,
    error,
    isConnected,
    refresh,
    updateUser,
    addUser,
    removeUser,
    setError
  };
}

// Hook for external users with real-time sync
export function useExternalUsersRealtime() {
  const [users, setUsers] = useState<ExternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const initialLoadDone = useRef(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch initial data from API (SSR compatible)
      const initialUsers = await fetchExternalUsers();
      console.log('✅ Loaded initial external users:', initialUsers.length);
      setUsers(initialUsers);
      
      // Set initial data in realtime service to sync with observables
      if (realtimeUserService) {
        realtimeUserService.setExternalUsers(initialUsers);
      }
      initialLoadDone.current = true;
    } catch (err) {
      console.error('Failed to load initial external users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let usersSubscription: Subscription | null = null;
    let connectionSubscription: Subscription | null = null;

    const setupSubscriptions = () => {
      console.log('🔗 Setting up external users subscriptions...');
      
      // Check if service is available (browser environment)
      if (!realtimeUserService) {
        console.log('⚠️ Real-time service not available (server-side), skipping subscriptions');
        return;
      }
      
      // Subscribe to real-time updates FIRST
      usersSubscription = realtimeUserService.getExternalUsers().subscribe({
        next: (updatedUsers) => {
          console.log('🔄 External users real-time update received:', updatedUsers.length, 'users');
          console.log('📊 Initial load done:', initialLoadDone.current);
          
          // Always update the users state when real-time data comes in
          setUsers(updatedUsers);
          if (initialLoadDone.current) {
            setLoading(false);
          }
        },
        error: (err) => {
          console.error('❌ Error in external users subscription:', err);
          setError('Real-time sync error');
        }
      });

      // Subscribe to connection status
      connectionSubscription = realtimeUserService.getConnectionStatus().subscribe({
        next: (connected: boolean) => {
          console.log('📡 Real-time connection status:', connected);
          setIsConnected(connected);
        }
      });
    };

    // Setup subscriptions first, then load initial data
    setupSubscriptions();
    
    // Load initial data after subscriptions are set
    loadInitialData();

    // Cleanup subscriptions
    return () => {
      console.log('🧹 Cleaning up external users subscriptions...');
      if (usersSubscription) {
        usersSubscription.unsubscribe();
      }
      if (connectionSubscription) {
        connectionSubscription.unsubscribe();
      }
    };
  }, [loadInitialData]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // Update local state when operations are performed (optimistic updates)
  const updateUser = useCallback((updatedUser: ExternalUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    // Also update the real-time service
    if (realtimeUserService) {
      const currentUsers = realtimeUserService.getCurrentExternalUsers();
      const updatedUsers = currentUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
      realtimeUserService.setExternalUsers(updatedUsers);
    }
  }, []);

  const addUser = useCallback((newUser: ExternalUser) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    // Also update the real-time service
    if (realtimeUserService) {
      const currentUsers = realtimeUserService.getCurrentExternalUsers();
      realtimeUserService.setExternalUsers([...currentUsers, newUser]);
    }
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    // Also update the real-time service
    if (realtimeUserService) {
      const currentUsers = realtimeUserService.getCurrentExternalUsers();
      realtimeUserService.setExternalUsers(currentUsers.filter(user => user.id !== userId));
    }
  }, []);

  return {
    users,
    loading,
    error,
    isConnected,
    refresh,
    updateUser,
    addUser,
    removeUser,
    setError
  };
}
