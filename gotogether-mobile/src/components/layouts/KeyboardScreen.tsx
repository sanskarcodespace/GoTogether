import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
} from 'react-native';
import SafeScreen from './SafeScreen';

interface KeyboardScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const KeyboardScreen: React.FC<KeyboardScreenProps> = ({ children, style }) => {
  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, style]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {children}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardScreen;
