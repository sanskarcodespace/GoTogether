import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { userService } from './userService';
import { useAuthStore } from '../store/authStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const pushService = {
  registerForPushNotificationsAsync: async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Update backend with FCM token
      if (token) {
        try {
          await userService.updateFCMToken(token);
          useAuthStore.getState().updateProfile({ fcmToken: token });
        } catch (error) {
          console.error('Failed to update FCM token on backend', error);
        }
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  },

  handleNotifications: (navigation: any) => {
    // Foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received in foreground:', notification);
    });

    // Background/Terminated (Tapped)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      console.log('Notification Tapped:', data);
      
      if (data.type === 'RIDE_REQUEST') {
        navigation.navigate('ActiveRide');
      }
      // Add more navigation logic based on data.type
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  },
};
