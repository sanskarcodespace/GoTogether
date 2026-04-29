import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, Card, Avatar, SOSButton, BottomSheet } from '../../components';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const ActiveRideScreen = ({ navigation }: any) => {
  const [showRequests, setShowRequests] = useState(true);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.209,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        }}
      />

      <View style={styles.header}>
        <Card variant="elevated" padding="md" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>You are Live - Offering Ride</Text>
          </View>
        </Card>
      </View>

      <View style={styles.sosContainer}>
        <SOSButton onPress={() => {}} />
      </View>

      <BottomSheet isVisible={showRequests} onClose={() => setShowRequests(false)}>
        <Text style={styles.sheetTitle}>Ride Requests</Text>
        
        <Card variant="default" padding="md" style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <Avatar name="Sanjay Gupta" size="md" />
            <View style={styles.requestInfo}>
              <Text style={styles.requesterName}>Sanjay Gupta</Text>
              <Text style={styles.requestMeta}>0.5 km detour • ₹45</Text>
            </View>
          </View>
          <View style={styles.requestActions}>
            <Button label="Decline" variant="ghost" style={styles.actionBtn} onPress={() => {}} />
            <Button label="Accept" variant="secondary" style={styles.actionBtn} onPress={() => {}} />
          </View>
        </Card>

        <Button
          label="End Ride"
          variant="danger"
          onPress={() => navigation.goBack()}
          fullWidth
          style={styles.endBtn}
        />
      </BottomSheet>
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
    right: 20,
  },
  statusCard: {
    borderRadius: BorderRadius.full,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
    marginRight: 10,
  },
  statusText: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.dark,
    fontWeight: 'bold',
  },
  sosContainer: {
    position: 'absolute',
    right: 20,
    top: 150,
  },
  sheetTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.lg,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  requestCard: {
    marginBottom: Spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestInfo: {
    marginLeft: Spacing.md,
  },
  requesterName: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  requestMeta: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 5,
  },
  endBtn: {
    marginTop: Spacing.md,
  },
});

export default ActiveRideScreen;
