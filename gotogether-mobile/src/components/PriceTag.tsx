import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface PriceTagProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PriceTag: React.FC<PriceTagProps> = ({ amount, currency = '₹', size = 'md' }) => {
  const fontSize = size === 'sm' ? Typography.size.sm : size === 'lg' ? Typography.size.xl : Typography.size.md;

  return (
    <View style={styles.container}>
      <Text style={[styles.currency, { fontSize: fontSize * 0.7 }]}>{currency}</Text>
      <Text style={[styles.amount, { fontSize }]}>{amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  currency: {
    fontFamily: Typography.family.mono,
    color: Colors.primary,
    marginRight: 2,
    fontWeight: Typography.weight.bold as any,
  },
  amount: {
    fontFamily: Typography.family.mono,
    color: Colors.primary,
    fontWeight: Typography.weight.bold as any,
  },
});

export default PriceTag;
