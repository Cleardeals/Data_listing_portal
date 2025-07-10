// Real-time service using observables for Supabase auth.users table changes
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { supabase } from './supabase';
import { InternalUser, ExternalUser } from './supabaseUsers';

// Real-time service class
export class RealtimeUserService {
  private static instance: RealtimeUserService;
  private internalUsersSubject = new BehaviorSubject<InternalUser[]>([]);
  private externalUsersSubject = new BehaviorSubject<ExternalUser[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private subscriptions: { unsubscribe: () => void }[] = [];
  private pollingInterval?: NodeJS.Timeout;
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
      const emptyInternalObservable = new BehaviorSubject<InternalUser[]>([]).asObservable();
      const emptyExternalObservable = new BehaviorSubject<ExternalUser[]>([]).asObservable();
      const stub = {
        getInternalUsers: () => emptyInternalObservable,
        getExternalUsers: () => emptyExternalObservable,
        getConnectionStatus: () => new BehaviorSubject<boolean>(false).asObservable(),
        setInternalUsers: () => {},
        setExternalUsers: () => {},
        broadcastUserUpdate: () => {},
        forceUpdateInternalUsers: () => {},
        forceUpdateExternalUsers: () => {},
        getCurrentInternalUsers: () => [],
        getCurrentExternalUsers: () => [],
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
    console.log('🚀 Initializing real-time subscriptions...');

    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log('⚠️ Server-side environment detected, skipping real-time initialization');
      this.connectionStatusSubject.next(false);
      return;
    }

    try {
      // Use a consistent channel name for broadcast communication
      const channelName = 'super_admin_user_management';
      
      // Set up broadcast channel for cross-client communication
      const broadcastSubscription = supabase
        .channel(channelName)
        .on(
          'broadcast',
          { event: 'user_update' },
          (payload) => {
            console.log('🔥 Broadcast user update received:', payload);
            this.handleBroadcastUpdate(payload);
          }
        )
        .subscribe((status, err) => {
          console.log('📡 Broadcast subscription status:', status);
          if (err) {
            console.error('❌ Subscription error:', err);
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to user management broadcasts');
            this.connectionStatusSubject.next(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn('⚠️ Channel connection issue - continuing with polling...');
            this.connectionStatusSubject.next(false);
            // Don't treat this as an error, just continue with polling
          } else {
            console.log('⚠️ Connection status:', status);
            this.connectionStatusSubject.next(status === 'SUBSCRIBED');
          }
        });

      this.subscriptions.push(broadcastSubscription);
      
      // Always start periodic refresh as primary sync mechanism
      this.startPeriodicRefresh();
      
      console.log('📞 Real-time subscription setup completed');
    } catch (error) {
      console.warn('⚠️ Error setting up real-time subscriptions, using polling only:', error);
      this.connectionStatusSubject.next(false);
      // Still start periodic refresh even if real-time fails
      this.startPeriodicRefresh();
    }
  }

  // Handle broadcast updates
  private handleBroadcastUpdate(payload: Record<string, unknown>) {
    console.log('🔄 Processing broadcast update:', payload);
    
    const eventType = payload.event_type || payload.eventType;
    const userData = payload.user_data || payload.data;
    
    if (!userData || typeof userData !== 'object') {
      console.log('❓ No valid user data in broadcast payload');
      return;
    }
    
    console.log(`📝 Broadcast event type: ${eventType}`);
    console.log('📊 User data:', userData);
    
    switch (eventType) {
      case 'user_created':
      case 'user_added':
      case 'user_updated':
      case 'user_deleted':
        this.forceUpdateInternalUsers();
        this.forceUpdateExternalUsers();
        break;
      default:
        console.log('❓ Unknown broadcast event type:', eventType);
        // Still refresh on unknown events
        this.forceUpdateInternalUsers();
        this.forceUpdateExternalUsers();
        break;
    }
  }

  // Start polling as fallback
  private startPolling() {
    // Only start polling in browser environment
    if (typeof window === 'undefined') {
      console.log('⚠️ Server-side environment detected, skipping polling setup');
      return;
    }
    
    console.log('🔄 Starting polling fallback...');
    // Poll every 2 seconds for updates when real-time fails
    this.pollingInterval = setInterval(() => {
      this.refreshUserLists();
    }, 2000);
  }

  // Start periodic refresh
  private startPeriodicRefresh() {
    // Only start periodic refresh in browser environment
    if (typeof window === 'undefined') {
      console.log('⚠️ Server-side environment detected, skipping periodic refresh setup');
      return;
    }
    
    console.log('🔄 Starting periodic refresh...');
    // Refresh every 5 seconds to ensure we have the latest data
    this.refreshInterval = setInterval(() => {
      this.refreshUserLists();
    }, 5000);
  }

  // Refresh user lists by fetching from API
  private async refreshUserLists() {
    try {
      // Only refresh in browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side environment detected, skipping API refresh');
        return;
      }
      
      console.log('🔄 Refreshing user lists from API...');
      
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        console.log('⚠️ No access token available, skipping API refresh');
        return;
      }
      
      // Fetch internal users
      const response1 = await fetch('/api/internal-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response1.ok) {
        const internalUsers = await response1.json();
        console.log('✅ Refreshed internal users:', internalUsers.length);
        this.setInternalUsers(internalUsers);
      }
      
      // Fetch external users
      const response2 = await fetch('/api/external-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response2.ok) {
        const externalUsers = await response2.json();
        console.log('✅ Refreshed external users:', externalUsers.length);
        this.setExternalUsers(externalUsers);
      }
    } catch (error) {
      console.error('❌ Error refreshing user lists:', error);
    }
  }

  // Get access token for API calls
  private getAccessToken(): string {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side environment detected, skipping token retrieval');
        return '';
      }
      
      const session = localStorage.getItem('super_admin_auth_session');
      if (session) {
        const parsedSession = JSON.parse(session);
        return parsedSession.access_token || '';
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return '';
  }

  // Public method to broadcast user updates
  public broadcastUserUpdate(eventType: string, userData: InternalUser | ExternalUser) {
    console.log('📢 Broadcasting user update:', { eventType, userData });
    
    try {
      // Send broadcast to all connected clients using a general channel
      const broadcastChannel = supabase.channel('super_admin_user_management');
      
      broadcastChannel.send({
        type: 'broadcast',
        event: 'user_update',
        payload: {
          event_type: eventType,
          user_data: userData,
          timestamp: Date.now()
        }
      });

      // If this is a verification update for external user, also broadcast to web app
      if (eventType === 'user_updated' && 'business' in userData) {
        const webAppChannel = supabase.channel('web_app_user_verification');
        
        webAppChannel.send({
          type: 'broadcast',
          event: 'user_verification_update',
          payload: {
            user_data: {
              id: userData.id,
              email: userData.email,
              is_verified: userData.is_verified,
              role: userData.role,
              group: userData.group || 'customers'
            },
            timestamp: Date.now()
          }
        });

        console.log('📢 Also broadcast verification update to web app for:', userData.email);

        // Unsubscribe after sending
        setTimeout(() => {
          webAppChannel.unsubscribe();
        }, 1000);
      }

      // Unsubscribe after sending to clean up
      setTimeout(() => {
        broadcastChannel.unsubscribe();
      }, 1000);

    } catch (error) {
      console.error('❌ Error broadcasting user update:', error);
    }

    // Always update local state immediately based on user type
    if (this.isInternalUserType(userData)) {
      this.updateInternalUserState(eventType, userData as InternalUser);
    } else {
      this.updateExternalUserState(eventType, userData as ExternalUser);
    }
  }

  // Helper to check if user is internal user type
  private isInternalUserType(user: InternalUser | ExternalUser): boolean {
    return user.group === 'internalusers' || (user as InternalUser).contact !== undefined;
  }

  // Update internal user state
  private updateInternalUserState(eventType: string, user: InternalUser) {
    const currentUsers = this.internalUsersSubject.value;
    let updatedUsers: InternalUser[];

    switch (eventType) {
      case 'user_created':
      case 'user_added':
        updatedUsers = [...currentUsers, user];
        break;
      case 'user_updated':
        updatedUsers = currentUsers.map(u => u.id === user.id ? user : u);
        break;
      case 'user_deleted':
        updatedUsers = currentUsers.filter(u => u.id !== user.id);
        break;
      default:
        updatedUsers = currentUsers;
        break;
    }

    this.internalUsersSubject.next(updatedUsers);
  }

  // Update external user state
  private updateExternalUserState(eventType: string, user: ExternalUser) {
    const currentUsers = this.externalUsersSubject.value;
    let updatedUsers: ExternalUser[];

    switch (eventType) {
      case 'user_created':
      case 'user_added':
        updatedUsers = [...currentUsers, user];
        break;
      case 'user_updated':
        updatedUsers = currentUsers.map(u => u.id === user.id ? user : u);
        break;
      case 'user_deleted':
        updatedUsers = currentUsers.filter(u => u.id !== user.id);
        break;
      default:
        updatedUsers = currentUsers;
        break;
    }

    this.externalUsersSubject.next(updatedUsers);
  }

  // Public methods to get observables
  public getInternalUsers(): Observable<InternalUser[]> {
    return this.internalUsersSubject.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  public getExternalUsers(): Observable<ExternalUser[]> {
    return this.externalUsersSubject.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable().pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  // Set initial data
  public setInternalUsers(users: InternalUser[]) {
    this.internalUsersSubject.next(users);
  }

  public setExternalUsers(users: ExternalUser[]) {
    this.externalUsersSubject.next(users);
  }

  // Force update observables
  public forceUpdateInternalUsers() {
    const currentUsers = this.internalUsersSubject.value;
    this.internalUsersSubject.next([...currentUsers]);
  }

  public forceUpdateExternalUsers() {
    const currentUsers = this.externalUsersSubject.value;
    this.externalUsersSubject.next([...currentUsers]);
  }

  // Get current values
  public getCurrentInternalUsers(): InternalUser[] {
    return this.internalUsersSubject.value;
  }

  public getCurrentExternalUsers(): ExternalUser[] {
    return this.externalUsersSubject.value;
  }

  // Cleanup
  public cleanup() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }
    
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