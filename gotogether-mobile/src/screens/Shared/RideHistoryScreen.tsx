import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { SafeScreen, Card, RideCard } from '../../components';

const RideHistoryScreen = () => {
  const [role, setRole] = useState<'provider' | 'seeker'>('seeker');

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, role === 'seeker' && styles.activeTab]}
            onPress={() => setRole('seeker')}
          >
            <Text style={[styles.tabText, role === 'seeker' && styles.activeTabText]}>As Seeker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, role === 'provider' && styles.activeTab]}
            onPress={() => setRole('provider')}
          >
            <Text style={[styles.tabText, role === 'provider' && styles.activeTabText]}>As Provider</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => <RideCard ride={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No rides found in your history.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.muted,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  list: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: Colors.muted,
    fontFamily: Typography.family.body,
  },
});

export default RideHistoryScreen;
