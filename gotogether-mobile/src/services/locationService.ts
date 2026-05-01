import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, off } from 'firebase/database';

const firebaseConfig = {
  // Config should be in .env
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const locationService = {
  // Provider: Update location every 3 seconds
  updateProviderLocation: async (rideId: string, latitude: number, longitude: number) => {
    const locationRef = ref(db, `active_rides/${rideId}/provider_location`);
    await set(locationRef, {
      latitude,
      longitude,
      timestamp: Date.now(),
    });
  },

  // Seeker: Subscribe to provider location
  subscribeToProviderLocation: (rideId: string, callback: (location: any) => void) => {
    const locationRef = ref(db, `active_rides/${rideId}/provider_location`);
    onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
  },

  // Unsubscribe
  unsubscribeFromLocation: (rideId: string) => {
    const locationRef = ref(db, `active_rides/${rideId}/provider_location`);
    off(locationRef);
  },

  // On ride complete: remove data
  clearRideLocation: async (rideId: string) => {
    const rideRef = ref(db, `active_rides/${rideId}`);
    await remove(rideRef);
  },
};
