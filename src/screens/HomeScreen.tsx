import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../constants/products';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import Logo from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../utils/apiService';

const { width } = Dimensions.get('window');

interface ProductItemProps {
  item: Product;
  onAddToCart: (product: Product) => void;
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
// Skeleton Components
const SkeletonLoader: React.FC<{ width: number; height: number; borderRadius?: number }> = ({
  width,
  height,
  borderRadius = 8
}) => {
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
      ])
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
    <SkeletonLoader width={120} height={120} borderRadius={12} />
    <View style={styles.productInfo}>
      <SkeletonLoader width={100} height={16} />
      <SkeletonLoader width={110} height={14} />
      <SkeletonLoader width={80} height={14} />
      <SkeletonLoader width={90} height={20} />
      <SkeletonLoader width={140} height={32} borderRadius={16} />
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
    <SkeletonLoader width={Dimensions.get('window').width - 32} height={50} borderRadius={25} />
  </View>
);

const ProductItem: React.FC<ProductItemProps> = ({ item, onAddToCart, onFavorite, isFavorite }) => {
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

  const handleAddToCart = () => {
    onAddToCart(item);
    navigation.getParent()?.getParent()?.navigate('CartScreen');
  };

  const toggleFavorite = () => {
    onFavorite(item.id);
  };

  const handleProductPress = () => {
    (navigation as any).navigate('ProductDetails', { product: item });
  };

  const showDiscount = item.discount && item.discount > 0;

  return (
    <TouchableOpacity style={styles.productCard} onPress={handleProductPress} activeOpacity={0.9}>
      {showDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}{strings?.home?.discountOff || '% ರಿಯಾಯಿತಿ'}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
        <Icon name={isFavorite ? 'favorite' : 'favorite-border'} size={20} color={isFavorite ? theme.colors.primary : theme.colors.textSecondary} />
      </TouchableOpacity>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center' }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                name={i < Math.floor(item.rating) ? 'star' : i < item.rating ? 'star-half' : 'star-border'}
                size={14}
                color={theme.colors.primary}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewCount})
          </Text>
        </View>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <Animated.View style={[styles.addButton, { transform: [{ scale: scaleValue }] }]}>
          <TouchableOpacity
            style={styles.addButtonTouchable}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Icon name="shopping-cart" size={18} color="white" />
            <Text style={styles.addButtonText}>{strings?.home?.addToCart || 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const { addToCart, cart } = useCart();
  const { strings } = useLanguage();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>({ id: 'all', name: 'All' });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const videoRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('=== FETCHING CATEGORIES FROM API ===');
        const response = await apiService.getCategories();
        console.log('Categories API Response:', response);
        console.log('Response success:', response.success);
        console.log('Response data:', response.data);

        if (response.success && response.data?.data?.data) {
          console.log('Processing categories data...');
          // Transform API response to match our Category interface
          const categoryData = response.data.data.data.map((category: any) => ({
            id: category._id,
            name: category.name
          }));
          console.log('Extracted categories:', categoryData);
          setCategories([{ id: 'all', name: 'All' }, ...categoryData]);
          console.log('Final categories set:', [{ id: 'all', name: 'All' }, ...categoryData]);
        } else {
          console.log('API call failed or no data, using fallback');
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

  // Fetch products when category changes
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setIsProductsLoading(true);
      try {
        if (selectedCategory.id === 'all') {
          console.log('=== FETCHING ALL PRODUCTS ===');
          // Fetch all products from API
          const allProductsResponse = await apiService.getAllProducts();
          console.log('All Products API Response:', allProductsResponse);

          if (allProductsResponse.success && allProductsResponse.data?.data?.data) {
            // Transform API products to match our Product interface
            const transformedProducts: Product[] = allProductsResponse.data.data.data.map((apiProduct: any) => ({
              id: apiProduct._id,
              name: apiProduct.name,
              description: apiProduct.description || 'No description available',
              price: apiProduct.price || 0,
              image: apiProduct.image || 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center',
              rating: apiProduct.rating || 4.0,
              reviewCount: apiProduct.reviewCount || 0,
              discount: apiProduct.discount || 0,
              category: apiProduct.category || 'General',
              subCategory: apiProduct.subCategory || ''
            }));

            console.log('All products loaded:', transformedProducts.length);
            setProducts(transformedProducts);
          } else {
            console.log('No products found from API');
            setProducts([]);
          }
        } else {
          console.log(`=== FETCHING PRODUCTS FOR CATEGORY: ${selectedCategory.name} (ID: ${selectedCategory.id}) ===`);

          // Fetch subcategories for the selected category
          const subCategoriesResponse = await apiService.getSubCategoriesByCategory(selectedCategory.id);
          console.log('SubCategories API Response:', subCategoriesResponse);

          if (subCategoriesResponse.success && subCategoriesResponse.data?.data?.data) {
            const subCategories: SubCategory[] = subCategoriesResponse.data.data.data;
            console.log('Found subcategories:', subCategories);

            // Fetch products for each subcategory
            let allProducts: Product[] = [];

            for (const subCategory of subCategories) {
              console.log(`Fetching products for subcategory: ${subCategory.name} (ID: ${subCategory._id})`);
              const productsResponse = await apiService.getProductsBySubCategory(subCategory._id);
              console.log(`Products response for ${subCategory.name}:`, productsResponse);

              if (productsResponse.success && productsResponse.data?.data?.data) {
                // Transform API products to match our Product interface
                const transformedProducts: Product[] = productsResponse.data.data.data.map((apiProduct: any) => ({
                  id: apiProduct._id,
                  name: apiProduct.name,
                  description: apiProduct.description || 'No description available',
                  price: apiProduct.price || 0,
                  image: apiProduct.image || 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center',
                  rating: apiProduct.rating || 4.0,
                  reviewCount: apiProduct.reviewCount || 0,
                  discount: apiProduct.discount || 0,
                  category: apiProduct.category || selectedCategory.name,
                  subCategory: apiProduct.subCategory || subCategory.name
                }));

                allProducts = [...allProducts, ...transformedProducts];
              }
            }

            console.log('Final transformed products:', allProducts);
            setProducts(allProducts);
          } else {
            console.log('No subcategories found for category');
            setProducts([]);
          }
        }
      } catch (error) {
        console.error('Error fetching products by category:', error);
        setProducts([]);
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [selectedCategory]);

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    // Reset search when category changes
    setSearchQuery('');
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
      <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <Image style={styles.imageBox} resizeMode='contain' source={require("../assets/img/logo.png")} />
            <TouchableOpacity
              style={styles.cartIconContainer}
              onPress={() => navigation.navigate('CartScreen')}
            >
              <Icon name="shopping-cart" size={24} color={theme.colors.primary} />
              {cart.items.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={strings?.home?.searchPlaceholder || 'ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ...'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.add}>
            <Video
              ref={videoRef}
              source={{
                uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
              }}
              style={styles.videoPlayer}
              controls={true}
              resizeMode="cover"
              paused={!videoPlaying}
              repeat={true}
              volume={0.5}
              muted={false}
              playInBackground={false}
              playWhenInactive={false}
              onLoadStart={() => console.log('Video loading started')}
              onLoad={() => console.log('Video loaded successfully')}
              onError={(error) => console.log('Video error:', error)}
            />
            <View style={styles.videoOverlay}>
              {/* Video overlay content */}
            </View>
          </View>
        </View>

        <View style={styles.categorySection}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
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
                onFavorite={handleFavorite}
                isFavorite={favorites.has(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={60} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>{strings?.home?.noProductsFound || 'ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ'}</Text>
                <Text style={styles.emptySubtext}>{strings?.home?.tryDifferentSearch || 'ವಿಭಿನ್ನ ಹುಡುಕಾಟ ಅಥವಾ ವರ್ಗವನ್ನು ಪ್ರಯತ್ನಿಸಿ'}</Text>
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
    padding: theme.spacing.large,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    elevation: 4,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 2,
  },
  cartIconContainer: {
    position: 'relative',
    padding: theme.spacing.small,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logo: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  categorySection: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.medium,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: theme.spacing.small,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    paddingVertical: 0,
  },
  categoryList: {
    maxHeight: 55,
  },
  categoryContainer: {
    paddingHorizontal: theme.spacing.small,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    marginRight: theme.spacing.small,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
    textTransform: "capitalize",
  },
  categoryTextActive: {
    color: theme.colors.card,
    fontFamily: theme.fonts.family.bold,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.small,
    paddingBottom: theme.spacing.large,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.small,
  },
  productCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    width: (width - theme.spacing.medium * 3) / 2,
    alignItems: 'center',
    position: 'relative',
    marginTop: theme.spacing.medium,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.08)',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    resizeMode: 'cover',
  },
  productInfo: {
    alignItems: 'center',
    width: '100%',
  },
  productName: {
    fontSize: theme.fonts.size.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  productDescription: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
    width: '100%',
    height: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
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
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  addButton: {
    width: '100%',
  },
  addButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    width: '100%',
    justifyContent: 'center',
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
    height: 100,
    width: 100,
  },
  add: {
    height: 150,
    width: "100%",
    borderWidth: 1,
    borderColor: "green",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
  videoControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  shopNowButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  shopNowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Skeleton Styles
  headerSkeleton: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  headerTopSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
});

export default HomeScreen;