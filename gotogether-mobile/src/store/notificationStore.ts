import { create } from 'zustand';

interface NotificationState {
  notifications: any[];
  unreadCount: number;
  addNotification: (notification: any) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
  setNotifications: (notifications: any[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    })),
  markRead: (id) => 
    set((state) => ({
      notifications: state.notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    })),
  markAllRead: () => 
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifications: (notifications) => set({ notifications }),
}));
