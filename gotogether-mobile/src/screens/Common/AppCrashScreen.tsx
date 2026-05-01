import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function AppCrashScreen() {
  // If we had a reset function passed down, we could call it here.
  // For a fatal crash, sometimes a reload requires native restarting, 
  // but we provide a generic UI here.
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.message}>
        We encountered an unexpected error. Please restart the app or try again later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.white,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.error,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
