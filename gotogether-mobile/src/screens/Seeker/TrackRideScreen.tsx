/**
 * TrackRideScreen — Seeker side
 *
 * Responsibilities:
 *  • Subscribe to Firebase RTDB for live provider GPS (primary)
 *  • Subscribe to /tracking socket for GPS (fallback)
 *  • Smooth map animation on each update
 *  • Poll Distance Matrix API every 30 s for ETA
 *  • Display ride timeline & OTP
 *  • Allow seeker to cancel ride
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { ref, onValue, off } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

import { Colors }                 from '../../constants/Colors';
import { Typography }             from '../../constants/Typography';
import { Spacing, BorderRadius }  from '../../constants/Spacing';
import { Button, Card, Avatar, SOSButton, MapPin } from '../../components';
import { database }              from '../../config/firebase';
import { socketService }         from '../../services/socketService';
import { useRideStore }          from '../../store/rideStore';
import { useAuthStore }          from '../../store/authStore';
import api                        from '../../services/api';

const { width } = Dimensions.get('window');

// ─── Ride timeline steps ──────────────────────────────────────────────────────
const STEPS = [
  { key: 'accepted',    icon: 'checkmark-circle-outline', label: 'Accepted' },
  { key: 'en_route',   icon: 'car-outline',               label: 'En Route' },
  { key: 'arrived',    icon: 'location-outline',          label: 'Arrived' },
  { key: 'in_progress',icon: 'play-circle-outline',       label: 'In Ride' },
  { key: 'completed',  icon: 'flag-outline',              label: 'Done' },
] as const;

const stepIndex = (status: string) => STEPS.findIndex(s => s.key === status);

// ─── Component ────────────────────────────────────────────────────────────────
const TrackRideScreen = ({ navigation, route }: any) => {
  const mapRef           = useRef<MapView>(null);
  const { activeRide }   = useRideStore();
  const { user }         = useAuthStore();
  const rideId           = route.params?.rideId ?? activeRide?._id;

  const [providerCoord, setProviderCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [eta,           setEta]           = useState('Calculating…');
  const currentStatus                     = activeRide?.status ?? 'accepted';

  // ── Firebase RTDB subscription (primary GPS source) ───────────────────────
  useEffect(() => {
    if (!rideId) return;

    const locationRef = ref(database, `active_rides/${rideId}/provider_location`);

    const handleSnapshot = (snapshot: any) => {
      const data = snapshot.val();
      if (data?.lat && data?.lng) {
        setProviderCoord({ latitude: data.lat, longitude: data.lng });
      }
    };

    onValue(locationRef, handleSnapshot);
    return () => off(locationRef, 'value', handleSnapshot);
  }, [rideId]);

  // ── Socket /tracking fallback ──────────────────────────────────────────────
  useEffect(() => {
    if (!rideId) return;

    socketService.joinRideRoom(rideId);

    const trackingSocket = socketService.trackingSocket;
    const handler = (data: { lat: number; lng: number }) => {
      // Only use if Firebase hasn't already updated (Firebase takes priority)
      setProviderCoord(prev => prev ?? { latitude: data.lat, longitude: data.lng });
    };

    trackingSocket?.on('provider_location', handler);
    return () => {
      trackingSocket?.off('provider_location', handler);
    };
  }, [rideId]);

  // ── Smooth map animation on GPS update ────────────────────────────────────
  useEffect(() => {
    if (providerCoord && mapRef.current) {
      mapRef.current.animateCamera({
        center: providerCoord,
        zoom: 15,
        pitch: 0,
        heading: 0,
        altitude: 1000,
      });
    }
  }, [providerCoord]);

  // ── ETA polling every 30 s ────────────────────────────────────────────────
  const fetchEta = useCallback(async () => {
    if (!providerCoord || !activeRide?.fromCoordinates) return;
    try {
      const res = await api.get('/rides/suggested-price', {
        params: {
          startLat: providerCoord.latitude,
          startLng: providerCoord.longitude,
          endLat:   activeRide.fromCoordinates.latitude,
          endLng:   activeRide.fromCoordinates.longitude,
          type: 'car',
        },
      });
      const mins = res.data?.data?.durationMinutes;
      if (mins !== undefined) setEta(`${mins} min`);
    } catch {
      // Silent — show cached value
    }
  }, [providerCoord, activeRide?.fromCoordinates]);

  useEffect(() => {
    fetchEta();
    const interval = setInterval(fetchEta, 30_000);
    return () => clearInterval(interval);
  }, [fetchEta]);

  // ── Cancel ride (seeker side) ─────────────────────────────────────────────
  const handleCancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/rides/${rideId}/cancel`, { reason: 'Cancelled by seeker' });
            socketService.emitCancelRide({
              rideId,
              by: 'seeker',
              reason: 'Seeker cancelled the ride.',
              otherPartyId: activeRide?.provider?._id ?? '',
            });
            navigation.replace('SearchRide');
          } catch {
            Alert.alert('Error', 'Could not cancel. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude:  activeRide?.fromCoordinates?.latitude  ?? 28.6139,
          longitude: activeRide?.fromCoordinates?.longitude ?? 77.209,
          latitudeDelta:  0.05,
          longitudeDelta: 0.02,
        }}
      >
        {/* Route polyline */}
        {activeRide?.routePolyline && (
          <Polyline
            coordinates={activeRide.routePolyline}
            strokeWidth={4}
            strokeColor={Colors.primary}
          />
        )}

        {/* Provider marker */}
        {providerCoord && (
          <Marker coordinate={providerCoord} anchor={{ x: 0.5, y: 0.5 }}>
            <MapPin type="provider" active />
          </Marker>
        )}

        {/* Pickup marker */}
        {activeRide?.fromCoordinates && (
          <Marker coordinate={activeRide.fromCoordinates} anchor={{ x: 0.5, y: 1 }}>
            <MapPin type="destination" />
          </Marker>
        )}
      </MapView>

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      {/* ── SOS ─────────────────────────────────────────────────────────── */}
      <View style={styles.sosContainer}>
        <SOSButton rideId={rideId} />
      </View>

      {/* ── Bottom info card ─────────────────────────────────────────────── */}
      <View style={styles.bottomCard}>
        <Card variant="elevated" padding="lg">

          {/* Timeline */}
          <View style={styles.timelineRow}>
            {STEPS.map((step, idx) => {
              const past   = stepIndex(currentStatus) > idx;
              const active = currentStatus === step.key;
              const color  = past || active ? Colors.secondary : Colors.muted;
              return (
                <View key={step.key} style={styles.timelineItem}>
                  <Ionicons name={step.icon as any} size={20} color={color} />
                  {idx < STEPS.length - 1 && (
                    <View style={[styles.timelineLine, past && styles.timelineLineActive]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* ETA + OTP */}
          <View style={styles.etaRow}>
            <View>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaValue}>{eta}</Text>
            </View>
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Your OTP</Text>
              <Text style={styles.otpValue}>{activeRide?.otp?.code ?? '----'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Provider info */}
          <View style={styles.providerRow}>
            <Avatar name={activeRide?.provider?.name ?? 'Provider'} size="md" />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{activeRide?.provider?.name}</Text>
              <Text style={styles.vehicleInfo}>
                {activeRide?.vehicle?.details ?? 'Vehicle'} •{' '}
                {activeRide?.vehicle?.plateNumber ?? '——'}
              </Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Cancel button */}
          {currentStatus !== 'completed' && currentStatus !== 'in_progress' && (
            <Button
              label="Cancel Ride"
              variant="outline"
              onPress={handleCancelRide}
              fullWidth
              style={styles.cancelBtn}
            />
          )}

          {/* Done — shown after completion (navigation driven by socket) */}
          {currentStatus === 'completed' && (
            <Button
              label="View Summary"
              onPress={() => navigation.replace('RideCompleted', { rideId })}
              fullWidth
              style={styles.doneBtn}
            />
          )}
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:           { flex: 1 },
  map:                 { ...StyleSheet.absoluteFillObject },
  header:              { position: 'absolute', top: 60, left: 20 },
  backBtn:             {
    backgroundColor: Colors.white, padding: 10,
    borderRadius: BorderRadius.full, elevation: 4,
  },
  sosContainer:        { position: 'absolute', right: 20, top: 60 },
  bottomCard:          { position: 'absolute', bottom: 40, left: 20, right: 20 },
  timelineRow:         {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  timelineItem:        { flexDirection: 'row', alignItems: 'center', flex: 1 },
  timelineLine:        { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: 5 },
  timelineLineActive:  { backgroundColor: Colors.secondary },
  etaRow:              {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  etaLabel:            { fontSize: Typography.size.xs, color: Colors.muted },
  etaValue:            {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl, color: Colors.secondary, fontWeight: 'bold',
  },
  otpContainer:        { alignItems: 'flex-end' },
  otpLabel:            { fontSize: Typography.size.xs, color: Colors.muted },
  otpValue:            {
    fontFamily: Typography.family.mono,
    fontSize: Typography.size.lg, color: Colors.primary, fontWeight: 'bold',
  },
  divider:             { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  providerRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  providerInfo:        { flex: 1, marginLeft: Spacing.md },
  providerName:        {
    fontFamily: Typography.family.body, fontSize: Typography.size.base,
    fontWeight: 'bold', color: Colors.dark,
  },
  vehicleInfo:         { fontSize: Typography.size.xs, color: Colors.muted },
  callBtn:             {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center', alignItems: 'center',
  },
  cancelBtn:           { marginTop: Spacing.sm },
  doneBtn:             { height: 50 },
});

export default TrackRideScreen;
