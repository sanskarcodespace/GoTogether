import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import RootNavigator from './src/navigation';
import { useAuthStore } from './src/store/authStore';
import { socketService } from './src/services/socketService';
import { presenceService } from './src/services/presenceService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import AppCrashScreen from './src/screens/Common/AppCrashScreen';

const logToSentry = (error: Error, errorInfo: React.ErrorInfo) => {
  // Mock Sentry logging
  console.log('[Sentry Log] App crashed:', error.message, errorInfo);
};

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

  return (
    <ErrorBoundary fallback={<AppCrashScreen />} onError={logToSentry}>
      <RootNavigator />
    </ErrorBoundary>
  );
}
