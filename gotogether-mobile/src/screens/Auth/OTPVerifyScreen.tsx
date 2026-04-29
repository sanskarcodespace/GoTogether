import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, OTPInput, KeyboardScreen } from '../../components';
import { useAuthStore } from '../../store/authStore';

const OTPVerifyScreen = ({ route, navigation }: any) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(async () => {
      setLoading(false);
      // Dummy data
      const user = {
        id: '1',
        phoneNumber,
        role: 'seeker' as const,
      };
      await setAuth(user, 'dummy-access-token', 'dummy-refresh-token');
      navigation.navigate('ProfileSetup');
    }, 1500);
  };

  return (
    <KeyboardScreen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to +91 {phoneNumber}
        </Text>

        <OTPInput length={6} onComplete={setOtp} />

        <View style={styles.resendContainer}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend code in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(60)}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          label="Verify"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length < 6}
          fullWidth
          style={styles.button}
        />
      </View>
    </KeyboardScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingTop: 60,
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
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timerText: {
    color: Colors.muted,
    fontFamily: Typography.family.body,
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontFamily: Typography.family.body,
  },
  button: {
    marginTop: Spacing.lg,
  },
});

export default OTPVerifyScreen;
