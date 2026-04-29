import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import SafeScreen from './SafeScreen';
import { Spacing } from '../../constants/Spacing';

interface ScrollScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

const ScrollScreen: React.FC<ScrollScreenProps> = ({
  children,
  style,
  contentContainerStyle,
}) => {
  return (
    <SafeScreen style={style}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    flexGrow: 1,
  },
});

export default ScrollScreen;
