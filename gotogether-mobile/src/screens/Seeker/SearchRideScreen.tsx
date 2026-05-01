import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, RouteInput, RideCard, SafeScreen, Chip, EmptyState } from '../../components';
import { rideService } from '../../services/rideService';
import { useRideStore } from '../../store/rideStore';
import { useLocationStore } from '../../store/locationStore';
import { useApi } from '../../hooks/useApi';

// Fixed card height enables getItemLayout — avoids layout measurement overhead
const RIDE_CARD_HEIGHT = 140;

const SearchRideScreen = ({ navigation }: any) => {
  const [from, setFrom] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [to, setTo] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [filter, setFilter] = useState('all'); // all, car, bike, nearest, cheapest
  
  const { searchResults, setSearchResults } = useRideStore();
  const { setLocation, setPermission } = useLocationStore();
  const { isLoading, request: searchRides } = useApi(rideService.searchRides);
  const isFocused = useIsFocused();

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermission(false);
      return;
    }
    setPermission(true);
    let location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setFrom({
      address: 'Current Location',
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!from || !to) return;
    try {
      const results = await searchRides({
        pickup_lat: from.lat,
        pickup_lng: from.lng,
        drop_lat: to.lat,
        drop_lng: to.lng,
        vehicleType: ['car', 'bike'].includes(filter) ? filter : undefined,
      });
      setSearchResults(results);
    } catch (err) {
      // Handled by useApi
    }
  }, [from, to, filter, searchRides, setSearchResults]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocused && from && to) {
      interval = setInterval(() => {
        handleSearch();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isFocused, from, to, filter, handleSearch]);

  const filteredAndSortedResults = React.useMemo(() => {
    let results = [...searchResults];
    if (filter === 'nearest') {
      results.sort((a, b) => a.detourDistanceKm - b.detourDistanceKm);
    } else if (filter === 'cheapest') {
      results.sort((a, b) => a.price.amount - b.price.amount);
    }
    // 'car' and 'bike' filters are handled by the API payload, but we can double filter here
    if (filter === 'car' || filter === 'bike') {
      results = results.filter((r) => r.vehicle?.type === filter);
    }
    return results;
  }, [searchResults, filter]);

  const renderSkeleton = () => {
    return (
      <View style={{ padding: Spacing.md }}>
        <Text>Loading rides...</Text>
      </View>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Ride</Text>
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
        <Button label="Search" onPress={handleSearch} style={styles.searchBtn} disabled={!from || !to} />
      </View>

      {searchResults.length > 0 && (
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip label="All" selected={filter === 'all'} onPress={() => { setFilter('all'); handleSearch(); }} />
            <Chip label="Car" selected={filter === 'car'} onPress={() => { setFilter('car'); handleSearch(); }} />
            <Chip label="Bike" selected={filter === 'bike'} onPress={() => { setFilter('bike'); handleSearch(); }} />
            <Chip label="Nearest" selected={filter === 'nearest'} onPress={() => setFilter('nearest')} />
            <Chip label="Cheapest" selected={filter === 'cheapest'} onPress={() => setFilter('cheapest')} />
          </ScrollView>
        </View>
      )}

      {isLoading && searchResults.length === 0 ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredAndSortedResults}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleSearch} />
          }
          renderItem={({ item }) => (
            <RideCard
              ride={item}
              onPress={() => navigation.navigate('RideDetail', { rideId: item._id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No rides available right now"
              description="Try adjusting your route or filters to find available rides, or check back in a few minutes."
              icon="car-outline"
            />
          }
          contentContainerStyle={styles.list}
          // ─── Performance optimizations ────────────────────────────────────
          removeClippedSubviews
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={8}
          getItemLayout={(_data, index) => ({
            length: RIDE_CARD_HEIGHT,
            offset: RIDE_CARD_HEIGHT * index,
            index,
          })}
        />
      )}
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  searchBtn: {
    marginTop: Spacing.lg,
  },
  filters: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  list: {
    padding: Spacing.md,
    flexGrow: 1,
  },
});

export default SearchRideScreen;
