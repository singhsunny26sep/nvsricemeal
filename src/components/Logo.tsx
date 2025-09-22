import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'default' | 'circular';
  style?: any;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true, variant = 'default', style }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { icon: 24, text: 16 };
      case 'large':
        return { icon: 48, text: 24 };
      default:
        return { icon: 32, text: 20 };
    }
  };

  const dimensions = getSize();

  if (variant === 'circular') {
    return (
      <View style={[styles.circularContainer, style]}>
        <View style={[styles.circularIcon, { width: dimensions.icon * 2, height: dimensions.icon * 2 }]}>
          <Icon
            name="rice-bowl"
            size={dimensions.icon * 1.2}
            color="white"
          />
          <View style={styles.circularBadge}>
            <Text style={[styles.badgeText, { fontSize: dimensions.icon * 0.4 }]}>
              NVS
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon
          name="rice-bowl"
          size={dimensions.icon}
          color={theme.colors.primary}
        />
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { fontSize: dimensions.icon * 0.3 }]}>
            NVS
          </Text>
        </View>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: dimensions.text }]}>
            NVS Rice Mall
          </Text>
          <Text style={[styles.subtitle, { fontSize: dimensions.text * 0.6 }]}>
            Premium Quality Rice
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: theme.spacing.medium,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.gold,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
    marginBottom: 2,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularIcon: {
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.gold,
    borderRadius: 15,
    minWidth: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
});

export default Logo;