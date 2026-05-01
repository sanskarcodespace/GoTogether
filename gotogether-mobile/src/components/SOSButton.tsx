import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Modal, View, Alert, Linking, Share } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface SOSButtonProps {
  rideId?: string;
}

const SOSButton: React.FC<SOSButtonProps> = ({ rideId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const pulse = useSharedValue(0);
  const { user } = useAuthStore();

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.5]) }],
      opacity: interpolate(pulse.value, [0, 1], [0.6, 0]),
    };
  });

  const handleSOSConfirm = async () => {
    setSosSent(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      await api.post('/rides/sos', {
        rideId,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.log('Failed to send SOS to backend', error);
    }
  };

  const shareLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      await Share.share({
        message: `EMERGENCY! I need help. My live location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}. Tracking Ride ID: ${rideId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        delayLongPress={2000}
        onLongPress={() => setModalVisible(true)}
        onPress={() => Alert.alert('Hold to Activate', 'Please hold the SOS button for 2 seconds to activate.')}
      >
        <Animated.View style={[styles.pulse, pulseStyle]} />
        <Text style={styles.text}>SOS</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!sosSent ? (
              <>
                <Text style={styles.modalTitle}>Activate SOS?</Text>
                <Text style={styles.modalText}>Are you sure you want to send SOS?</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleSOSConfirm}>
                    <Text style={styles.confirmText}>Send SOS</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>SOS Sent — Help is coming</Text>
                <Animated.View style={[styles.pulse, pulseStyle, { position: 'relative', alignSelf: 'center', marginVertical: 20 }]} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL('tel:112')}>
                  <Text style={styles.actionText}>Call Emergency (112)</Text>
                </TouchableOpacity>
                {user?.emergencyContact?.phone && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${user.emergencyContact.phone}`)}>
                    <Text style={styles.actionText}>Call Emergency Contact</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={shareLocation}>
                  <Text style={styles.actionText}>Share Location</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => { setModalVisible(false); setSosSent(false); }}>
                  <Text style={styles.cancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.danger,
  },
  text: {
    color: Colors.white,
    fontFamily: Typography.family.display,
    fontWeight: Typography.weight.bold as any,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
  },
  modalTitle: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size.lg,
    fontWeight: 'bold',
    color: Colors.danger,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.dark,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light,
    marginRight: Spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.dark,
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.danger,
    marginLeft: Spacing.sm,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  actionBtn: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  actionText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default SOSButton;
