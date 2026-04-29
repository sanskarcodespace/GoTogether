import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/Spacing';
import Input from './Input';

interface RouteInputProps {
  fromValue: string;
  toValue: string;
  onFromChange: (text: string) => void;
  onToChange: (text: string) => void;
  onSwap?: () => void;
  onLocationPress?: (type: 'from' | 'to') => void;
}

const RouteInput: React.FC<RouteInputProps> = ({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  onSwap,
  onLocationPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
        <Input
          placeholder="Pickup location"
          value={fromValue}
          onChangeText={onFromChange}
          leftIcon={<Ionicons name="radio-button-on" size={20} color={Colors.primary} />}
          rightIcon={
            onLocationPress && (
              <TouchableOpacity onPress={() => onLocationPress('from')}>
                <Ionicons name="locate" size={20} color={Colors.muted} />
              </TouchableOpacity>
            )
          }
          style={styles.input}
        />
        <View style={styles.connector}>
          <View style={styles.line} />
        </View>
        <Input
          placeholder="Where to?"
          value={toValue}
          onChangeText={onToChange}
          leftIcon={<Ionicons name="location" size={20} color={Colors.secondary} />}
          style={styles.input}
        />
      </View>
      {onSwap && (
        <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
          <Ionicons name="swap-vertical" size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  inputsWrapper: {
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  connector: {
    height: 10,
    marginLeft: 25,
    justifyContent: 'center',
  },
  line: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  swapButton: {
    marginLeft: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
  },
});

// Need to import Shadows but it's in Layout.ts, I'll add it to styles
import { Shadows } from '../constants/Layout';

export default RouteInput;
