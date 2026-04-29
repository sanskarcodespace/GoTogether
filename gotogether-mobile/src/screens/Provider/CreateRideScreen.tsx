import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, RouteInput, VehicleSelector, Input, ScrollScreen, PriceTag } from '../../components';

const CreateRideScreen = ({ navigation }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [vehicle, setVehicle] = useState<'bike' | 'car' | null>(null);
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('1');

  return (
    <ScrollScreen style={styles.container}>
      <Text style={styles.title}>Offer a Ride</Text>
      
      <RouteInput
        fromValue={from}
        toValue={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onSwap={() => {
          const temp = from;
          setFrom(to);
          setTo(temp);
        }}
      />

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
            <Text style={styles.hintLabel}>Suggested Price</Text>
            <PriceTag amount={120} size="sm" />
          </View>
        </View>
      </View>

      <Button
        label="Go Live"
        onPress={() => navigation.navigate('ActiveRide', { rideId: 'new' })}
        fullWidth
        style={styles.submitBtn}
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
    width: '22%',
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
