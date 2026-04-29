import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';

interface NotificationItemProps {
  title: string;
  body: string;
  time: string;
  type: 'ride' | 'payment' | 'system' | 'promotion';
  isRead?: boolean;
  onPress?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  body,
  time,
  type,
  isRead = false,
  onPress,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'ride':
        return { name: 'car', color: Colors.primary };
      case 'payment':
        return { name: 'card', color: Colors.secondary };
      case 'promotion':
        return { name: 'gift', color: Colors.accent };
      default:
        return { name: 'notifications', color: Colors.muted };
    }
  };

  const icon = getIcon();

  return (
    <TouchableOpacity
      style={[styles.container, !isRead && styles.unread]}
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: icon.color + '15' }]}>
        <Ionicons name={icon.name as any} size={24} color={icon.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>{body}</Text>
      </View>
      {!isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unread: {
    backgroundColor: Colors.primary + '05',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.dark,
    fontWeight: Typography.weight.bold as any,
    flex: 1,
    marginRight: Spacing.sm,
  },
  time: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  body: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary || Colors.muted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
});

export default NotificationItem;
