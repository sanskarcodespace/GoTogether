import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

// ─── Tab screens (always loaded — part of the initial shell) ─────────────────
import HomeScreen          from '../screens/Shared/HomeScreen';
import SearchRideScreen    from '../screens/Seeker/SearchRideScreen';
import NotificationsScreen from '../screens/Shared/NotificationsScreen';
import ProfileScreen       from '../screens/Shared/ProfileScreen';

// ─── Stack screens — lazy loaded on first navigation ────────────────────────
// React Navigation does not use React.lazy; instead we use getComponent prop
// which defers the import until the screen is first visited.
const lazyScreen = (importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
  const Component = React.lazy(importFn);
  return (props: any) => (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

const CreateRideScreen    = lazyScreen(() => import('../screens/Provider/CreateRideScreen'));
const ActiveRideScreen    = lazyScreen(() => import('../screens/Provider/ActiveRideScreen'));
const RideDetailScreen    = lazyScreen(() => import('../screens/Seeker/RideDetailScreen'));
const TrackRideScreen     = lazyScreen(() => import('../screens/Seeker/TrackRideScreen'));
const RideCompletedScreen = lazyScreen(() => import('../screens/Seeker/RideCompletedScreen'));
const SettingsScreen      = lazyScreen(() => import('../screens/Shared/SettingsScreen'));
const RideHistoryScreen   = lazyScreen(() => import('../screens/Shared/RideHistoryScreen'));

export type AppStackParamList = {
  MainTabs:     undefined;
  CreateRide:   undefined;
  ActiveRide:   { rideId: string };
  RideDetail:   { rideId: string };
  TrackRide:    { rideId: string };
  RideCompleted:{ rideId: string };
  Settings:     undefined;
  RideHistory:  undefined;
};

const Stack = createStackNavigator<AppStackParamList>();
const Tab   = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor:   Colors.primary,
      tabBarInactiveTintColor: Colors.muted,
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, string> = {
          Home:          'home',
          Search:        'search',
          Notifications: 'notifications',
          Profile:       'person',
        };
        return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home"          component={HomeScreen} />
    <Tab.Screen name="Search"        component={SearchRideScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile"       component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Shell — always present */}
    <Stack.Screen name="MainTabs" component={TabNavigator} />

    {/* Lazily-loaded feature screens */}
    <Stack.Screen name="CreateRide"    component={CreateRideScreen} />
    <Stack.Screen name="ActiveRide"    component={ActiveRideScreen} />
    <Stack.Screen name="RideDetail"    component={RideDetailScreen} />
    <Stack.Screen name="TrackRide"     component={TrackRideScreen} />
    <Stack.Screen name="RideCompleted" component={RideCompletedScreen} />
    <Stack.Screen name="Settings"      component={SettingsScreen} />
    <Stack.Screen name="RideHistory"   component={RideHistoryScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
