import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface BannerSkeletonProps {
  animatedValue: Animated.Value;
}

const BannerSkeleton: React.FC<BannerSkeletonProps> = ({ animatedValue }) => {
  const animatedBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f0f0f0', '#e0e0e0'],
  });

  return (
    <View style={styles.bannerContainer}>
      <Animated.View 
        style={[
          styles.bannerSkeleton,
          { backgroundColor: animatedBackgroundColor }
        ]}
      />
      
      {/* Banner Content Skeleton */}
      <View style={styles.bannerContent}>
        <Animated.View 
          style={[
            styles.bannerTitle,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
        <Animated.View 
          style={[
            styles.bannerSubtitle,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
        <Animated.View 
          style={[
            styles.bannerButton,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
      </View>

      {/* Banner Indicators Skeleton */}
      <View style={styles.indicators}>
        {[0, 1, 2].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: animatedBackgroundColor }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    position: 'relative',
  },
  bannerSkeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    marginHorizontal: 16,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
  },
  bannerTitle: {
    width: '70%',
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  bannerSubtitle: {
    width: '50%',
    height: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerButton: {
    width: 120,
    height: 36,
    borderRadius: 18,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default BannerSkeleton;