import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, SafeScreen, Card, StarRating, Input } from '../../components';
import { Ionicons } from '@expo/vector-icons';

const RideCompletedScreen = ({ navigation }: any) => {
  const [rating, setRating] = useState(0);

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.secondary} />
        </View>
        <Text style={styles.title}>Ride Completed!</Text>
        <Text style={styles.subtitle}>You have successfully reached your destination.</Text>

        <Card variant="flat" padding="lg" style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Total Fare</Text>
            <Text style={styles.value}>₹150</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>12.5 km</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>25 mins</Text>
          </View>
        </Card>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate your experience</Text>
          <StarRating rating={rating} onRatingChange={setRating} readonly={false} size={40} />
          <Input
            placeholder="Write a comment (optional)"
            value=""
            onChangeText={() => {}}
            style={styles.commentInput}
          />
        </View>

        <Button
          label="Done"
          onPress={() => navigation.navigate('MainTabs')}
          fullWidth
          style={styles.doneBtn}
        />
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.muted,
    fontFamily: Typography.family.body,
  },
  value: {
    fontWeight: 'bold',
    color: Colors.dark,
  },
  ratingSection: {
    alignItems: 'center',
    width: '100%',
  },
  ratingTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.md,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  commentInput: {
    marginTop: Spacing.md,
  },
  doneBtn: {
    marginTop: Spacing['2xl'],
  },
});

export default RideCompletedScreen;
