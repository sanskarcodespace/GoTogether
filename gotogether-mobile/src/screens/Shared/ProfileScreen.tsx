import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button, Avatar, ScrollScreen, Card } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: 'time-outline', label: 'Ride History', route: 'RideHistory' },
    { icon: 'settings-outline', label: 'Settings', route: 'Settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: 'Settings' },
    { icon: 'share-social-outline', label: 'Invite Friends', route: 'Settings' },
  ];

  return (
    <ScrollScreen style={styles.container}>
      <View style={styles.header}>
        <Avatar name={user?.firstName || 'Sanskar'} size="xl" />
        <Text style={styles.userName}>{user?.firstName || 'Sanskar'} Sharma</Text>
        <Text style={styles.userPhone}>+91 98765 43210</Text>
        <Button label="Edit Profile" variant="outline" size="sm" style={styles.editBtn} onPress={() => {}} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Rides</Text>
        </View>
      </View>

      <Card variant="elevated" padding="none" style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index < menuItems.length - 1 && styles.menuBorder]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>
        ))}
      </Card>

      <Button
        label="Logout"
        variant="ghost"
        onPress={logout}
        fullWidth
        style={styles.logoutBtn}
      />
    </ScrollScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  userName: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.xl,
    color: Colors.dark,
    fontWeight: 'bold',
    marginTop: Spacing.md,
  },
  userPhone: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.sm,
    color: Colors.muted,
    marginTop: 4,
  },
  editBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 0.48,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statValue: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.lg,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  menuCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.dark,
    marginLeft: Spacing.md,
  },
  logoutBtn: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
    color: Colors.danger,
  },
});

export default ProfileScreen;
