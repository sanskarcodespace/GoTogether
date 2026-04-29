import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Button, SafeScreen } from '../../components';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <SafeScreen backgroundColor={Colors.white}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {/* Placeholder for illustration */}
          <View style={styles.illustration}>
            <Text style={styles.placeholderText}>RIDE SHARING ILLUSTRATION</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Travel Together,{'\n'}Save Together</Text>
          <Text style={styles.subtitle}>
            Join thousands of people sharing rides and making travel affordable and eco-friendly.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            label="Get Started"
            onPress={() => navigation.navigate('PhoneLogin')}
            fullWidth
            style={styles.button}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            onPress={() => navigation.navigate('PhoneLogin')}
            fullWidth
          />
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.muted,
    fontSize: 12,
  },
  content: {
    flex: 0.6,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Typography.family.display,
    fontSize: Typography.size['3xl'],
    color: Colors.dark,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: Typography.family.body,
    fontSize: Typography.size.base,
    color: Colors.muted,
    marginTop: Spacing.md,
    lineHeight: 24,
  },
  footer: {
    paddingBottom: Spacing.xl,
  },
  button: {
    marginBottom: Spacing.sm,
  },
});

export default WelcomeScreen;
