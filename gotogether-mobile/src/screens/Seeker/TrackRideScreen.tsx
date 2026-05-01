import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, Card, Avatar, SOSButton, MapPin } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { useRideStore } from '../../store/rideStore';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../../config/firebase'; // Assume exists
import api from '../../services/api';

const { width } = Dimensions.get('window');

const STATUS_ICONS: any = {
  accepted: 'checkmark-circle-outline',
  en_route: 'car-outline',
  arrived: 'location-outline',
  in_progress: 'play-circle-outline',
  completed: 'flag-outline',
};

const TrackRideScreen = ({ navigation, route }: any) => {
  const mapRef = useRef<MapView>(null);
  const { activeRide } = useRideStore();
  const [providerLocation, setProviderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  
  // Status could be derived from activeRide.status or local calculation (e.g. distance < 200m)
  const currentStatus = activeRide?.status || 'accepted';

  // Real-time provider location from RTDB
  useEffect(() => {
    if (!activeRide?._id) return;
    const db = getDatabase(app);
    const locationRef = ref(db, `active_rides/${activeRide._id}/provider_location`);
    
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.lat && data.lng) {
        setProviderLocation({ latitude: data.lat, longitude: data.lng });
      }
    });

    return () => unsubscribe();
  }, [activeRide?._id]);

  // Smooth camera pan when provider location changes
  useEffect(() => {
    if (providerLocation && mapRef.current) {
      mapRef.current.animateCamera({
        center: providerLocation,
        pitch: 0,
        heading: 0,
        altitude: 1000,
        zoom: 15,
      });
    }
  }, [providerLocation]);

  // ETA Calculation every 30s
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchEta = async () => {
      if (!providerLocation || !activeRide?.fromCoordinates) return;
      try {
        const response = await api.get('/rides/suggested-price', {
          params: {
            startLat: providerLocation.latitude,
            startLng: providerLocation.longitude,
            endLat: activeRide.fromCoordinates.latitude,
            endLng: activeRide.fromCoordinates.longitude,
            type: 'car'
          }
        });
        if (response.data.data.durationMinutes) {
          setEta(`${response.data.data.durationMinutes} mins`);
        }
      } catch (e) {
        console.log('ETA fetch error', e);
      }
    };

    fetchEta();
    interval = setInterval(fetchEta, 30000);

    return () => clearInterval(interval);
  }, [providerLocation, activeRide?.fromCoordinates]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: activeRide?.fromCoordinates?.latitude || 28.6139,
          longitude: activeRide?.fromCoordinates?.longitude || 77.209,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        }}
      >
        {activeRide?.routePolyline && (
          <Polyline
            coordinates={activeRide.routePolyline}
            strokeWidth={4}
            strokeColor={Colors.primary}
          />
        )}
        
        {providerLocation && (
          <Marker coordinate={providerLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <MapPin type="provider" active />
          </Marker>
        )}
        
        {activeRide?.fromCoordinates && (
          <Marker coordinate={activeRide.fromCoordinates} anchor={{ x: 0.5, y: 1 }}>
            <MapPin type="destination" />
          </Marker>
        )}
      </MapView>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.sosContainer}>
        <SOSButton rideId={activeRide?._id} />
      </View>

      <View style={styles.bottomCard}>
        <Card variant="elevated" padding="lg">
          <View style={styles.timelineRow}>
             {Object.keys(STATUS_ICONS).map((status, index) => (
                <View key={status} style={styles.timelineItem}>
                  <Ionicons 
                    name={STATUS_ICONS[status]} 
                    size={20} 
                    color={currentStatus === status || Object.keys(STATUS_ICONS).indexOf(currentStatus) > index ? Colors.secondary : Colors.muted} 
                  />
                  {index < Object.keys(STATUS_ICONS).length - 1 && <View style={styles.timelineLine} />}
                </View>
             ))}
          </View>

          <View style={styles.etaRow}>
            <View>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaValue}>{eta}</Text>
            </View>
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Ride OTP</Text>
              <Text style={styles.otpValue}>{activeRide?.otp?.code || '----'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.providerRow}>
            <Avatar name={activeRide?.provider?.name || 'Provider'} size="md" />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{activeRide?.provider?.name}</Text>
              <Text style={styles.vehicleInfo}>{activeRide?.vehicle?.details || 'Vehicle'} • {activeRide?.vehicle?.plateNumber || 'DL 01'}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {currentStatus === 'completed' && (
            <Button
              label="Ride Completed"
              onPress={() => navigation.navigate('RideCompleted', { rideId: activeRide?._id })}
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
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 5,
  },
});

export default TrackRideScreen;
