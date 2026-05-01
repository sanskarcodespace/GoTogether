import { ref, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { AppState, AppStateStatus } from 'react-native';

class PresenceService {
  private userId: string | null = null;
  private appStateListener: any;

  init() {
    this.userId = useAuthStore.getState().user?._id || null;
    if (!this.userId) return;

    this.setupPresence();

    this.appStateListener = AppState.addEventListener('change', this.handleAppStateChange);

    // Re-init on auth change
    useAuthStore.subscribe((state) => {
      if (state.user?._id !== this.userId) {
        this.userId = state.user?._id || null;
        this.setupPresence();
      }
    });
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (!this.userId) return;
    
    if (nextAppState === 'active') {
      this.setOnlineStatus(true);
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.setOnlineStatus(false);
    }
  };

  private setupPresence() {
    if (!this.userId) return;

    const presenceRef = ref(database, `user_status/${this.userId}`);
    
    // Setup onDisconnect hook so server handles unexpected drops
    onDisconnect(presenceRef).set({
      isOnline: false,
      lastSeen: serverTimestamp()
    });

    // We are online right now
    this.setOnlineStatus(true);
  }

  private setOnlineStatus(isOnline: boolean) {
    if (!this.userId) return;
    const presenceRef = ref(database, `user_status/${this.userId}`);
    set(presenceRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  }

  cleanup() {
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
    this.setOnlineStatus(false);
  }
}

export const presenceService = new PresenceService();
