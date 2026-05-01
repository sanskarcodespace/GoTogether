import { Platform, ToastAndroid, Alert } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  // In a real app, you might use a library like react-native-root-toast
  // or a custom context-based toast system.
  // For now, we map it to native elements.
  
  const prefix = type === 'error' ? '❌ Error: ' : type === 'success' ? '✅ Success: ' : type === 'warning' ? '⚠️ Warning: ' : 'ℹ️ Info: ';
  
  if (Platform.OS === 'android') {
    const androidDuration = duration > 2000 ? ToastAndroid.LONG : ToastAndroid.SHORT;
    ToastAndroid.show(`${prefix}${message}`, androidDuration);
  } else {
    // Alert is blocking on iOS, but it's the native fallback without extra libs
    Alert.alert(
      type.toUpperCase(),
      message,
      [{ text: 'OK' }]
    );
  }
};
