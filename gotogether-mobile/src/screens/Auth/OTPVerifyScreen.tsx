import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, Input, SafeScreen } from '../../components';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';

const OTPVerifyScreen = ({ route, navigation }: any) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { isLoading, request: verifyOTP } = useApi(authService.verifyOTP);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    try {
      const data = await verifyOTP(phone, otp);
      const { user, accessToken, refreshToken, isProfileComplete } = data;
      
      await setAuth(user, accessToken, refreshToken);

      if (!isProfileComplete) {
        navigation.navigate('ProfileSetup');
      } else {
        // App Navigator will pick up isAuthenticated change and navigate to Home
      }
    } catch (err) {
      // Error handled by useApi
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}</Text>

            <Input
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

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
              loading={isLoading}
              disabled={otp.length < 6}
              fullWidth
              style={styles.button}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    marginBottom: Spacing.xl,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
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
