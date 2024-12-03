import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#FF6347', // Tomato
    primaryLight: '#FFA07A', // Light Salmon
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    border: '#DDDDDD',
    white: '#FFFFFF',
    error: '#FF4500',
    gradientStart: '#FF6347',
    gradientMiddle: '#FF7F50',
    gradientEnd: '#FFA07A',
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
};
