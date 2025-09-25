export const theme = {
  colors: {
    primary: '#a4943dff',
    secondary: '#8BC34A',
    background: '#F5F5F5',
    card: 'white',
    text: '#333333',
    textSecondary: '#666666',
    error: '#F44336',
    success: '#4CAF50',
    gold: '#FFD700',
    rice: '#F5DEB3',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  fonts: {
    family: {
      regular: 'Roboto-Regular',
      medium: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    size: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
      title: 24,
      header: 32,
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    },
  },
};