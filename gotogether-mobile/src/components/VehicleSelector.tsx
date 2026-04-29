import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface VehicleSelectorProps {
  selected: 'bike' | 'car' | null;
  onSelect: (type: 'bike' | 'car') => void;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.item, selected === 'bike' && styles.selectedItem]}
        onPress={() => onSelect('bike')}
      >
        <MaterialCommunityIcons
          name="motorbike"
          size={32}
          color={selected === 'bike' ? Colors.primary : Colors.muted}
        />
        <Text style={[styles.label, selected === 'bike' && styles.selectedLabel]}>Bike</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.item, selected === 'car' && styles.selectedItem]}
        onPress={() => onSelect('car')}
      >
        <MaterialCommunityIcons
          name="car"
          size={32}
          color={selected === 'car' ? Colors.primary : Colors.muted}
        />
        <Text style={[styles.label, selected === 'car' && styles.selectedLabel]}>Car</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: Spacing.md,
  },
  item: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  label: {
    marginTop: Spacing.sm,
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.muted,
  },
  selectedLabel: {
    color: Colors.primary,
    fontWeight: Typography.weight.bold as any,
  },
});

export default VehicleSelector;
