import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, SafeScreen, Card, StarRating, Input, LoadingOverlay } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { paymentService } from '../../services/paymentService';
import { useApi } from '../../hooks/useApi';
import api from '../../services/api';

const RATING_TAGS = ['Punctual', 'Safe Driving', 'Friendly', 'Clean Vehicle'];

const RideCompletedScreen = ({ navigation, route }: any) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user } = useAuthStore();
  const { activeRide } = useRideStore();
  
  const { isLoading: isCreatingOrder, request: createOrder } = useApi(paymentService.createOrder);
  const { isLoading: isVerifying, request: verifyPayment } = useApi(paymentService.verifyPayment);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleRatingSubmit = async () => {
    try {
      if (rating > 0 && activeRide?._id) {
         // Determine the rated user id: if current user is seeker, rate provider, else rate seeker.
         const isProvider = activeRide.provider?._id === user?._id;
         const ratedUserId = isProvider ? activeRide.passengers?.[0]?.seeker : activeRide.provider?._id;
         
         await api.post(`/rides/${activeRide._id}/rate`, {
           ratedUserId,
           score: rating,
           comment,
           tags: selectedTags
         });
      }
    } catch (e) {
      console.log('Rating submission failed', e);
    }
  };

  const handlePayment = async () => {
    await handleRatingSubmit();
    
    try {
      if (!activeRide) return navigation.navigate('MainTabs');

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
      navigation.navigate('MainTabs');
    }
  };

  const handleSkip = () => {
     handlePayment();
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
        </Card>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate your experience</Text>
          <StarRating rating={rating} onRatingChange={setRating} readonly={false} size={40} />
          
          <View style={styles.tagsContainer}>
             {RATING_TAGS.map(tag => (
                <TouchableOpacity 
                  key={tag} 
                  style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                  onPress={() => toggleTag(tag)}
                >
                   <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>{tag}</Text>
                </TouchableOpacity>
             ))}
          </View>

          <Input
            placeholder="Write a comment (optional)"
            value={comment}
            onChangeText={setComment}
            style={styles.commentInput}
          />
        </View>

        <View style={styles.actionButtons}>
          <Button
            label="Skip"
            onPress={handleSkip}
            variant="ghost"
            style={styles.skipBtn}
          />
          <Button
            label={rating > 0 ? "Submit & Pay" : "Pay Now"}
            onPress={handlePayment}
            style={styles.doneBtn}
          />
        </View>
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
    marginBottom: Spacing.xl,
  },
  ratingTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.md,
    color: Colors.dark,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    margin: 4,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    color: Colors.dark,
    fontSize: Typography.size.sm,
  },
  tagTextSelected: {
    color: Colors.white,
  },
  commentInput: {
    marginTop: Spacing.md,
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.md,
  },
  skipBtn: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  doneBtn: {
    flex: 2,
  },
});

export default RideCompletedScreen;
