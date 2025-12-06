import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonColor: string;
}

interface AttractiveBannerProps {
  onBannerPress?: (banner: Banner) => void;
}

const AttractiveBanner: React.FC<AttractiveBannerProps> = ({ onBannerPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = new Animated.Value(0);

  // Sample banner data - you can replace this with your actual API data
  const banners: Banner[] = [
    {
      id: '1',
      title: 'Premium Quality Rice',
      subtitle: 'Fresh from farms, direct to your door',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=800&h=400&fit=crop',
      buttonText: 'Shop Now',
      buttonColor: '#6366F1'
    },
    {
      id: '2',
      title: 'Special Offers',
      subtitle: 'Up to 30% off on bulk orders',
      image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=400&fit=crop',
      buttonText: 'Grab Deal',
      buttonColor: '#FF6B6B'
    },
    {
      id: '3',
      title: 'Organic Rice Collection',
      subtitle: 'Healthy choice for your family',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
      buttonText: 'Explore',
      buttonColor: '#10B981'
    }
  ];

  const renderBanner = ({ item, index }: any) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={() => onBannerPress?.(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      
      {/* Gradient Overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Banner Content */}
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        
        <TouchableOpacity
          style={[styles.bannerButton, { backgroundColor: item.buttonColor }]}
          onPress={() => onBannerPress?.(item)}
        >
          <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Special Badge for first banner */}
      {index === 0 && (
        <View style={styles.specialBadge}>
          <Ionicons name="flame" size={14} color="#FF6B6B" />
          <Text style={styles.specialBadgeText}>Trending</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {banners.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index ? styles.activeDot : styles.inactiveDot
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  bannerContainer: {
    width: width - 32,
    height: 200,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    elevation: 2,
  },
  bannerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  specialBadge: {
    position: 'absolute',
    top: 16,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6366F1',
    width: 24,
  },
  inactiveDot: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
});

export default AttractiveBanner;