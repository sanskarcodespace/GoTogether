import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    opacity.value = withSpring(1);
    scale.value = withSpring(1);

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // Navigation is handled by RootNavigator usually, but just in case
      } else {
        navigation.replace('Welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>GT</Text>
        </View>
        <Text style={styles.appName}>GoTogether</Text>
        <Text style={styles.tagline}>Share your journey, travel smarter</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  appName: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size['3xl'],
    color: Colors.white,
    fontWeight: 'bold',
  },
  tagline: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.white,
    marginTop: 10,
    opacity: 0.8,
  },
});

export default SplashScreen;
