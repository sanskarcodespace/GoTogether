import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, Input, SafeScreen, LoadingOverlay } from '../../components';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';

const OTPVerifyScreen = ({ route, navigation }: any) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const { isLoading, request: verifyOTP } = useApi(authService.verifyOTP);

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
