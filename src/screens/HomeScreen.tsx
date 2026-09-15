import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { Product } from '../constants/products';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import Logo from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/apiService';
import Statusbar from '../constants/Statusbar';
import { locationService, LocationData } from '../utils/locationService';

const { width, height } = Dimensions.get('window');

// Responsive calculations
const isSmallScreen = width < 350;
const isLargeScreen = width > 400;
const productCardWidth = isSmallScreen
  ? (width - 48) / 2
  : isLargeScreen
  ? (width - 56) / 2
  : (width - 52) / 2;
const categoryButtonMinWidth = isSmallScreen ? 75 : isLargeScreen ? 100 : 90;

interface ProductItemProps {
  item: Product;
  onAddToCart: (product: Product) => void;
  onAddOrUpdateToCart: (
    productId: string,
    quantity: number,
  ) => Promise<boolean>;
  onFavorite: (productId: string) => void;
  isFavorite: boolean;
}
interface Category {
  id: string;
  name: string;
}
interface SubCategory {
  _id: string;
  name: string;
  category: string;
}
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount: number;
  category: string;
  subCategory: string;
  weight?: string;
  originalPrice?: number;
}

// Skeleton Components
const SkeletonLoader: React.FC<{
  width: number;
  height: number;
  borderRadius?: number;
}> = ({ width, height, borderRadius = 8 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E1E9EE', '#F2F8FC'],
  });
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
      ]}
    />
  );
};

const ProductCardSkeleton: React.FC = () => (
  <View style={styles.productCard}>
    <SkeletonLoader width={90} height={90} borderRadius={12} />
    <View style={styles.productInfo}>
      <SkeletonLoader width={80} height={14} />
      <SkeletonLoader width={70} height={12} />
      <SkeletonLoader width={60} height={12} />
      <SkeletonLoader width={70} height={16} borderRadius={14} />
      <SkeletonLoader width={100} height={28} borderRadius={16} />
    </View>
  </View>
);

const CategorySkeleton: React.FC = () => (
  <SkeletonLoader width={100} height={35} borderRadius={20} />
);

const HeaderSkeleton: React.FC = () => (
  <View style={styles.headerSkeleton}>
    <View style={styles.headerTopSkeleton}>
      <SkeletonLoader width={100} height={50} />
      <SkeletonLoader width={40} height={40} borderRadius={20} />
    </View>
    <SkeletonLoader
      width={Dimensions.get('window').width - 32}
      height={50}
      borderRadius={25}
    />
  </View>
);

