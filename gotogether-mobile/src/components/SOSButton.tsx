import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { BorderRadius } from '../constants/Spacing';

interface SOSButtonProps {
  onPress: () => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onPress }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.5]) }],
      opacity: interpolate(pulse.value, [0, 1], [0.6, 0]),
    };
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <Text style={styles.text}>SOS</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.danger,
  },
  text: {
    color: Colors.white,
    fontFamily: Typography.family.display,
    fontWeight: Typography.weight.bold as any,
    fontSize: 16,
  },
});

export default SOSButton;
