import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 4 }) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const animatedBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f0f0f0', '#e0e0e0'],
  });

  const SkeletonCard = () => (
    <View style={styles.card}>
      <Animated.View 
        style={[
          styles.imageContainer,
          { backgroundColor: animatedBackgroundColor }
        ]}
      />
      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.brand,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
        <Animated.View 
          style={[
            styles.name,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
        <Animated.View 
          style={[
            styles.rating,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
        <View style={styles.priceRow}>
          <Animated.View 
            style={[
              styles.price,
              { backgroundColor: animatedBackgroundColor }
            ]}
          />
          <Animated.View 
            style={[
              styles.weight,
              { backgroundColor: animatedBackgroundColor }
            ]}
          />
        </View>
        <Animated.View 
          style={[
            styles.category,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
        <Animated.View 
          style={[
            styles.button,
            { backgroundColor: animatedBackgroundColor }
          ]}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    margin: 4,
    flex: 1,
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentContainer: {
    paddingHorizontal: 4,
  },
  brand: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  name: {
    width: '90%',
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  rating: {
    width: '30%',
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    width: '40%',
    height: 16,
    borderRadius: 8,
  },
  weight: {
    width: '30%',
    height: 12,
    borderRadius: 6,
  },
  category: {
    width: '50%',
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    width: '100%',
    height: 32,
    borderRadius: 8,
  },
});

export default SkeletonLoader;