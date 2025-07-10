// Real-time user service for web app to track verification status changes
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { supabase } from './supabase';

// User type for real-time updates
interface UserUpdate {
  id: string;
  email: string;
  is_verified: boolean;
  role: string;
  group: string;
}

// Real-time user service class
export class RealtimeUserService {
  private static instance: RealtimeUserService;
  private userStatusSubject = new BehaviorSubject<UserUpdate | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private subscriptions: { unsubscribe: () => void }[] = [];
  private refreshInterval?: NodeJS.Timeout;

  private constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeRealtimeSubscriptions();
    }
  }

  public static getInstance(): RealtimeUserService {
    // Only create instance in browser environment
    if (typeof window === 'undefined') {
      // Return a minimal stub for server-side
      const emptyObservable = new BehaviorSubject<UserUpdate | null>(null).asObservable();
      const stub = {
        getUserStatus: () => emptyObservable,
        getConnectionStatus: () => new BehaviorSubject<boolean>(false).asObservable(),
        setUserStatus: () => {},
        broadcastUserVerificationUpdate: () => {},
        refresh: () => Promise.resolve(),
        cleanup: () => {},
        reconnect: () => {}
      };
      return stub as unknown as RealtimeUserService;
    }

    if (!RealtimeUserService.instance) {
      RealtimeUserService.instance = new RealtimeUserService();
    }
    return RealtimeUserService.instance;
  }

  // Initialize real-time subscriptions
  private initializeRealtimeSubscriptions() {
    console.log('🚀 [Web App] Initializing user verification real-time subscriptions...');

    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log('⚠️ [Web App] Server-side environment detected, skipping real-time initialization');
      this.connectionStatusSubject.next(false);
      return;
    }

    try {
      // Use a consistent channel name for verification updates
      const channelName = 'web_app_user_verification';
      
      // Set up broadcast channel for user verification updates
      const broadcastSubscription = supabase
        .channel(channelName)
        .on(
          'broadcast',
          { event: 'user_verification_update' },
          (payload: Record<string, unknown>) => {
            console.log('🔥 [Web App] User verification update received:', payload);
            this.handleUserVerificationUpdate(payload);
          }
        )
        .subscribe((status: string, err?: Error) => {
          console.log('📡 [Web App] User verification subscription status:', status);
          if (err) {
            console.error('❌ [Web App] Subscription error:', err);
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ [Web App] Successfully subscribed to user verification updates');
            this.connectionStatusSubject.next(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn('⚠️ [Web App] Channel connection issue - using polling...');
            this.connectionStatusSubject.next(false);
          } else {
            console.log('⚠️ [Web App] Connection status:', status);
            this.connectionStatusSubject.next(status === 'SUBSCRIBED');
          }
        });

      this.subscriptions.push(broadcastSubscription);
      
      // Start periodic refresh to check user verification status
      this.startPeriodicRefresh();
      
      console.log('📞 [Web App] Real-time subscription setup completed');
    } catch (error) {
      console.warn('⚠️ [Web App] Error setting up real-time subscriptions, using polling only:', error);
      this.connectionStatusSubject.next(false);
      this.startPeriodicRefresh();
    }
  }

  // Handle user verification updates
  private handleUserVerificationUpdate(payload: Record<string, unknown>) {
    console.log('🔄 [Web App] Processing user verification update:', payload);
    
    const userData = payload.user_data || payload.data;
    
    if (!userData || typeof userData !== 'object') {
      console.log('❓ [Web App] No valid user data in verification payload');
      return;
    }
    
    const userUpdate = userData as UserUpdate;
    console.log('📊 [Web App] User verification data:', userUpdate);
    
    // Update the user status subject
    this.userStatusSubject.next(userUpdate);
  }

  // Start periodic refresh to check user status
  private startPeriodicRefresh() {
    console.log('🔄 [Web App] Starting periodic user verification refresh...');
    // Check every 10 seconds for verification status changes
    this.refreshInterval = setInterval(() => {
      this.checkCurrentUserStatus();
    }, 10000);
  }

  // Check current user verification status
  private async checkCurrentUserStatus() {
    try {
      // Only check in browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ [Web App] Server-side environment detected, skipping status check');
        return;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        return;
      }

      // Get updated user metadata
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return;
      }

      const userUpdate: UserUpdate = {
        id: user.id,
        email: user.email || '',
        is_verified: user.user_metadata?.is_verified || false,
        role: user.user_metadata?.role || 'Unverified Customer',
        group: user.user_metadata?.group || 'customers'
      };

      // Only emit if the verification status changed
      const currentStatus = this.userStatusSubject.value;
      if (!currentStatus || currentStatus.is_verified !== userUpdate.is_verified) {
        console.log('🔄 [Web App] User verification status changed:', userUpdate);
        this.userStatusSubject.next(userUpdate);
      }
      
    } catch (error) {
      console.error('❌ [Web App] Error checking user status:', error);
    }
  }

  // Public method to set initial user data
  public setUserStatus(user: UserUpdate | null) {
    console.log('📋 [Web App] Setting user status:', user);
    this.userStatusSubject.next(user);
  }

  // Public method to get user status observable
  public getUserStatus(): Observable<UserUpdate | null> {
    return this.userStatusSubject.asObservable().pipe(
      distinctUntilChanged((prev, curr) => {
        // Compare verification status and user ID
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        
        return prev.id === curr.id && 
               prev.is_verified === curr.is_verified && 
               prev.role === curr.role;
      }),
      shareReplay(1)
    );
  }

  // Public method to get connection status
  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  // Public method to broadcast user verification updates (for admin actions)
  public broadcastUserVerificationUpdate(userData: UserUpdate) {
    console.log('📢 [Web App] Broadcasting user verification update:', userData);
    
    try {
      // Send broadcast to web app clients about verification status change
      const broadcastChannel = supabase.channel('web_app_user_verification_broadcast');
      
      broadcastChannel.send({
        type: 'broadcast',
        event: 'user_verification_update',
        payload: {
          user_data: userData,
          timestamp: Date.now()
        }
      });

      // Unsubscribe after sending
      setTimeout(() => {
        broadcastChannel.unsubscribe();
      }, 1000);

    } catch (error) {
      console.error('❌ [Web App] Error broadcasting verification update:', error);
    }
  }

  // Manual refresh
  public async refresh() {
    await this.checkCurrentUserStatus();
  }

  // Cleanup
  public cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
    
    this.subscriptions.forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    this.subscriptions = [];
  }

  // Reconnect if needed
  public reconnect() {
    this.cleanup();
    this.initializeRealtimeSubscriptions();
  }
}

// Export singleton instance - only initialize in browser
let realtimeUserServiceInstance: RealtimeUserService | null = null;

export const realtimeUserService = typeof window !== 'undefined' 
  ? (() => {
      if (!realtimeUserServiceInstance) {
        realtimeUserServiceInstance = RealtimeUserService.getInstance();
      }
      return realtimeUserServiceInstance;
    })()
  : (null as unknown as RealtimeUserService); // Return null on server-side
