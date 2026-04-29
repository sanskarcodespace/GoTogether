import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/Auth/SplashScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import PhoneLoginScreen from '../screens/Auth/PhoneLoginScreen';
import OTPVerifyScreen from '../screens/Auth/OTPVerifyScreen';
import ProfileSetupScreen from '../screens/Auth/ProfileSetupScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  PhoneLogin: undefined;
  OTPVerify: { phoneNumber: string };
  ProfileSetup: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
