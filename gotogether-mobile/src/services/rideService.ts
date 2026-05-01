import api from './api';

export const rideService = {
  createRide: async (data: any) => {
    const response = await api.post('/rides/create', data);
    return response.data.data;
  },
  
  getSuggestedPrice: async (params: any) => {
    const response = await api.get('/rides/suggested-price', { params });
    return response.data.data;
  },
  
  searchRides: async (params: any) => {
    const response = await api.get('/rides/search', { params });
    return response.data.data;
  },
  
  getActiveRide: () => api.get('/rides/active'),
  
  getRideById: (id: string) => api.get(`/rides/${id}`),
  
  startRide: (id: string) => api.put(`/rides/${id}/start`),
  
  completeRide: (id: string) => api.put(`/rides/${id}/complete`),
  
  cancelRide: (id: string, reason: string) => 
    api.put(`/rides/${id}/cancel`, { reason }),
  
  getRideHistory: (params: any) => 
    api.get('/rides/history', { params }),
};
