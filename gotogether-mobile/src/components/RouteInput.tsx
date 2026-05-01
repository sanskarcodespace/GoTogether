import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/Spacing';
import Input from './Input';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface RouteInputProps {
  fromValue?: string;
  toValue?: string;
  onFromChange: (data: any, details: any) => void;
  onToChange: (data: any, details: any) => void;
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
        <View style={styles.autocompleteContainer}>
          <Ionicons name="radio-button-on" size={20} color={Colors.primary} style={styles.icon} />
          <GooglePlacesAutocomplete
            placeholder="Pickup location"
            onPress={(data, details = null) => onFromChange(data, details)}
            query={{ key: GOOGLE_PLACES_API_KEY, language: 'en', components: 'country:in' }}
            fetchDetails={true}
            textInputProps={{ value: fromValue }}
            styles={autocompleteStyles}
          />
        </View>
        <View style={styles.connector}>
          <View style={styles.line} />
        </View>
        <View style={styles.autocompleteContainer}>
          <Ionicons name="location" size={20} color={Colors.secondary} style={styles.icon} />
          <GooglePlacesAutocomplete
            placeholder="Where to?"
            onPress={(data, details = null) => onToChange(data, details)}
            query={{ key: GOOGLE_PLACES_API_KEY, language: 'en', components: 'country:in' }}
            fetchDetails={true}
            textInputProps={{ value: toValue }}
            styles={autocompleteStyles}
          />
        </View>
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
  autocompleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 50,
    zIndex: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
});

const autocompleteStyles = {
  container: {
    flex: 1,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    backgroundColor: 'transparent',
    height: 38,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  listView: {
    position: 'absolute',
    top: 50,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
    elevation: 3,
    zIndex: 1000,
  },
};

// Need to import Shadows but it's in Layout.ts, I'll add it to styles
import { Shadows } from '../constants/Layout';

export default RouteInput;
