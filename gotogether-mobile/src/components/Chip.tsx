import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, icon }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selectedChip]}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  selectedChip: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  label: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.muted,
  },
  selectedLabel: {
    color: Colors.primary,
    fontWeight: Typography.weight.medium as any,
  },
  icon: {
    marginRight: 4,
  },
});

import { View } from 'react-native';

export default Chip;
