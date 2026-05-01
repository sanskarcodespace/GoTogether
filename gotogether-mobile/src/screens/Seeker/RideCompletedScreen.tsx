import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, SafeScreen, Card, StarRating, Input, LoadingOverlay } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { paymentService } from '../../services/paymentService';
import { useApi } from '../../hooks/useApi';

const RideCompletedScreen = ({ navigation, route }: any) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user } = useAuthStore();
  const { activeRide } = useRideStore();
  
  const { isLoading: isCreatingOrder, request: createOrder } = useApi(paymentService.createOrder);
  const { isLoading: isVerifying, request: verifyPayment } = useApi(paymentService.verifyPayment);

  const handlePayment = async () => {
    try {
      if (!activeRide) return;

      const amount = activeRide.price || 150;
      const order = await createOrder(amount * 100, activeRide._id);

      const options = {
        description: 'Ride Fare Payment',
        image: 'https://your-logo-url.png', // Optional
        currency: order.currency,
        key: order.key,
        amount: order.amount,
        name: 'GoTogether',
        order_id: order.orderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.name || ''
        },
        theme: { color: Colors.primary }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        await verifyPayment(data, activeRide._id);
        Alert.alert('Success', 'Payment verified successfully!');
        navigation.navigate('MainTabs');
      }).catch((error: any) => {
        Alert.alert('Payment Failed', error.description || 'Something went wrong');
      });

    } catch (err) {
      // Error handled by useApi
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <LoadingOverlay visible={isCreatingOrder || isVerifying} />
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.secondary} />
        </View>
        <Text style={styles.title}>Ride Completed!</Text>
        <Text style={styles.subtitle}>You have successfully reached your destination.</Text>

        <Card variant="flat" padding="lg" style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Total Fare</Text>
            <Text style={styles.value}>₹{activeRide?.price || 150}</Text>
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
            value={comment}
            onChangeText={setComment}
            style={styles.commentInput}
          />
        </View>

        <Button
          label="Pay Now"
          onPress={handlePayment}
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
