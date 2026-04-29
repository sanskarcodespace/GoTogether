import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: Colors.secondary + '20', color: Colors.secondary };
      case 'warning':
        return { backgroundColor: Colors.accent + '20', color: Colors.accent };
      case 'danger':
        return { backgroundColor: Colors.danger + '20', color: Colors.danger };
      case 'info':
        return { backgroundColor: Colors.primary + '20', color: Colors.primary };
      default:
        return { backgroundColor: Colors.muted + '20', color: Colors.muted };
    }
  };

  const styles_v = getVariantStyles();

  return (
    <View style={[styles.badge, { backgroundColor: styles_v.backgroundColor }]}>
      <Text style={[styles.text, { color: styles_v.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.body,
    fontWeight: Typography.weight.bold as any,
    textTransform: 'uppercase',
  },
});

export default Badge;
