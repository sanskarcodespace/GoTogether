import { Platform } from 'react-native';

export const Typography = {
  family: {
    display: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins-Bold' }), // Assume fonts will be loaded
    body: Platform.select({ ios: 'Inter-Regular', android: 'Inter-Regular' }),
    mono: Platform.select({ ios: 'JetBrainsMono-Regular', android: 'JetBrainsMono-Regular' }),
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  weight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  }
};
