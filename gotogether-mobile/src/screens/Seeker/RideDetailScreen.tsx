import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, Card, Avatar, PriceTag, ScrollScreen, StarRating } from '../../components';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const RideDetailScreen = ({ route, navigation }: any) => {
  return (
    <ScrollScreen style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.209,
            latitudeDelta: 0.02,
            longitudeDelta: 0.01,
          }}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.providerCard}>
          <Avatar name="Rahul Sharma" size="lg" />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>Rahul Sharma</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={4.5} size={16} />
              <Text style={styles.totalRides}> • 128 rides</Text>
            </View>
          </View>
          <PriceTag amount={150} size="lg" />
        </View>

        <Card variant="default" padding="md" style={styles.rideInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={20} color={Colors.muted} />
            <Text style={styles.infoText}>White Maruti Swift • DL 01 AB 1234</Text>
          </View>
          <View style={[styles.infoRow, { marginTop: Spacing.sm }]}>
            <Ionicons name="time-outline" size={20} color={Colors.muted} />
            <Text style={styles.infoText}>Pickup in 10 mins • 0.5 km away</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Route Info</Text>
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <Ionicons name="radio-button-on" size={18} color={Colors.primary} />
            <Text style={styles.locationText}>Connaught Place</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <Ionicons name="location" size={18} color={Colors.secondary} />
            <Text style={styles.locationText}>Gurgaon Cyber City</Text>
          </View>
        </View>

        <Button
          label="Request Ride"
          onPress={() => navigation.navigate('TrackRide', { rideId: '1' })}
          fullWidth
          style={styles.requestBtn}
        />
      </View>
    </ScrollScreen>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 0,
  },
  mapContainer: {
    height: 300,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 20,
    elevation: 4,
  },
  content: {
    padding: Spacing.lg,
    marginTop: -20,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  providerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  providerName: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.lg,
    color: Colors.dark,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalRides: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  rideInfo: {
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.dark,
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.md,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  routeContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: Spacing['2xl'],
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLine: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 8,
    marginVertical: 4,
  },
  locationText: {
    marginLeft: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.dark,
  },
  requestBtn: {
    marginBottom: Spacing.xl,
  },
});

export default RideDetailScreen;
