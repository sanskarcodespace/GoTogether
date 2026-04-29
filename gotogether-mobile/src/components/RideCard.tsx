import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
import Avatar from './Avatar';
import Card from './Card';
import PriceTag from './PriceTag';

interface RideCardProps {
  ride: {
    id: string;
    provider: {
      name: string;
      avatar?: string;
      rating: number;
    };
    from: string;
    to: string;
    price: number;
    eta: string;
    seats: number;
    vehicleType: 'bike' | 'car';
  };
  onPress?: () => void;
  onRequest?: () => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, onPress, onRequest }) => {
  return (
    <Card variant="elevated" padding="md" onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.providerInfo}>
          <Avatar name={ride.provider.name} uri={ride.provider.avatar} size="sm" />
          <View style={styles.providerText}>
            <Text style={styles.providerName}>{ride.provider.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={Colors.accent} />
              <Text style={styles.ratingText}>{ride.provider.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        <MaterialCommunityIcons
          name={ride.vehicleType === 'bike' ? 'motorbike' : 'car'}
          size={24}
          color={Colors.primary}
        />
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeLine}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
        </View>
        <View style={styles.routeText}>
          <Text style={styles.locationText} numberOfLines={1}>{ride.from}</Text>
          <Text style={[styles.locationText, { marginTop: Spacing.sm }]} numberOfLines={1}>{ride.to}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={Colors.muted} />
            <Text style={styles.statText}>{ride.eta}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color={Colors.muted} />
            <Text style={styles.statText}>{ride.seats} seats left</Text>
          </View>
        </View>
        <PriceTag amount={ride.price} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerText: {
    marginLeft: Spacing.sm,
  },
  providerName: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semiBold as any,
    color: Colors.dark,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
    marginLeft: 2,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  routeLine: {
    alignItems: 'center',
    width: 20,
    marginRight: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: Typography.size.sm,
    color: Colors.dark,
    fontFamily: Typography.family.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statText: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
    marginLeft: 4,
  },
});

export default RideCard;
