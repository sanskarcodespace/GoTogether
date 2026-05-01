import { create } from 'zustand';

interface RequestState {
  incomingRequests: any[];
  myActiveRequest: any | null;
  isLoading: boolean;
  addIncomingRequest: (request: any) => void;
  removeRequest: (reqId: string) => void;
  setMyActiveRequest: (request: any | null) => void;
  clearMyActiveRequest: () => void;
  setLoading: (status: boolean) => void;
  setIncomingRequests: (requests: any[]) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  incomingRequests: [],
  myActiveRequest: null,
  isLoading: false,
  addIncomingRequest: (request) =>
    set((state) => ({ incomingRequests: [request, ...state.incomingRequests] })),
  removeRequest: (reqId) =>
    set((state) => ({
      incomingRequests: state.incomingRequests.filter(r => r._id !== reqId),
    })),
  setMyActiveRequest: (request) => set({ myActiveRequest: request }),
  clearMyActiveRequest: ()       => set({ myActiveRequest: null }),
  setLoading: (status) => set({ isLoading: status }),
  setIncomingRequests: (requests) => set({ incomingRequests: requests }),
}));

