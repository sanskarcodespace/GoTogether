import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { ScrollScreen, Card, Button } from '../../components';

const SettingsScreen = () => {
  return (
    <ScrollScreen style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <Card variant="elevated" padding="lg" style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Text style={styles.placeholder}>Notification settings will appear here.</Text>
      </Card>

      <Card variant="elevated" padding="lg" style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.placeholder}>Privacy settings will appear here.</Text>
      </Card>

      <Button
        label="Delete Account"
        variant="danger"
        onPress={() => {}}
        fullWidth
        style={styles.deleteBtn}
      />
    </ScrollScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.md,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  placeholder: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
  },
  deleteBtn: {
    marginTop: Spacing['2xl'],
    opacity: 0.8,
  },
});

export default SettingsScreen;
