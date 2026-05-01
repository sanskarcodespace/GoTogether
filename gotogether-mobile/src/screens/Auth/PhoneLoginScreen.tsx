import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, Input, SafeScreen, LoadingOverlay } from '../../components';
import { authService } from '../../services/authService';
import { useApi } from '../../hooks/useApi';

const PhoneLoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const { isLoading, request: sendOTP } = useApi(authService.sendOTP);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    try {
      // Logic from prompt: send phone number, handle result
      await sendOTP(phone.startsWith('+91') ? phone : `+91${phone}`);
      navigation.navigate('OTPVerify', { phone: phone.startsWith('+91') ? phone : `+91${phone}` });
    } catch (err) {
      // Error handled by useApi
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Enter your phone number to continue</Text>

            <Input
              label="Phone Number"
              placeholder="9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              prefix="+91"
              maxLength={10}
            />

            <Button
              label="Send OTP"
              onPress={handleSendOTP}
              style={styles.button}
              disabled={phone.length < 10}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeScreen>
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
    marginBottom: Spacing['2xl'],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  countryCode: {
    height: 50,
    width: 60,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.background,
  },
  countryCodeText: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.dark,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  button: {
    marginTop: Spacing.lg,
  },
});

export default PhoneLoginScreen;
