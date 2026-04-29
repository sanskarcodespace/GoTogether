import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { NotificationItem, SafeScreen, EmptyState } from '../../components';

const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Ride Accepted',
    body: 'Rahul Sharma has accepted your ride request. He will arrive in 10 mins.',
    time: '2 mins ago',
    type: 'ride' as const,
    isRead: false,
  },
  {
    id: '2',
    title: 'Payment Successful',
    body: 'Your payment of ₹150 for the ride to Gurgaon was successful.',
    time: '1 hour ago',
    type: 'payment' as const,
    isRead: true,
  },
  {
    id: '3',
    title: 'New Promotion',
    body: 'Get 20% off on your next 5 rides. Use code GOTOGETHER20.',
    time: 'Yesterday',
    type: 'promotion' as const,
    isRead: true,
  },
];

const NotificationsScreen = () => {
  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            title={item.title}
            body={item.body}
            time={item.time}
            type={item.type}
            isRead={item.isRead}
            onPress={() => {}}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No notifications"
            description="You will see ride updates and payment alerts here."
            icon="notifications-outline"
          />
        }
        contentContainerStyle={styles.list}
      />
    </SafeScreen>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
  },
  markRead: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  list: {
    flexGrow: 1,
  },
});

export default NotificationsScreen;
