/**
 * ActiveRideScreen — Provider side
 *
 * Responsibilities:
 *  • Watch GPS and write to Firebase RTDB every 3 s / 10 m
 *  • Emit socket events (accept, cancel, complete) at the right lifecycle points
 *  • Provide OTP boarding verification for each passenger
 *  • Clean up Firebase path + socket room on unmount / ride end
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  Alert, Share, TextInput,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ref, set, remove } from 'firebase/database';

import { Colors }                  from '../../constants/Colors';
import { Typography }              from '../../constants/Typography';
import { Spacing, BorderRadius }   from '../../constants/Spacing';
import { Button, Card, SOSButton, BottomSheet } from '../../components';
import { Ionicons }               from '@expo/vector-icons';
import api                         from '../../services/api';
import { database }               from '../../config/firebase';
import { socketService }          from '../../services/socketService';
import { useRideStore }           from '../../store/rideStore';
import { useAuthStore }           from '../../store/authStore';

const { height } = Dimensions.get('window');

const ActiveRideScreen = ({ navigation, route }: any) => {
  const rideId       = route.params?.rideId as string;
  const { activeRide }  = useRideStore();
  const { user }        = useAuthStore();

  const [otp, setOtp]                   = useState('');
  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const [isNearSeeker, setIsNearSeeker] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const rtdbLocationRef = ref(database, `active_rides/${rideId}/provider_location`);

  // ── GPS tracking ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (location) => {
          if (!mounted) return;
          setCurrentLocation(location);

          const { latitude: lat, longitude: lng, heading, speed } = location.coords;

          // ① Primary: Firebase RTDB
          set(rtdbLocationRef, {
            lat, lng,
            heading: heading ?? 0,
            speed:   speed   ?? 0,
            timestamp: Date.now(),
          });

          // ② Fallback: tracking socket (if Firebase is unavailable)
          socketService.emitLocationUpdate({ rideId, lat, lng, heading: heading ?? 0, speed: speed ?? 0 });
        },
      );
    })();

    // Join socket room for this ride
    socketService.joinRideRoom(rideId);

    return () => {
      mounted = false;
      locationSubRef.current?.remove();
      // Remove entire ride node from RTDB on unmount
      remove(ref(database, `active_rides/${rideId}`));
    };
  }, [rideId]);

  // ── Share live-tracking link ───────────────────────────────────────────────
  const handleShare = async () => {
    await Share.share({
      message: `Track my GoTogether ride: gotogether://ride/${rideId}`,
    });
  };

  // ── OTP boarding verification ─────────────────────────────────────────────
  const handleVerifyOTP = useCallback(async (requestId: string) => {
    try {
      const res = await api.post(`/rides/requests/${requestId}/verify-otp`, { otp });
      Alert.alert('Boarded ✓', 'OTP verified — passenger is on board!');
      setOtp('');

      // Tell the seeker via socket
      const request = activeRide?.passengers?.find((p: any) => p.request === requestId);
      if (request?.seeker?._id) {
        socketService.emitAcceptRide({
          rideId,
          requestId,
          seekerId: request.seeker._id,
          otp,
          providerLocation: currentLocation
            ? { lat: currentLocation.coords.latitude, lng: currentLocation.coords.longitude }
            : { lat: 0, lng: 0 },
        });
      }
    } catch {
      Alert.alert('Error', 'Invalid OTP — please try again.');
    }
  }, [otp, rideId, activeRide, currentLocation]);

  // ── Complete ride ─────────────────────────────────────────────────────────
  const handleEndRide = () => {
    Alert.alert('End Ride', 'Are you sure you want to complete this ride?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Ride',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/rides/${rideId}/complete`);
            // Broadcast to all passengers
            socketService.emitCompleteRide(rideId);
            // Firebase cleanup
            await remove(ref(database, `active_rides/${rideId}`));
            navigation.replace('RideCompleted', { rideId });
          } catch {
            Alert.alert('Error', 'Could not end ride. Please try again.');
          }
        },
      },
    ]);
  };

  // ── Cancel ride ───────────────────────────────────────────────────────────
  const handleCancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure? This cannot be undone.', [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel Ride',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/rides/${rideId}/cancel`, { reason: 'Cancelled by provider' });
            // Notify passengers
            if (activeRide?.passengers?.length) {
              activeRide.passengers.forEach((p: any) => {
                socketService.emitCancelRide({
                  rideId,
                  by: 'provider',
                  reason: 'Ride cancelled by the driver.',
                  otherPartyId: p.seeker?._id,
                });
              });
            }
            await remove(ref(database, `active_rides/${rideId}`));
            navigation.replace('ProviderHome');
          } catch {
            Alert.alert('Error', 'Could not cancel ride.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude:  currentLocation?.coords.latitude  ?? 28.6139,
          longitude: currentLocation?.coords.longitude ?? 77.209,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude:  currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            pinColor="blue"
          />
        )}
      </MapView>

      {/* ── Status bar ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Card variant="elevated" padding="md" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Live — Ride in Progress</Text>
            <Button
              label="Share"
              variant="outline"
              onPress={handleShare}
              style={styles.shareBtn}
            />
          </View>
        </Card>
      </View>

      {/* ── SOS ────────────────────────────────────────────────────────── */}
      <View style={styles.sosContainer}>
        <SOSButton rideId={rideId} />
      </View>

      {/* ── Bottom sheet ────────────────────────────────────────────────── */}
      <BottomSheet isVisible={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
        <Text style={styles.sheetTitle}>Passengers</Text>

        {/* OTP boarding card — shown once provider is near a seeker */}
        {isNearSeeker && activeRide?.passengers?.length > 0 && (
          <Card variant="default" padding="md" style={styles.requestCard}>
            <Text style={styles.requesterName}>Passenger nearby — enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="4-digit OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />
            <Button
              label="Verify & Board"
              variant="primary"
              onPress={() =>
                handleVerifyOTP(activeRide.passengers[0]?.request ?? '')
              }
              style={{ marginTop: Spacing.sm }}
            />
          </Card>
        )}

        <Button
          label="End Ride"
          variant="danger"
          onPress={handleEndRide}
          fullWidth
          style={styles.endBtn}
        />
        <Button
          label="Cancel Ride"
          variant="outline"
          onPress={handleCancelRide}
          fullWidth
          style={styles.cancelBtn}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  map:              { ...StyleSheet.absoluteFillObject },
  header:           { position: 'absolute', top: 60, left: 20, right: 20 },
  statusCard:       { borderRadius: BorderRadius.full },
  statusRow:        { flexDirection: 'row', alignItems: 'center' },
  statusIndicator:  {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.secondary, marginRight: 10,
  },
  statusText:       {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.dark, fontWeight: 'bold', flex: 1,
  },
  shareBtn:         { height: 30 },
  sosContainer:     { position: 'absolute', right: 20, top: 150 },
  sheetTitle:       {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.lg,
    color: Colors.dark, fontWeight: 'bold', marginBottom: Spacing.md,
  },
  requestCard:      { marginBottom: Spacing.md },
  requesterName:    {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base, fontWeight: 'bold',
    color: Colors.dark, marginBottom: Spacing.sm,
  },
  otpInput:         {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    fontSize: Typography.size.md, textAlign: 'center', letterSpacing: 5,
  },
  endBtn:           { marginTop: Spacing.md },
  cancelBtn:        { marginTop: Spacing.sm },
});

export default ActiveRideScreen;
