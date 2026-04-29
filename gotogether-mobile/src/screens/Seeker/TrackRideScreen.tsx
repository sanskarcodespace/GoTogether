import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, Card, Avatar, SOSButton, MapPin } from '../../components';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TrackRideScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.209,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={{ latitude: 28.62, longitude: 77.21 }}>
          <MapPin type="provider" active />
        </Marker>
        <Marker coordinate={{ latitude: 28.61, longitude: 77.20 }}>
          <MapPin type="seeker" />
        </Marker>
      </MapView>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.sosContainer}>
        <SOSButton onPress={() => {}} />
      </View>

      <View style={styles.bottomCard}>
        <Card variant="elevated" padding="lg">
          <View style={styles.etaRow}>
            <View>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaValue}>8 mins</Text>
            </View>
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Ride OTP</Text>
              <Text style={styles.otpValue}>4821</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.providerRow}>
            <Avatar name="Rahul Sharma" size="md" />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>Rahul Sharma</Text>
              <Text style={styles.vehicleInfo}>White Swift • DL 01 AB 1234</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Button
            label="Ride Completed"
            onPress={() => navigation.navigate('RideCompleted', { rideId: '1' })}
            fullWidth
            style={styles.doneBtn}
          />
        </Card>
      </View>
    </View>
  );
};

import { TouchableOpacity } from 'react-native';

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
    left: 20,
  },
  backBtn: {
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: BorderRadius.full,
    elevation: 4,
  },
  sosContainer: {
    position: 'absolute',
    right: 20,
    top: 60,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  etaLabel: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  etaValue: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  otpContainer: {
    alignItems: 'flex-end',
  },
  otpLabel: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  otpValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.size.lg,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  providerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  providerName: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  vehicleInfo: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtn: {
    height: 50,
  },
});

export default TrackRideScreen;