const ProductItem: React.FC<ProductItemProps> = ({
  item,
  onAddToCart,
  onAddOrUpdateToCart,
  onFavorite,
  isFavorite,
}) => {
  const navigation = useNavigation();
  const { strings } = useLanguage();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleAddToCart = async () => {
    console.log('🛒 HomeScreen - Add to Cart clicked for product:', item.name);
    console.log('🛒 HomeScreen - Product ID:', item.id);
    console.log('🛒 HomeScreen - Quantity: 1');

    try {
      // Call the cart API to add/update item
      const success = await onAddOrUpdateToCart(item.id, 1);

      if (success) {
        console.log('✅ HomeScreen - Cart API call successful');

        // Also update local cart for immediate UI feedback
        onAddToCart(item);

        // Show success feedback
        Alert.alert('Success! 🎉', `${item.name} added to cart!`, [
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
          {
            text: 'View Cart',
            onPress: () => {
              // Navigate to cart tab
              (navigation as any).getParent()?.navigate('Cart');
            },
          },
        ]);
      } else {
        console.log('❌ HomeScreen - Cart API call failed');

        // Still update local cart as fallback
        onAddToCart(item);

        // Show partial success feedback
        Alert.alert(
          'Partial Success ⚠️',
          `${item.name} added locally but server sync failed.`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel',
            },
            {
              text: 'View Cart',
              onPress: () => {
                (navigation as any).getParent()?.navigate('Cart');
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('❌ HomeScreen - Error in handleAddToCart:', error);
      // Fallback to local cart update
      onAddToCart(item);
      Alert.alert(
        'Network Error ⚠️',
        `${item.name} added locally. Server sync will happen when online.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
          {
            text: 'View Cart',
            onPress: () => {
              (navigation as any).getParent()?.navigate('Cart');
            },
          },
        ],
      );
    }
  };

  const toggleFavorite = () => {
    onFavorite(item.id);
  };

  const handleProductPress = () => {
    (navigation as any).navigate('ProductDetails', { product: item });
  };

  const showDiscount = item.discount && item.discount > 0;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={handleProductPress}
      activeOpacity={0.9}
    >
      {showDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {item.discount}
            {strings?.home?.discountOff || '% ರಿಯಾಯಿತಿ'}
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
        <Icon
          name={isFavorite ? 'favorite' : 'favorite-border'}
          size={20}
          color={isFavorite ? theme.colors.primary : theme.colors.textSecondary}
        />
      </TouchableOpacity>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        defaultSource={{
          uri: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center',
        }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                name={
                  i < Math.floor(item.rating)
                    ? 'star'
                    : i < item.rating
                    ? 'star-half'
                    : 'star-border'
                }
                size={14}
                color={theme.colors.primary}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewCount})
          </Text>
        </View>
        <Text style={styles.productWeight}>Weight: {item.weight || 'N/A'}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.originalPrice && item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
          )}
        </View>
        <Animated.View
          style={[styles.addButton, { transform: [{ scale: scaleValue }] }]}
        >
          <TouchableOpacity
            style={styles.addButtonTouchable}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Icon name="shopping-cart" size={18} color="white" />
            <Text style={styles.addButtonText}>
              {strings?.home?.addToCart || 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

// Banner Carousel Component with auto-slide
const VideoBanner: React.FC<{ banners?: any[]; banner?: any }> = ({
  banners,
  banner,
}) => {
  // Always call hooks in the same order (no conditional hook calls)
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const scrollRef = useRef<any>(null);
  const [videoState, setVideoState] = useState({
    playing: true,
    loading: true,
    error: false,
    showControls: false,
  });
  const videoRef = useRef<any>(null);

  // Auto-slide every 3 seconds (only when multiple banners)
  useEffect(() => {
    if (banners && banners.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndexRef.current + 1) % banners.length;
        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
        if (scrollRef.current) {
          try {
            scrollRef.current.scrollToOffset({
              offset: nextIndex * width,
              animated: true,
            });
          } catch (e) {
            console.log('Scroll error:', e);
          }
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [banners?.length]);

  // Fix Cloudinary URL function
  const getVideoUrl = (url: string) => {
    if (!url) return null;

    // Cloudinary URL fix - ensure proper format
    let videoUrl = url;

    // If it's a Cloudinary URL, make sure it has proper parameters
    if (videoUrl.includes('cloudinary.com') && videoUrl.includes('/upload/')) {
      // Add auto format and quality parameters if not present
      if (!videoUrl.includes('/f_auto') && !videoUrl.includes('/f_mp4')) {
        const uploadIndex = videoUrl.indexOf('/upload/');
        if (uploadIndex !== -1) {
          const beforeUpload = videoUrl.substring(0, uploadIndex + 8); // '/upload/'.length
          const afterUpload = videoUrl.substring(uploadIndex + 8);
          videoUrl = `${beforeUpload}f_mp4,q_auto/${afterUpload}`;
        }
      }
    }

    console.log('Video URL:', videoUrl);
    return videoUrl;
  };

  const togglePlayPause = () => {
    setVideoState(prev => ({ ...prev, playing: !prev.playing }));
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoState(prev => ({ ...prev, loading: false, error: false }));
  };

  const handleVideoError = (error: any) => {
    console.log('Video error:', error);
    setVideoState(prev => ({
      ...prev,
      loading: false,
      error: true,
      playing: false,
    }));
  };

  const handleVideoBuffer = (e: { isBuffering: boolean }) => {
    console.log('Video buffering:', e.isBuffering);
  };

  const handleVideoEnd = () => {
    console.log('Video ended');
    setVideoState(prev => ({ ...prev, playing: false }));
  };

  const videoUrl = banner?.video ? getVideoUrl(banner.video) : null;
  console.log(videoUrl, '%%%%%%%%%%%%%%%%%%%%%%%%%');

  const onScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    currentIndexRef.current = slideIndex;
    setCurrentIndex(slideIndex);
  };

  const renderBanner = ({ item }: { item: any }) => (
    <View style={styles.bannerSlide}>
      <Image
        source={{
          uri:
            item?.image ||
            'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&h=400&fit=crop',
        }}
        style={styles.bannerImage}
        resizeMode="stretch"
      />
    </View>
  );

  // If we have banners, show carousel
  if (banners && banners.length > 0) {
    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={banners}
          renderItem={renderBanner}
          keyExtractor={(item, index) => `banner-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ref={scrollRef}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onScrollToIndexFailed={() => {
            console.log('scrollToIndex failed, trying scrollToOffset');
          }}
          removeClippedSubviews={false}
        />
        {banners.length > 1 && (
          <View style={styles.paginationContainer}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // Single banner (fallback)
  // If no video, show image banner with overlay
  if (!videoUrl || videoState.error) {
    return (
      <View style={styles.videoContainer}>
        <Image
          source={{
            uri:
              banner?.image ||
              'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&h=400&fit=crop',
          }}
          style={styles.videoFallbackImage}
          resizeMode="stretch"
        />
        {(banner?.name || banner?.description) && (
          <View style={styles.videoOverlay}>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>
                {banner?.name || 'Welcome to Our Store'}
              </Text>
              <Text style={styles.videoSubtitle}>
                {banner?.description ||
                  'Discover amazing products at great prices'}
              </Text>
              <TouchableOpacity style={styles.shopNowButton}>
                <Text style={styles.shopNowText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }
  return (
    <View style={styles.videoContainer}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.videoPlayer}
        resizeMode="cover"
        paused={!videoState.playing}
        repeat={true}
        muted={false}
        playWhenInactive={false}
        playInBackground={false}
        ignoreSilentSwitch={'ignore'}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        onBuffer={handleVideoBuffer}
        onEnd={handleVideoEnd}
        controls={false}
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
      />

      {/* Loading Indicator */}
      {videoState.loading && (
        <View style={styles.videoLoadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.videoLoadingText}>Loading video...</Text>
        </View>
      )}

      {/* Video Overlay with Controls */}
      <TouchableOpacity
        style={styles.videoOverlay}
        activeOpacity={0.8}
        onPress={togglePlayPause}
      >
        {!videoState.playing && !videoState.loading && (
          <View style={styles.videoPlayButton}>
            <Icon name="play-arrow" size={40} color="white" />
          </View>
        )}

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>
            {banner?.name || 'Welcome to Our Store'}
          </Text>
          <Text style={styles.videoSubtitle}>
            {banner?.description || 'Discover amazing products at great prices'}
          </Text>
          <TouchableOpacity style={styles.shopNowButton}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Video Controls */}
      <View style={styles.videoControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlayPause}
        >
          <Icon
            name={videoState.playing ? 'pause' : 'play-arrow'}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const { addToCart, cart, addOrUpdateToCart } = useCart();
  const { strings } = useLanguage();
  const navigation = useNavigation<any>();
  const { auth } = useAuth();
  const hasNavigatedToCreateLocationRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: 'all',
    name: 'All',
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [banner, setBanner] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollViewRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [savedLocation, setSavedLocation] = useState<any>(null);

  // Animated text for scrolling effect
  const animatedTextValue = useRef(new Animated.Value(0)).current;
  const textRef = useRef<any>(null);
  const [textWidth, setTextWidth] = useState(0);

  // Animate the scrolling text
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedTextValue, {
          toValue: -textWidth,
          duration: textWidth > 0 ? textWidth * 40 : 5000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(animatedTextValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedTextValue, textWidth]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('=== FETCHING CATEGORIES FROM API ===');
        const response = await apiService.getCategories();
        console.log('Categories API Response:', response);

        if (response.success && response.data?.data?.data) {
          const categoryData = response.data.data.data.map((category: any) => ({
            id: category._id,
            name: category.name,
          }));
          setCategories([{ id: 'all', name: 'All' }, ...categoryData]);
        } else {
          setCategories([{ id: 'all', name: 'All' }]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([{ id: 'all', name: 'All' }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        console.log('=== FETCHING BANNER ===');
        const response = await apiService.getBanners();
        console.log('Banner API Response:', response);
        // New API returns: { success, message, data: { total, totalPages, page, limit, data: [...] } }
        if (
          response.success &&
          response.data?.data?.data &&
          response.data.data.data.length > 0
        ) {
          const bannerList = response.data.data.data;
          setBanners(bannerList);
          setBanner(bannerList[0]);
          console.log('Banners data set:', bannerList);
        } else {
          console.log('No banner data found');
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
      }
    };

    fetchBanner();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProductsByCategory(1, false);
  }, [selectedCategory]);

   // Check if user has saved locations on screen focus
   // If no locations exist, redirect to CreateLocationScreen every time
   // until a location is actually created (ref only set when locations ARE found)
   const checkSavedLocations = useCallback(async () => {
     if (hasNavigatedToCreateLocationRef.current) return;

     try {
       // Get userId from auth context, fallback to profile API
       let userId = auth.user?.id || (auth.user as any)?._id;

       if (!userId) {
         const profileResponse = await apiService.getUserProfile();
         if (profileResponse.success && profileResponse.data) {
           userId = profileResponse.data.id;
         }
       }

       if (!userId) {
         console.log('Unable to determine user ID for location check');
         return;
       }

       console.log('Checking saved locations for user:', userId);

       // Fetch saved locations from API
       const response = await apiService.getLocations(userId);
       console.log('Location API response:', response);

        // If API response failed or there is no data, navigate to CreateLocationScreen
        if (!response.success) {
          console.log('No location data in API response — redirecting to CreateLocationScreen');
          navigation.navigate('CreateLocationScreen');
          return;
        }

        // Parse locations from response (handles nested data structures)
        let locationsList: any[] = [];
        // Check if API response body explicitly indicates failure (e.g., { success: false, message: "No any location found" })
        if (response.data?.success === false) {
          console.log('API body indicates no location data — redirecting to CreateLocationScreen');
          navigation.navigate('CreateLocationScreen');
          return;
        } else if (response.data) {
          const rawData = response.data?.data || response.data;
          if (rawData && Array.isArray(rawData.data)) {
            locationsList = rawData.data;
          } else if (rawData && Array.isArray(rawData)) {
            locationsList = rawData;
          }
        }

        console.log('Parsed locations count:', locationsList.length);

        // If no saved locations found, navigate to CreateLocationScreen
        if (locationsList.length === 0) {
          console.log('No saved locations found — redirecting to CreateLocationScreen');
          navigation.navigate('CreateLocationScreen');
        } else {
          console.log('Saved locations found:', locationsList.length);
          setSavedLocation(locationsList[0]);
          // Only mark as verified when locations exist — blocks re-checking
          hasNavigatedToCreateLocationRef.current = true;
        }
      } catch (error) {
       console.error('Error checking saved locations:', error);
     }
   }, [navigation, auth]);

   useFocusEffect(() => {
     checkSavedLocations();
   });

  const getCurrentUserLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const hasPermission = await locationService.requestLocationPermission('home');
      if (!hasPermission) {
        setLocationAddress('Enable location for better experience');
        setIsFetchingLocation(false);
        return;
      }

      const location = await locationService.getCurrentPosition('home');
      if (location) {
        setCurrentLocation(location);
        const addressData = await locationService.reverseGeocode(location.latitude, location.longitude);
        if (addressData.address) {
          setLocationAddress(addressData.address);
        } else {
          setLocationAddress(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
        }
      }
    } catch (error) {
      console.error('Home location error:', error);
      setLocationAddress('Location unavailable');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const fetchProductsByCategory = async (
    currentPage = 1,
    isLoadMore = false,
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setIsProductsLoading(true);
      }

      if (selectedCategory.id === 'all') {
        console.log('=== FETCHING ALL PRODUCTS ===');
        const allProductsResponse = await apiService.getAllProducts(
          `page=${currentPage}&limit=10`,
        );
        console.log('All Products API Response:', allProductsResponse);

        if (
          allProductsResponse.success &&
          allProductsResponse.data?.data?.data
        ) {
          const transformedProducts: Product[] =
            allProductsResponse.data.data.data.map((apiProduct: any) => ({
              id: apiProduct._id,
              name: apiProduct.name,
              description: apiProduct.description || 'No description available',
              price: apiProduct.generalPrice || 0,
              image:
                apiProduct.image ||
                'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center',
              rating: apiProduct.rating || 4.0,
              reviewCount: apiProduct.reviewCount || 0,
              discount: apiProduct.discount || 0,
              category: apiProduct.category || 'General',
              subCategory: apiProduct.subCategory || '',
              weight: apiProduct.weightInKg
                ? `${apiProduct.weightInKg}kg`
                : 'N/A',
              stock: apiProduct.stockQuantity,
            }));

          if (isLoadMore) {
            setProducts((prevProducts: Product[]) => [
              ...prevProducts,
              ...transformedProducts,
            ]);
          } else {
            setProducts(transformedProducts);
          }

          if (transformedProducts.length < 10) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }

          console.log('All products loaded:', transformedProducts.length);
        } else {
          console.log('No products found from API');
          if (!isLoadMore) {
            setProducts([]);
          }
        }
      } else {
        console.log(
          `=== FETCHING PRODUCTS FOR CATEGORY: ${selectedCategory.name} (ID: ${selectedCategory.id}) ===`,
        );

        const subCategoriesResponse =
          await apiService.getSubCategoriesByCategory(selectedCategory.id);
        console.log('SubCategories API Response:', subCategoriesResponse);

        if (
          subCategoriesResponse.success &&
          subCategoriesResponse.data?.data?.data
        ) {
          const subCategories: SubCategory[] =
            subCategoriesResponse.data.data.data;
          console.log('Found subcategories:', subCategories);

          let allProducts: Product[] = [];

          for (const subCategory of subCategories) {
            console.log(
              `Fetching products for subcategory: ${subCategory.name} (ID: ${subCategory._id})`,
            );
            const productsResponse = await apiService.getProductsBySubCategory(
              subCategory._id,
              `page=${currentPage}&limit=10`,
            );
            console.log(
              `Products response for ${subCategory.name}:`,
              productsResponse,
            );
            console.log(productsResponse, '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
            if (productsResponse.success && productsResponse.data?.data?.data) {
              const transformedProducts: Product[] =
                productsResponse.data.data.data.map((apiProduct: any) => ({
                  id: apiProduct._id,
                  name: apiProduct.name,
                  description:
                    apiProduct.description || 'No description available',
                  price: apiProduct.generalPrice || 0,
                  image:
                    apiProduct.image ||
                    'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center',
                  rating: apiProduct.rating || 4.0,
                  reviewCount: apiProduct.reviewCount || 0,
                  discount: apiProduct.discount || 0,
                  category: apiProduct.category || selectedCategory.name,
                  subCategory: apiProduct.subCategory || subCategory.name,
                  weight: apiProduct.weightInKg
                    ? `${apiProduct.weightInKg}kg`
                    : 'N/A',
                }));

              allProducts = [...allProducts, ...transformedProducts];
            }
          }

          if (isLoadMore) {
            setProducts((prevProducts: Product[]) => [
              ...prevProducts,
              ...allProducts,
            ]);
          } else {
            setProducts(allProducts);
          }

          if (allProducts.length < 10) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }

          console.log('Final transformed products:', allProducts);
        } else {
          console.log('No subcategories found for category');
          if (!isLoadMore) {
            setProducts([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products by category:', error);
      if (!isLoadMore) {
        setProducts([]);
      }
    } finally {
      setIsProductsLoading(false);
      setLoadingMore(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !isProductsLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProductsByCategory(nextPage, true);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory.id === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory.id === item.id && styles.categoryTextActive,
        ]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Show loading skeleton for initial load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        {/* <Statusbar backgroundColor={theme.colors.background} /> */}
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <HeaderSkeleton />
          <View style={styles.categorySection}>
            <FlatList
              horizontal
              data={Array.from({ length: 8 })}
              renderItem={() => <CategorySkeleton />}
              keyExtractor={(_, index) => `category-skeleton-${index}`}
              style={styles.categoryList}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            />
          </View>
          <FlatList
            data={Array.from({ length: 6 })}
            renderItem={() => <ProductCardSkeleton />}
            keyExtractor={(_, index) => `product-skeleton-${index}`}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerTop}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <Image
              style={styles.imageBox}
              resizeMode="contain"
              source={require('../assets/img/logos.jpeg')}
            />
            <View style={styles.headerBrandContainer}>
              <Text style={styles.headerBrandText}>NVS RICE MART</Text>
              <Text style={styles.headerSubText}>Fresh & Premium Quality</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                (navigation as any).getParent()?.navigate('Profile', {
                  screen: 'Notifications',
                })
              }
            >
              <Icon name="notifications" size={22} color={theme.colors.primary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cartIconContainer}
              onPress={() => navigation.navigate('CartScreen')}
            >
              <Icon name="shopping-cart" size={24} color="white" />
              {cart.items.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={styles.headerTextContainer}
          onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
        >
        </View>
      </View>
      {savedLocation ? (
        <TouchableOpacity
          style={styles.currentLocationContainer}
          onPress={() =>
            (navigation as any).getParent()?.navigate('Profile', {
              screen: 'SaveLocation',
            })
          }
          activeOpacity={0.7}
        >
          <Icon name="location-on" size={18} color={theme.colors.primary} />
          <Text style={styles.currentLocationText} numberOfLines={1}>
            {savedLocation.name || savedLocation.address || 'My Location'}
          </Text>
          <Icon name="chevron-right" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.currentLocationContainer, styles.locationDisabled]}
          onPress={() => navigation.navigate('CreateLocationScreen')}
          activeOpacity={0.7}
        >
          <Icon name="location-off" size={18} color={theme.colors.error} />
          <Text style={[styles.currentLocationText, styles.locationDisabledText]}>
            No saved location — tap to add one
          </Text>
        </TouchableOpacity>
      )}
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          {/* Delivery Area Message */}
      
          {/* Banner Section */}
          <VideoBanner banners={banners} banner={banner} />
        </View>

        <View style={styles.categorySection}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            style={styles.categoryList}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          />
        </View>

        {isProductsLoading ? (
          <FlatList
            data={Array.from({ length: 6 })}
            renderItem={() => <ProductCardSkeleton />}
            keyExtractor={(_, index) => `product-loading-${index}`}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
          />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => (
              <ProductItem
                item={item}
                onAddToCart={addToCart}
                onAddOrUpdateToCart={addOrUpdateToCart}
                onFavorite={handleFavorite}
                isFavorite={favorites.has(item.id)}
              />
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="search-off"
                  size={60}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.emptyText}>
                  {strings?.home?.noProductsFound ||
                    'ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {strings?.home?.tryDifferentSearch ||
                    'ವಿಭಿನ್ನ ಹುಡುಕಾಟ ಅಥವಾ ವರ್ಗವನ್ನು ಪ್ರಯತ್ನಿಸಿ'}
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: isSmallScreen ? theme.spacing.medium : theme.spacing.large,
   
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTop: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(164, 148, 61, 0.25)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBrandContainer: {
    marginLeft: 14,
    justifyContent: 'center',
  },
  headerBrandText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  headerSubText: {
    fontSize: isSmallScreen ? 10 : 11,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  iconButton: {
    position: 'relative',
    padding: theme.spacing.small + 2,
    backgroundColor: '#FFFEF5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(164, 148, 61, 0.2)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  cartIconContainer: {
    position: 'relative',
    padding: theme.spacing.small + 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E53935',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  logo: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  categorySection: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.medium,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(164, 148, 61, 0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFEF5',
    borderRadius: 20,
    paddingHorizontal: theme.spacing.medium,
    height: isSmallScreen ? 46 : 54,
    borderWidth: 1.5,
    borderColor: 'rgba(164, 148, 61, 0.3)',
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: theme.spacing.small,
    color: theme.colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    paddingVertical: 0,
  },
  categoryList: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  categoryButton: {
    paddingHorizontal: isSmallScreen
      ? theme.spacing.small
      : theme.spacing.medium,
    paddingVertical: theme.spacing.small + 2,
    marginRight: theme.spacing.small,
    borderRadius: 25,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: 'rgba(164, 148, 61, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    minWidth: categoryButtonMinWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  categoryText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: theme.colors.card,
    fontFamily: theme.fonts.family.bold,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
    flexGrow: 1,
    marginBottom: 60,
    paddingTop: theme.spacing.small,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.small,
  },
  productCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: theme.spacing.small + 2,
    marginBottom: theme.spacing.small,
    width: productCardWidth,
    alignItems: 'center',
    position: 'relative',
    marginTop: theme.spacing.small,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(164, 148, 61, 0.1)',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 1,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: isSmallScreen ? 80 : isLargeScreen ? 100 : 90,
    height: isSmallScreen ? 80 : isLargeScreen ? 100 : 90,
    borderRadius: 12,
    marginBottom: theme.spacing.small - 2,
    resizeMode: 'contain',
    borderWidth: 2,
    borderColor: 'rgba(164, 148, 61, 0.15)',
  },
  productInfo: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 4,
  },
  productName: {
    fontSize: theme.fonts.size.medium,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
    textAlign: 'center',
    width: '100%',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  productDescription: {
    fontSize: theme.fonts.size.small - 1,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small - 4,
    textAlign: 'center',
    width: '100%',
    height: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
    backgroundColor: '#FFFEF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
  },
  productPrice: {
    fontSize: theme.fonts.size.medium + 2,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
    letterSpacing: 0.5,
  },
  productWeight: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.small,
    backgroundColor: '#FFFEF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  originalPrice: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: theme.spacing.small,
  },
  addButton: {
    width: '100%',
  },
  addButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.small + 4,
    borderRadius: 7,
    width: '100%',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: theme.fonts.size.small,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
  },
  imageBox: {
    height: isSmallScreen ? 44 : isLargeScreen ? 60 : 52,
    width: isSmallScreen ? 44 : isLargeScreen ? 60 : 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(164, 148, 61, 0.35)',
    backgroundColor: '#FFFEF5',
  },
  videoContainer: {
    height: isSmallScreen ? 160 : isLargeScreen ? 240 : 200,
    width: '100%',
    alignSelf: 'center',
    marginTop: 14,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  carouselContainer: {
    height: isSmallScreen ? 160 : isLargeScreen ? 240 : 200,
    width: width,
    alignSelf: 'center',
    marginTop: 14,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerSlide: {
    width: width,
    height: isSmallScreen ? 160 : isLargeScreen ? 240 : 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  bannerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoFallbackImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  videoPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shopNowButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  shopNowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoControls: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  controlButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoLoadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
  },
  // Skeleton Styles
  headerSkeleton: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTopSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  deliveryMessageText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: isSmallScreen ? 10 : 13,
    // textAlign: 'center',
    flex: 1,
  },
  deliveryMessageContainer: {
    flexDirection: 'row',
    // alignItems:"center",
    // justifyContent:"center",
    marginVertical: 12,
    marginHorizontal: -10,
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  headerText: {
    fontSize: isSmallScreen ? 12 : isLargeScreen ? 18 : 15,
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
    color: theme.colors.error,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.2,

    borderRadius: 8,
    padding: 4,
  },
  headerTextContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    flex: 1,
    marginTop: 10,
    backgroundColor: 'rgba(164, 148, 61, 0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  currentLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFEF5',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(164, 148, 61, 0.2)',
    marginTop: 8,
    gap: 8,
  },
  currentLocationText: {
    flex: 1,
    fontSize: theme.fonts.size.small + 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.medium,
  },
  locationDisabled: {
    backgroundColor: '#FFF5F5',
    borderColor: 'rgba(229, 57, 53, 0.3)',
  },
  locationDisabledText: {
    color: theme.colors.error,
  },
});

export default HomeScreen;
