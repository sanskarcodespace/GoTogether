import { create } from 'zustand';

interface RideState {
  activeRide: any | null;
  searchResults: any[];
  rideHistory: any[];
  isSearching: boolean;
  isCreating: boolean;
  setActiveRide: (ride: any | null) => void;
  setSearchResults: (results: any[]) => void;
  appendHistory: (rides: any[]) => void;
  clearActiveRide: () => void;
  setSearching: (status: boolean) => void;
  setCreating: (status: boolean) => void;
}

export const useRideStore = create<RideState>((set) => ({
  activeRide: null,
  searchResults: [],
  rideHistory: [],
  isSearching: false,
  isCreating: false,
  setActiveRide: (ride) => set({ activeRide: ride }),
  setSearchResults: (results) => set({ searchResults: results }),
  appendHistory: (rides) => set((state) => ({ rideHistory: [...state.rideHistory, ...rides] })),
  clearActiveRide: () => set({ activeRide: null }),
  setSearching: (status) => set({ isSearching: status }),
  setCreating: (status) => set({ isCreating: status }),
}));
