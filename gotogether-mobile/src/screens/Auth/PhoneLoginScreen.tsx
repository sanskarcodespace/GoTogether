import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, Input, KeyboardScreen } from '../../components';

const PhoneLoginScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OTPVerify', { phoneNumber });
    }, 1500);
  };

  return (
    <KeyboardScreen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>
          We will send you a 6-digit verification code to this number.
        </Text>

        <View style={styles.inputWrapper}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>
          <Input
            placeholder="98765 43210"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <Button
          label="Send OTP"
          onPress={handleSendOTP}
          loading={loading}
          disabled={phoneNumber.length < 10}
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
