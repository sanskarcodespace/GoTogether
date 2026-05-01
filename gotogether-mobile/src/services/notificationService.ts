import api from './api';

export const notificationService = {
  getNotifications: (params: any) => 
    api.get('/notifications', { params }),
  
  markAllRead: () => api.put('/notifications/read-all'),
  
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};
