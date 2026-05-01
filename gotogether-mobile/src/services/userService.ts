import api from './api';

export const userService = {
  getMe: () => api.get('/users/me'),
  
  updateProfile: (formData: FormData) => 
    api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  updateFCMToken: (token: string) => 
    api.put('/users/fcm-token', { fcmToken: token }),
  
  getPublicProfile: (userId: string) => 
    api.get(`/users/${userId}/public-profile`),
};
