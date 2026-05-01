import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Share, Linking, TextInput } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, Card, Avatar, SOSButton, BottomSheet } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { getDatabase, ref, set, remove } from 'firebase/database';
import { app } from '../../config/firebase'; // Assume it exists
import { useRideStore } from '../../store/rideStore';

const { height } = Dimensions.get('window');

const ActiveRideScreen = ({ navigation, route }: any) => {
  const rideId = route.params?.rideId || 'new';
  const [showRequests, setShowRequests] = useState(true);
  const [otp, setOtp] = useState('');
  const [isNearSeeker, setIsNearSeeker] = useState(false); // mock nearby
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  const { activeRide } = useRideStore();

  useEffect(() => {
    let mounted = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (location) => {
          if (mounted) setCurrentLocation(location);

          // Write to Firebase RTDB
          const db = getDatabase(app);
          const locationRef = ref(db, `active_rides/${rideId}/provider_location`);
          set(locationRef, {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: Date.now(),
          });

          // Mocking near seeker logic
          if (activeRide?.passengers?.length && !isNearSeeker) {
             setIsNearSeeker(true);
          }
        }
      );
    };

    startTracking();

    return () => {
      mounted = false;
      if (locationSubRef.current) {
        locationSubRef.current.remove();
      }
      // Remove from RTDB on unmount
      const db = getDatabase(app);
      remove(ref(db, `active_rides/${rideId}/provider_location`));
    };
  }, [rideId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm on a ride with GoTogether. Track me here: gotogether://ride/${rideId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerifyOTP = async (requestId: string) => {
    try {
      await api.post(`/rides/requests/${requestId}/verify-otp`, { otp });
      Alert.alert('Success', 'OTP Verified! Passenger boarded.');
      setOtp('');
      setShowRequests(false);
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  const handleEndRide = async () => {
    try {
      await api.put(`/rides/${rideId}/complete`);
      navigation.navigate('RideCompleted', { rideId });
    } catch (error) {
      console.log('Error completing ride', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.coords.latitude || 28.6139,
          longitude: currentLocation?.coords.longitude || 77.209,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            pinColor="blue"
          />
        )}
      </MapView>

      <View style={styles.header}>
        <Card variant="elevated" padding="md" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>You are Live - Offering Ride</Text>
            <Button label="Share" variant="outline" onPress={handleShare} style={{ marginLeft: 'auto', height: 30 }} />
          </View>
        </Card>
      </View>

      <View style={styles.sosContainer}>
        <SOSButton rideId={rideId} />
      </View>

      <BottomSheet isVisible={showRequests} onClose={() => setShowRequests(false)}>
        <Text style={styles.sheetTitle}>Ride Passengers & Requests</Text>
        
        {/* Render accepted passengers needing OTP */}
        {isNearSeeker && (
          <Card variant="default" padding="md" style={styles.requestCard}>
            <Text style={styles.requesterName}>Seeker is Nearby</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter Seeker OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />
            <Button label="Verify & Board" variant="primary" onPress={() => handleVerifyOTP('some-request-id')} style={{ marginTop: 10 }} />
          </Card>
        )}

        <Button
          label="End Ride"
          variant="danger"
          onPress={handleEndRide}
          fullWidth
          style={styles.endBtn}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  header: { position: 'absolute', top: 60, left: 20, right: 20 },
  statusCard: { borderRadius: BorderRadius.full },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.secondary, marginRight: 10 },
  statusText: { fontFamily: Typography.family.body, fontSize: Typography.size.sm, color: Colors.dark, fontWeight: 'bold' },
  sosContainer: { position: 'absolute', right: 20, top: 150 },
  sheetTitle: { fontFamily: Typography.family.display, fontSize: Typography.size.lg, color: Colors.dark, fontWeight: 'bold', marginBottom: Spacing.md },
  requestCard: { marginBottom: Spacing.md },
  requestHeader: { flexDirection: 'row', alignItems: 'center' },
  requestInfo: { marginLeft: Spacing.md },
  requesterName: { fontFamily: Typography.family.body, fontSize: Typography.size.base, fontWeight: 'bold', color: Colors.dark, marginBottom: Spacing.sm },
  requestMeta: { fontSize: Typography.size.xs, color: Colors.muted },
  requestActions: { flexDirection: 'row', marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  actionBtn: { flex: 1, marginHorizontal: 5 },
  endBtn: { marginTop: Spacing.md },
  otpInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: Typography.size.md, textAlign: 'center', letterSpacing: 5 },
});

export default ActiveRideScreen;
