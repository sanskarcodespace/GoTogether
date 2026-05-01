import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, RouteInput, VehicleSelector, Input, ScrollScreen, PriceTag, LoadingOverlay } from '../../components';
import { rideService } from '../../services/rideService';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';

const { height } = Dimensions.get('window');

const CreateRideScreen = ({ navigation }: any) => {
  const [from, setFrom] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [to, setTo] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [vehicle, setVehicle] = useState<'bike' | 'car' | null>(null);
  const [price, setPrice] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [seats, setSeats] = useState('1');
  const [detourKm, setDetourKm] = useState(1);
  const [routePolyline, setRoutePolyline] = useState<any[]>([]);

  const { user } = useAuthStore();
  const { isLoading: isCreating, request: createRide } = useApi(rideService.createRide);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        // In real app, reverse geocode to get address string
        setFrom({
          address: 'Current Location',
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
      }
    })();
  }, []);

  useEffect(() => {
    const fetchPriceAndRoute = async () => {
      if (from && to && vehicle) {
        try {
          // Add debouncing in a real scenario
          const response = await rideService.getSuggestedPrice({
            startLat: from.lat, startLng: from.lng,
            endLat: to.lat, endLng: to.lng, type: vehicle
          });
          setSuggestedPrice(response.suggestedPrice);
          if (!price) setPrice(response.suggestedPrice.toString());
          
          // Also fetch preview route (mocking polyline fetch or using backend route preview if available)
          // For now just show a straight line for preview if no polyline
          setRoutePolyline([{ latitude: from.lat, longitude: from.lng }, { latitude: to.lat, longitude: to.lng }]);
        } catch (error) {
          console.error('Failed to fetch suggested price', error);
        }
      }
    };
    fetchPriceAndRoute();
  }, [from, to, vehicle]);

  const handleGoLive = async () => {
    if (!from || !to || !vehicle || !price) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    try {
      const data = await createRide({
        from: { address: from.address, coordinates: [from.lng, from.lat] },
        to: { address: to.address, coordinates: [to.lng, to.lat] },
        vehicle: { type: vehicle, plateNumber: user?.vehicle?.plateNumber || 'DL01AB1234', details: user?.vehicle?.details || 'Generic' },
        seats: vehicle === 'car' ? parseInt(seats) : 1,
        priceAmount: parseFloat(price),
        detourThresholdKm: detourKm
      });
      navigation.navigate('ActiveRide', { rideId: data._id });
    } catch (err) {
      // Error handled by useApi
    }
  };

  return (
    <ScrollScreen style={styles.container}>
      <LoadingOverlay visible={isCreating} />
      <Text style={styles.title}>Offer a Ride</Text>
      
      <RouteInput
        fromValue={from?.address || ''}
        toValue={to?.address || ''}
        onFromChange={(data, details) => {
          if (details) setFrom({ address: data.description, lat: details.geometry.location.lat, lng: details.geometry.location.lng });
        }}
        onToChange={(data, details) => {
          if (details) setTo({ address: data.description, lat: details.geometry.location.lat, lng: details.geometry.location.lng });
        }}
      />

      {from && to && (
        <View style={styles.mapPreview}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: (from.lat + to.lat) / 2,
              longitude: (from.lng + to.lng) / 2,
              latitudeDelta: Math.abs(from.lat - to.lat) * 1.5 || 0.05,
              longitudeDelta: Math.abs(from.lng - to.lng) * 1.5 || 0.05,
            }}
          >
            <Marker coordinate={{ latitude: from.lat, longitude: from.lng }} pinColor="green" />
            <Marker coordinate={{ latitude: to.lat, longitude: to.lng }} pinColor="red" />
            {routePolyline.length > 0 && <Polyline coordinates={routePolyline} strokeWidth={3} strokeColor={Colors.primary} />}
          </MapView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Vehicle</Text>
        <VehicleSelector selected={vehicle} onSelect={setVehicle} />
      </View>

      {vehicle === 'car' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seats Available</Text>
          <View style={styles.row}>
            {['1', '2', '3', '4'].map((s) => (
              <Button
                key={s}
                label={s}
                variant={seats === s ? 'primary' : 'outline'}
                onPress={() => setSeats(s)}
                style={styles.seatBtn}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detour Threshold (Max extra driving)</Text>
        <View style={styles.row}>
          {[0.5, 1, 2].map((km) => (
            <Button
              key={km}
              label={`${km} km`}
              variant={detourKm === km ? 'primary' : 'outline'}
              onPress={() => setDetourKm(km)}
              style={styles.seatBtn}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set Price</Text>
        <View style={styles.priceRow}>
          <Input
            placeholder="e.g. 150"
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            style={styles.priceInput}
            leftIcon={<Text style={styles.currency}>₹</Text>}
          />
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>Suggested</Text>
            <PriceTag amount={suggestedPrice || 0} size="sm" />
          </View>
        </View>
      </View>

      <Button
        label="Go Live"
        onPress={handleGoLive}
        fullWidth
        style={styles.submitBtn}
        disabled={!from || !to || !vehicle || !price}
      />
    </ScrollScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.xl,
  },
  mapPreview: {
    height: 150,
    marginTop: Spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.md,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
  currency: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.size.lg,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  hintContainer: {
    marginLeft: Spacing.lg,
    alignItems: 'center',
  },
  hintLabel: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
    marginBottom: 4,
  },
  submitBtn: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing['3xl'],
  },
});

export default CreateRideScreen;
