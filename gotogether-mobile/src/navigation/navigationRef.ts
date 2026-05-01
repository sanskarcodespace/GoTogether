import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * A global navigation ref that lets non-component code (e.g. socketService)
 * imperatively navigate, the same way you would from within a component.
 *
 * Usage:
 *   import { navigationRef } from '../navigation/navigationRef';
 *   navigationRef.navigate('TrackRide', { rideId });
 */
export const navigationRef = createNavigationContainerRef<any>();

export function navigate(screen: string, params?: Record<string, unknown>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(screen as never, params as never);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset(routeName: string) {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: routeName }] });
  }
}
