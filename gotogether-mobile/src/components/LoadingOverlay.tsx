import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && <Text style={styles.text}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    marginTop: Spacing.md,
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.primary,
    fontWeight: Typography.weight.medium as any,
  },
});

export default LoadingOverlay;
