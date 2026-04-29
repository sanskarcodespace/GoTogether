import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, RouteInput, RideCard, SafeScreen, Chip, EmptyState } from '../../components';

const DUMMY_RIDES = [
  {
    id: '1',
    provider: { name: 'Rahul Sharma', rating: 4.5, avatar: '' },
    from: 'Connaught Place',
    to: 'Gurgaon Cyber City',
    price: 150,
    eta: '10 mins',
    seats: 2,
    vehicleType: 'car' as const,
  },
  {
    id: '2',
    provider: { name: 'Amit Kumar', rating: 4.8, avatar: '' },
    from: 'Hauz Khas',
    to: 'Noida Sector 62',
    price: 80,
    eta: '5 mins',
    seats: 1,
    vehicleType: 'bike' as const,
  },
];

const SearchRideScreen = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filter, setFilter] = useState('all');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(DUMMY_RIDES);

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
    }, 1000);
  };

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Ride</Text>
        <RouteInput
          fromValue={from}
          toValue={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <Button label="Search" onPress={handleSearch} style={styles.searchBtn} loading={searching} />
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Car" selected={filter === 'car'} onPress={() => setFilter('car')} />
          <Chip label="Bike" selected={filter === 'bike'} onPress={() => setFilter('bike')} />
          <Chip label="Near Me" selected={filter === 'near'} onPress={() => setFilter('near')} />
        </ScrollView>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onPress={() => navigation.navigate('RideDetail', { rideId: item.id })}
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

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  searchBtn: {
    marginTop: Spacing.md,
  },
  filters: {
    padding: Spacing.md,
  },
  list: {
    paddingBottom: 100,
  },
});

export default SearchRideScreen;
