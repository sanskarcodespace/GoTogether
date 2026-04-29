import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { BorderRadius } from '../constants/Spacing';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  online = false,
}) => {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  const dimension = sizes[size];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: dimension / 2 }]}
        />
      ) : (
        <View style={[styles.fallback, { borderRadius: dimension / 2 }]}>
          <Text style={[styles.initials, { fontSize: dimension / 2.5 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {online && <View style={[styles.onlineDot, { width: dimension / 4, height: dimension / 4, borderRadius: dimension / 8 }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.white,
    fontFamily: Typography.family.display,
    fontWeight: Typography.weight.bold as any,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
});

export default Avatar;
