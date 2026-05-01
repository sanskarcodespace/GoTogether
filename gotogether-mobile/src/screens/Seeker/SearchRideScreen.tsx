import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, RouteInput, RideCard, SafeScreen, Chip, EmptyState, LoadingOverlay } from '../../components';
import { rideService } from '../../services/rideService';
import { useRideStore } from '../../store/rideStore';
import { useLocationStore } from '../../store/locationStore';
import { useApi } from '../../hooks/useApi';

const SearchRideScreen = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { searchResults, setSearchResults } = useRideStore();
  const { setLocation, setPermission } = useLocationStore();
  const { isLoading, request: searchRides } = useApi(rideService.searchRides);

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
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      const results = await searchRides({
        from,
        to,
        type: filter === 'all' ? undefined : filter,
      });
      setSearchResults(results);
    } catch (err) {
      // Handled by useApi
    }
  }, [from, to, filter, searchRides, setSearchResults]);

  return (
    <SafeScreen style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <View style={styles.header}>
        <Text style={styles.title}>Find a Ride</Text>
        <RouteInput
          fromValue={from}
          toValue={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <Button label="Search" onPress={handleSearch} style={styles.searchBtn} />
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Car" selected={filter === 'car'} onPress={() => setFilter('car')} />
          <Chip label="Bike" selected={filter === 'bike'} onPress={() => setFilter('bike')} />
        </ScrollView>
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleSearch} />
        }
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onPress={() => navigation.navigate('RideDetail', { rideId: item._id || item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No rides found"
            description="Try adjusting your route or filters to find available rides."
            icon="car-outline"
          />
        }
        contentContainerStyle={styles.list}
      />
    </SafeScreen>
  );
};

