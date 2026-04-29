import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

// Screens
import HomeScreen from '../screens/Shared/HomeScreen';
import SearchRideScreen from '../screens/Seeker/SearchRideScreen';
import NotificationsScreen from '../screens/Shared/NotificationsScreen';
import ProfileScreen from '../screens/Shared/ProfileScreen';
import CreateRideScreen from '../screens/Provider/CreateRideScreen';
import ActiveRideScreen from '../screens/Provider/ActiveRideScreen';
import RideDetailScreen from '../screens/Seeker/RideDetailScreen';
import TrackRideScreen from '../screens/Seeker/TrackRideScreen';
import RideCompletedScreen from '../screens/Seeker/RideCompletedScreen';
import SettingsScreen from '../screens/Shared/SettingsScreen';
import RideHistoryScreen from '../screens/Shared/RideHistoryScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  CreateRide: undefined;
  ActiveRide: { rideId: string };
  RideDetail: { rideId: string };
  TrackRide: { rideId: string };
  RideCompleted: { rideId: string };
  Settings: undefined;
  RideHistory: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Notifications') iconName = 'notifications';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchRideScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="CreateRide" component={CreateRideScreen} />
      <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
      <Stack.Screen name="RideDetail" component={RideDetailScreen} />
      <Stack.Screen name="TrackRide" component={TrackRideScreen} />
      <Stack.Screen name="RideCompleted" component={RideCompletedScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
