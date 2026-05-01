import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useRequestStore } from '../store/requestStore';
import { useRideStore } from '../store/rideStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = useAuthStore.getState().accessToken;
    if (!token || this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}/rides`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.io');
    });

    this.socket.on('RIDE_REQUESTED', (data) => {
      useRequestStore.getState().addIncomingRequest(data);
    });

    this.socket.on('RIDE_ACCEPTED', (data) => {
      // Handle ride accepted
      useRideStore.getState().setActiveRide(data.ride);
    });

    this.socket.on('RIDE_REJECTED', (data) => {
      // Handle ride rejected
    });

    this.socket.on('RIDE_CANCELLED', (data) => {
      useRideStore.getState().clearActiveRide();
    });

    this.socket.on('RIDE_COMPLETED', (data) => {
      useRideStore.getState().clearActiveRide();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
