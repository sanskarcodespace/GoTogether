import api from './api';

export const requestService = {
  sendRequest: (rideId: string, data: any) => 
    api.post(`/rides/${rideId}/requests`, data),
  
  acceptRequest: (rideId: string, reqId: string) => 
    api.put(`/rides/${rideId}/requests/${reqId}/accept`),
  
  rejectRequest: (rideId: string, reqId: string, reason: string) => 
    api.put(`/rides/${rideId}/requests/${reqId}/reject`, { reason }),
  
  cancelRequest: (rideId: string, reqId: string) => 
    api.put(`/rides/${rideId}/requests/${reqId}/cancel`),
  
  verifyOTP: (reqId: string, otp: string) => 
    api.post(`/rides/requests/${reqId}/verify-otp`, { otp }),
};
