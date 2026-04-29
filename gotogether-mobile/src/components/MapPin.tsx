import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface MapPinProps {
  type: 'provider' | 'seeker' | 'pickup' | 'destination';
  active?: boolean;
}

const MapPin: React.FC<MapPinProps> = ({ type, active = false }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(withTiming(1.5, { duration: 1000 }), -1, true);
      opacity.value = withRepeat(withTiming(0, { duration: 1000 }), -1, false);
    }
  }, [active]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getIcon = () => {
    switch (type) {
      case 'provider':
        return <MaterialCommunityIcons name="car" size={20} color={Colors.white} />;
      case 'seeker':
        return <Ionicons name="person" size={16} color={Colors.white} />;
      case 'pickup':
        return <Ionicons name="location" size={18} color={Colors.white} />;
      case 'destination':
        return <Ionicons name="flag" size={18} color={Colors.white} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'provider':
        return Colors.primary;
      case 'seeker':
        return Colors.secondary;
      case 'pickup':
        return Colors.accent;
      case 'destination':
        return Colors.danger;
    }
  };

  return (
    <View style={styles.container}>
      {active && <Animated.View style={[styles.pulse, pulseStyle, { backgroundColor: getColor() }]} />}
      <View style={[styles.pin, { backgroundColor: getColor() }]}>
        {getIcon()}
      </View>
      <View style={[styles.triangle, { borderTopColor: getColor() }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 1,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});

export default MapPin;
