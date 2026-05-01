import { create } from 'zustand';

interface LocationState {
  currentLocation: { latitude: number; longitude: number } | null;
  hasPermission: boolean;
  isTracking: boolean;
  setLocation: (location: { latitude: number; longitude: number } | null) => void;
  setPermission: (status: boolean) => void;
  setTracking: (status: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  hasPermission: false,
  isTracking: false,
  setLocation: (location) => set({ currentLocation: location }),
  setPermission: (status) => set({ hasPermission: status }),
  setTracking: (status) => set({ isTracking: status }),
}));
