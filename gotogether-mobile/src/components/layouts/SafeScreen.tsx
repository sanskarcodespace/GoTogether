import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, ViewStyle, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
}

const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  style,
  backgroundColor = Colors.background,
  barStyle = 'dark-content',
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <SafeAreaView style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default SafeScreen;
