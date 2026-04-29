import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, Input, Avatar, ScrollScreen, VehicleSelector } from '../../components';

const ProfileSetupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState<'bike' | 'car' | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigation to Home (AppNavigator will take over because isAuthenticated is true)
      // For now, just navigate to MainTabs
    }, 1500);
  };

  return (
    <ScrollScreen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete your profile</Text>
        
        <View style={styles.avatarContainer}>
          <Avatar size="xl" name={name || 'User'} />
          <Button label="Upload Photo" variant="ghost" size="sm" onPress={() => {}} />
        </View>

        <Input
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.sectionTitle}>Are you a provider? (Optional)</Text>
        <Text style={styles.sectionSubtitle}>Add vehicle details to share your ride.</Text>

        <VehicleSelector selected={vehicleType} onSelect={setVehicleType} />

        {vehicleType && (
          <Input
            label="Vehicle Number"
            placeholder="e.g. DL 01 AB 1234"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
          />
        )}

        <Button
          label="Complete Setup"
          onPress={handleComplete}
          loading={loading}
          fullWidth
          style={styles.button}
        />
      </View>
    </ScrollScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.md,
    color: Colors.dark,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
  },
  sectionSubtitle: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  button: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
});

export default ProfileSetupScreen;
