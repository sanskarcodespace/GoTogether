import api from './api';

export const authService = {
  sendOTP: (phone: string) => api.post('/auth/send-otp', { phone }),
  
  verifyOTP: (phone: string, otp: string) => 
    api.post('/auth/verify-otp', { phone, otp }),
  
  refreshToken: (token: string) => 
    api.post('/auth/refresh-token', { refreshToken: token }),
  
  logout: (refreshToken: string) => 
    api.post('/auth/logout', { refreshToken }),
};
