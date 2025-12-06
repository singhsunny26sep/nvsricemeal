import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface HeaderSkeletonProps {
  animatedValue: Animated.Value;
}

const HeaderSkeleton: React.FC<HeaderSkeletonProps> = ({ animatedValue }) => {
  const animatedBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f0f0f0', '#e0e0e0'],
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Animated.View 
          style={[
            styles.headerTitleSkeleton,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
        <Animated.View 
          style={[
            styles.notificationButtonSkeleton,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
      </View>
      <Animated.View 
        style={[
          styles.searchContainerSkeleton,
          { backgroundColor: animatedBackgroundColor }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleSkeleton: {
    width: 120,
    height: 32,
    borderRadius: 8,
  },
  notificationButtonSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainerSkeleton: {
    height: 50,
    borderRadius: 12,
  },
});

export default HeaderSkeleton;