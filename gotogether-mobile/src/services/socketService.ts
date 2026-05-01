/**
 * socketService.ts
 *
 * Singleton that owns the two Socket.IO connections (/rides + /tracking).
 * Connects on login, disconnects on logout (wired in App.tsx via isAuthenticated).
 *
 * Navigation is handled via the global navigationRef so this module stays
 * free of React hook constraints.
 */

import { io, Socket } from 'socket.io-client';
import { Alert, Platform, ToastAndroid } from 'react-native';

import { useAuthStore }    from '../store/authStore';
import { useRequestStore } from '../store/requestStore';
import { useRideStore }    from '../store/rideStore';
import { navigate, reset } from '../navigation/navigationRef';

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('GoTogether', message);
  }
}

// ─── SocketService class ──────────────────────────────────────────────────────
class SocketService {
  /** /rides namespace — ride lifecycle events */
  private ridesSocket: Socket | null = null;

  /** /tracking namespace — GPS fallback streaming */
  public trackingSocket: Socket | null = null;

  // ── Connect ─────────────────────────────────────────────────────────────────
  connect() {
    const token = useAuthStore.getState().accessToken;
    if (!token || this.ridesSocket?.connected) return;

    const opts = {
      auth: { token },
      transports: ['websocket'] as ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    };

    this.ridesSocket    = io(`${BASE_URL}/rides`,    opts);
    this.trackingSocket = io(`${BASE_URL}/tracking`, opts);

    this._setupRidesListeners();
  }

  // ── Disconnect ───────────────────────────────────────────────────────────────
  disconnect() {
    this.ridesSocket?.disconnect();
    this.trackingSocket?.disconnect();
    this.ridesSocket    = null;
    this.trackingSocket = null;
  }

  // ── /rides listeners ────────────────────────────────────────────────────────
  private _setupRidesListeners() {
    const s = this.ridesSocket!;

    s.on('connect', () => {
      console.log('[Socket] Connected to /rides:', s.id);
    });

    s.on('connected', (data: { socketId: string; userId: string }) => {
      console.log('[Socket] Server ack — socketId:', data.socketId);
    });

    // ── 1. Provider receives a new seeker request ──────────────────────────
    s.on('ride:new_request', (data: { rideId: string; requestId: string; seeker: any }) => {
      useRequestStore.getState().addIncomingRequest(data);
      toast(`New ride request from ${data.seeker?.name ?? 'a passenger'}`);
    });

    // ── 2. Seeker's request was accepted → go to TrackRide ─────────────────
    s.on('ride:accepted', (data: {
      rideId: string;
      requestId: string;
      otp: string;
      providerLocation: { lat: number; lng: number };
    }) => {
      useRequestStore.getState().setMyActiveRequest({ ...data, status: 'accepted' });
      navigate('TrackRide', { rideId: data.rideId });
      toast('Your ride request was accepted! 🎉');
    });

    // ── 3. Seeker's request was rejected ───────────────────────────────────
    s.on('ride:rejected', (_data: { rideId: string; requestId: string; reason: string }) => {
      useRequestStore.getState().clearMyActiveRequest();
      navigate('SearchRide');
      toast('Provider declined your request.');
    });

    // ── 4. Ride cancelled by either party ──────────────────────────────────
    s.on('ride:cancelled', (data: { rideId: string; by: string; reason: string }) => {
      useRideStore.getState().clearActiveRide();
      useRequestStore.getState().clearMyActiveRequest();
      Alert.alert(
        'Ride Cancelled',
        data.reason || 'The ride was cancelled.',
        [{ text: 'OK', onPress: () => reset('Home') }],
      );
    });

    // ── 5. Ride completed ──────────────────────────────────────────────────
    s.on('ride:completed', (data: { rideId: string }) => {
      useRideStore.getState().clearActiveRide();
      navigate('RideCompleted', { rideId: data.rideId });
    });

    // ── 6. New ride published by a provider → inject into search list ──────
    s.on('new_ride_available', (ride: any) => {
      useRideStore.getState().prependLiveRide(ride);
      console.log('[Socket] Live ride injected:', ride._id);
    });

    s.on('disconnect', (reason: string) => {
      console.log('[Socket] Disconnected from /rides:', reason);
    });

    s.on('connect_error', (err: Error) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  // ── Emit helpers ─────────────────────────────────────────────────────────────

  /** Seeker → notify provider of a new request */
  emitRideRequest(payload: {
    rideId: string;
    requestId: string;
    providerId: string;
    seeker: { name: string; profilePhoto?: string };
  }) {
    this.ridesSocket?.emit('ride:request', payload);
  }

  /** Provider → notify seeker of acceptance */
  emitAcceptRide(payload: {
    rideId: string;
    requestId: string;
    seekerId: string;
    otp: string;
    providerLocation: { lat: number; lng: number };
  }) {
    this.ridesSocket?.emit('ride:accept', payload);
  }

  /** Provider → notify seeker of rejection */
  emitRejectRide(payload: {
    rideId: string;
    requestId: string;
    seekerId: string;
    reason: string;
  }) {
    this.ridesSocket?.emit('ride:reject', payload);
  }

  /** Either party → notify the other of cancellation */
  emitCancelRide(payload: {
    rideId: string;
    by: 'provider' | 'seeker';
    reason: string;
    otherPartyId: string;
  }) {
    this.ridesSocket?.emit('ride:cancel', payload);
  }

  /** Provider → broadcast ride completion to all passengers */
  emitCompleteRide(rideId: string) {
    this.ridesSocket?.emit('ride:complete', { rideId });
  }

  /** Join both the rides room and the tracking room for a given ride */
  joinRideRoom(rideId: string) {
    this.ridesSocket?.emit('join_ride_room',     rideId);
    this.trackingSocket?.emit('join_tracking_room', rideId);
  }

  /** Provider → push a GPS update through the tracking fallback socket */
  emitLocationUpdate(payload: {
    rideId: string;
    lat: number;
    lng: number;
    heading: number;
    speed: number;
  }) {
    this.trackingSocket?.emit('update_location', payload);
  }

  /** Generic emit for custom events */
  emit(event: string, data: unknown) {
    this.ridesSocket?.emit(event, data);
  }
}

export const socketService = new SocketService();
