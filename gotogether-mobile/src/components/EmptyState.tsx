import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.hasIcon; // Simplified for typing
  onAction?: () => void;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'search-outline',
  onAction,
  actionLabel,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={80} color={Colors.muted + '40'} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onAction && actionLabel && (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.lg,
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: Typography.weight.bold as any,
  },
  description: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});

export default EmptyState;
