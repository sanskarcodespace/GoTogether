import api from './api';

export const rideService = {
  createRide: (data: any) => api.post('/rides/create', data),
  
  searchRides: (params: any) => api.get('/rides/search', { params }),
  
  getActiveRide: () => api.get('/rides/active'),
  
  getRideById: (id: string) => api.get(`/rides/${id}`),
  
  startRide: (id: string) => api.put(`/rides/${id}/start`),
  
  completeRide: (id: string) => api.put(`/rides/${id}/complete`),
  
  cancelRide: (id: string, reason: string) => 
    api.put(`/rides/${id}/cancel`, { reason }),
  
  getRideHistory: (params: any) => 
    api.get('/rides/history', { params }),
};
