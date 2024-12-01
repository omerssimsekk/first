export const theme = {
  colors: {
    primary: '#6C63FF', // Modern indigo
    accent: '#00BFA6', // Trendy mint
    background: '#FAFBFF', // Off-white with slight blue tint
    surface: '#FFFFFF',
    text: '#1A1B1F', // Almost black
    textSecondary: '#4F5665', // Modern gray
    border: '#E8EAED',
    error: '#FF4B6E', // Soft pink-red
    success: '#00D9A6', // Fresh mint
    warning: '#FFB648', // Muted orange
    info: '#4C9AFF', // Bright blue
    // Gradient variations
    gradientStart: '#6C63FF', // Modern indigo
    gradientMiddle: '#845EF7', // Purple transition
    gradientEnd: '#00BFA6', // Trendy mint
    // Additional colors
    cardBackground: '#FFFFFF',
    headerBackground: 'transparent',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
    },
  },
  shadows: {
    small: {
      shadowColor: '#6C63FF',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#6C63FF',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
  },
};
