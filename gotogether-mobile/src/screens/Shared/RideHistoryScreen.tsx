import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors }     from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing }    from '../../constants/Spacing';
import { SafeScreen, RideCard, EmptyState } from '../../components';
import api from '../../services/api';

const PAGE_LIMIT     = 10;
const CARD_HEIGHT    = 130; // fixed height for getItemLayout

type RideRole = 'seeker' | 'provider';

const RideHistoryScreen = ({ navigation }: any) => {
  const [role, setRole]         = useState<RideRole>('seeker');
  const [rides, setRides]       = useState<any[]>([]);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFetchingRef           = useRef(false); // guard against double-fetches

  // ── Fetch a page of ride history ─────────────────────────────────────────
  const fetchHistory = useCallback(
    async (pageNum: number, selectedRole: RideRole, append = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (!append) setLoading(true);

      try {
        const res = await api.get('/rides/history', {
          params: { role: selectedRole, page: pageNum, limit: PAGE_LIMIT },
        });
        const { data: newRides, meta } = res.data;

        setRides(prev => append ? [...prev, ...(newRides ?? [])] : (newRides ?? []));
        setHasMore(pageNum < (meta?.totalPages ?? 1));
        setPage(pageNum);
      } catch {
        // Toast shown by Axios interceptor
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // ── Load fresh on focus or role change ───────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      setRides([]);
      setHasMore(true);
      fetchHistory(1, role, false);
    }, [role, fetchHistory]),
  );

  // ── Infinite scroll ───────────────────────────────────────────────────────
  const handleLoadMore = () => {
    if (!loading && hasMore && !isFetchingRef.current) {
      fetchHistory(page + 1, role, true);
    }
  };

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    setRides([]);
    setHasMore(true);
    fetchHistory(1, role, false);
  };

  const switchRole = (newRole: RideRole) => {
    if (newRole === role) return;
    setRole(newRole);
    // Data reload handled by useFocusEffect dependency on `role`
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <View style={styles.tabContainer}>
          {(['seeker', 'provider'] as RideRole[]).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.tab, role === r && styles.activeTab]}
              onPress={() => switchRole(r)}
            >
              <Text style={[styles.tabText, role === r && styles.activeTabText]}>
                As {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && rides.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RideCard
              ride={item}
              onPress={() => navigation?.navigate?.('RideDetail', { rideId: item._id })}
            />
          )}
          // ─── Performance props ────────────────────────────────────────────
          removeClippedSubviews
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={8}
          getItemLayout={(_data, index) => ({
            length: CARD_HEIGHT,
            offset: CARD_HEIGHT * index,
            index,
          })}
          // ─── Pagination ───────────────────────────────────────────────────
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          // ─── Pull-to-refresh ──────────────────────────────────────────────
          onRefresh={handleRefresh}
          refreshing={refreshing}
          // ─── Empty state ──────────────────────────────────────────────────
          ListEmptyComponent={
            <EmptyState
              title="No rides yet"
              description={`You have no ${role} history. ${role === 'seeker' ? 'Find a ride to get started!' : 'Create a ride to start earning!'}`}
              icon="time-outline"
            />
          }
          contentContainerStyle={rides.length === 0 ? styles.emptyContainer : styles.list}
        />
      )}
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
    shadowColor: '#000',
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
  },
  emptyContainer: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});

export default RideHistoryScreen;
