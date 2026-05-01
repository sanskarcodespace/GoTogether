import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import RootNavigator from './src/navigation';
import { useAuthStore } from './src/store/authStore';
import { socketService } from './src/services/socketService';
import { presenceService } from './src/services/presenceService';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      presenceService.init();
    } else {
      socketService.disconnect();
      presenceService.cleanup();
    }
  }, [isAuthenticated]);

  return <RootNavigator />;
}
