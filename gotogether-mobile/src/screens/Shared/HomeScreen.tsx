import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, SafeScreen, Card } from '../../components';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const [role, setRole] = useState<'seeker' | 'provider'>('seeker');

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.209,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />

      <View style={styles.header}>
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, role === 'seeker' && styles.activeToggle]}
            onPress={() => setRole('seeker')}
          >
            <Text style={[styles.toggleText, role === 'seeker' && styles.activeToggleText]}>Seeker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, role === 'provider' && styles.activeToggle]}
            onPress={() => setRole('provider')}
          >
            <Text style={[styles.toggleText, role === 'provider' && styles.activeToggleText]}>Provider</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContent}>
        <Card variant="elevated" padding="lg" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹1,240</Text>
              <Text style={styles.statLabel}>Savings</Text>
            </View>
          </View>
        </Card>

        <Button
          label={role === 'seeker' ? 'Find a Ride' : 'Start a Ride'}
          onPress={() => role === 'seeker' ? navigation.navigate('Search') : navigation.navigate('CreateRide')}
          fullWidth
          icon={<Ionicons name={role === 'seeker' ? 'search' : 'add'} size={20} color={Colors.white} />}
          style={styles.mainAction}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: 4,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  activeToggle: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.muted,
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: Colors.white,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: 110, // Avoid tab bar
  },
  statsCard: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.lg,
    color: Colors.dark,
    fontWeight: 'bold',
  },
  statLabel: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  mainAction: {
    height: 60,
    borderRadius: 16,
  },
});

export default HomeScreen;
