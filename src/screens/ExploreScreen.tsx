import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../constants/products';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildUrl, TEST_TOKEN } from '../constants/config';

const { width } = Dimensions.get('window');

interface ExploreItemProps {
  item: Product;
  onAddToCart: (product: Product) => void;
}

interface SubCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    data: SubCategory[];
  };
}

interface ProductResponse {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  subCategory: string;
  inStock: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    data: ProductResponse[];
  };
}

const ExploreItem: React.FC<ExploreItemProps> = ({ item, onAddToCart }) => {
  const navigation = useNavigation<any>();

  const handleAddToCart = () => {
    onAddToCart(item);
    navigation.getParent()?.navigate('Cart');
  };


  const handleProductPress = () => {
    (navigation as any).navigate('ProductDetails', { product: item });
  };

  return (
    <TouchableOpacity style={styles.exploreCard} onPress={handleProductPress} activeOpacity={0.9}>
      <Image
        source={{ uri: item.image }}
        style={styles.exploreImage}
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center' }}
      />
      <View style={styles.exploreInfo}>
        <Text style={styles.exploreName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.exploreDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.exploreRating}>
          <View style={styles.exploreStars}>
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                name={i < Math.floor(item.rating) ? 'star' : i < item.rating ? 'star-half' : 'star-border'}
                size={12}
                color={theme.colors.primary}
              />
            ))}
          </View>
          <Text style={styles.exploreRatingText}>
            {item.rating} ({item.reviewCount})
          </Text>
        </View>
        <View style={styles.explorePriceRow}>
          <Text style={styles.explorePrice}>₹{item.price}</Text>
          {item.originalPrice && item.originalPrice > item.price && (
            <Text style={styles.exploreOriginalPrice}>₹{item.originalPrice}</Text>
          )}
          <TouchableOpacity
            style={styles.exploreAddButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Icon name="add-shopping-cart" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ExploreScreen: React.FC = () => {
  const { addToCart, cart } = useCart();
  const { strings } = useLanguage();
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<'featured' | 'popular' | 'new'>('featured');
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get authentication token
  const getAuthToken = async (): Promise<string> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token || TEST_TOKEN;
    } catch (error) {
      console.error('Error getting token:', error);
      return TEST_TOKEN;
    }
  };

  // Fetch subcategories
  const fetchSubCategories = async (token: string) => {
    try {
      const subCategoriesUrl = buildUrl(API_CONFIG.ENDPOINTS.SUBCATEGORIES_API.GET_ALL);
      console.log('Fetching subcategories from:', subCategoriesUrl);

      const response = await fetch(subCategoriesUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: SubCategoriesResponse = await response.json();
        console.log('Subcategories API Response:', data);

        if (data.success && data.data && Array.isArray(data.data.data)) {
          setSubCategories(data.data.data);
          console.log('Subcategories set successfully:', data.data.data.length);
        } else {
          console.warn('Unexpected subcategories response structure:', data);
          setSubCategories([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch subcategories:', response.status, response.statusText, errorText);
        setError(`Failed to load subcategories: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setError('Network error while loading subcategories');
    }
  };

  // Fetch products
  const fetchProducts = async (token: string) => {
    try {
      // Build products API URL - adjust the endpoint as per your API
      const productsUrl = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS_API?.GET_ALL || '/products/getAll');
      console.log('Fetching products from:', productsUrl);

      const response = await fetch(productsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ProductsResponse = await response.json();
        console.log('Products API Response:', data);

        if (data.success && data.data && Array.isArray(data.data.data)) {
          // Transform API response to match Product interface
          const transformedProducts: Product[] = data.data.data.map((product: ProductResponse) => ({
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            rating: product.rating || 4.0, // Default rating if not provided
            reviewCount: product.reviewCount || 0,
            category: product.category,
            inStock: product.inStock,
            quantity: 1
          }));

          // setProducts(transformedProducts);
          console.log('Products set successfully:', transformedProducts.length);
        } else {
          console.warn('Unexpected products response structure:', data);
          // Fallback to sample data if API structure is unexpected

        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch products:', response.status, response.statusText, errorText);
        console.log('Falling back to sample products due to API error');
        // Fallback to sample data

      }
    } catch (error) {
      console.error('Error fetching products:', error);
      console.log('Falling back to sample products due to network error');
      // Fallback to sample data

    }
  };

  // Sample products fallback

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setProductsLoading(true);
      setError(null);

      const token = await getAuthToken();
      console.log('Using token for API calls');

      // Fetch subcategories and products in parallel
      await Promise.all([
        fetchSubCategories(token),
        fetchProducts(token)
      ]);

    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products based on selection
  const getFilteredProducts = () => {
    const filteredProducts = products.filter(product => {
      switch (selectedFilter) {
        case 'featured':
          return product.rating >= 4.5;
        case 'popular':
          return product.reviewCount > 50;
        case 'new':
          return true; // Show all as "new" for now
        default:
          return true;
      }
    });

    // For new arrivals, show first 8 products
    if (selectedFilter === 'new') {
      return filteredProducts.slice(0, 8);
    }

    return filteredProducts;
  };

  const filters = [
    { key: 'featured', label: strings?.home?.categories?.sonaMasooriRice || 'Featured', icon: 'star' },
    { key: 'popular', label: strings?.home?.categories?.parboiledRice || 'Popular', icon: 'trending-up' },
    { key: 'new', label: strings?.home?.categories?.sonaMasooriSteamRice || 'New Arrivals', icon: 'new-releases' },
  ];

  const renderFilter = ({ item }: { item: typeof filters[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.key && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(item.key as 'featured' | 'popular' | 'new')}
    >
      <Icon
        name={item.icon}
        size={18}
        color={selectedFilter === item.key ? 'white' : theme.colors.primary}
      />
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.key && styles.filterTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ExploreItem item={item} onAddToCart={addToCart} />
  );

  const renderSubCategory = ({ item }: { item: SubCategory }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('Navigating to category products for:', item.name);
        // Navigate to a category products screen or filter products by category
        // For now, we'll navigate to Home with category filter
        navigation.getParent()?.navigate('Home', {
          screen: 'RiceCategory',
          params: { categoryId: item._id, categoryName: item.name }
        });
      }}
      style={styles.subCategoryCard}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.subCategoryImage}
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=100&h=100&fit=crop&crop=center' }}
      />
      <Text style={styles.subCategoryName} numberOfLines={2}>{item.name}</Text>
      {item.description && (
        <Text style={styles.subCategoryDescription} numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>{strings?.navigation?.explore || 'Explore'}</Text>
              <Text style={styles.headerSubtitle}>{strings?.home?.welcome || 'Discover amazing rice varieties'}</Text>
            </View>
            <TouchableOpacity
              style={styles.cartIconContainer}
              onPress={() => navigation.getParent()?.navigate('Cart')}
            >
              <Icon name="shopping-cart" size={24} color={theme.colors.primary} />
              {cart.items.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Filters Section */}
          <View style={styles.filterSection}>
            <FlatList
              horizontal
              data={filters}
              renderItem={renderFilter}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            />
          </View>
        </View>

        <View style={styles.exploreSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {/* SubCategories Section */}
              {subCategories.length > 0 && (
                <View style={styles.subCategoriesSection}>
                  <Text style={styles.sectionTitle}>Rice Categories</Text>
                  <Text style={styles.sectionSubtitle}>Explore different varieties of premium rice</Text>
                  <FlatList
                    horizontal
                    data={subCategories}
                    renderItem={renderSubCategory}
                    keyExtractor={(item) => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subCategoriesList}
                  />
                </View>
              )}

              {/* Products Section */}
              <View style={styles.productsSection}>
                <Text style={styles.sectionTitle}>
                  {selectedFilter === 'featured' && 'Featured Products'}
                  {selectedFilter === 'popular' && 'Popular Products'}
                  {selectedFilter === 'new' && 'New Arrivals'}
                </Text>

                {productsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading products...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={60} color={theme.colors.error || '#ff4444'} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={fetchData}
                    >
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={getFilteredProducts()}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    contentContainerStyle={styles.exploreList}
                    columnWrapperStyle={styles.exploreRow}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Icon name="search-off" size={60} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No products found</Text>
                        <Text style={styles.emptySubtext}>Try selecting a different filter</Text>
                      </View>
                    }
                  />
                )}
              </View>
            </>
          )}
        </View>
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
  header: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.large,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
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
  headerTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  headerSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.family.regular,
  },
  filterSection: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.medium,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    marginRight: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 120,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filterText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.medium,
    marginLeft: theme.spacing.small,
  },
  filterTextActive: {
    color: 'white',
    fontFamily: theme.fonts.family.bold,
  },
  exploreSection: {
    flex: 1,
    paddingTop: theme.spacing.medium,
  },
  subCategoriesSection: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.large,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginHorizontal: theme.spacing.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productsSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  sectionSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.regular,
  },
  subCategoriesList: {
    paddingRight: theme.spacing.medium,
  },
  subCategoryCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginRight: theme.spacing.medium,
    width: 120,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  subCategoryImage: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  subCategoryName: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.medium,
    textAlign: 'center',
    marginBottom: 2,
  },
  subCategoryDescription: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
    textAlign: 'center',
  },
  exploreList: {
    paddingBottom: theme.spacing.large,
  },
  exploreRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium,
  },
  exploreCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    width: (width - theme.spacing.medium * 3) / 2,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.08)',
  },
  exploreImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    resizeMode: 'cover',
  },
  exploreInfo: {
    alignItems: 'center',
    width: '100%',
  },
  exploreName: {
    fontSize: theme.fonts.size.small,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
    height: 32,
  },
  exploreDescription: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
    width: '100%',
    height: 28,
  },
  exploreRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  exploreStars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  exploreRatingText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
  },
  explorePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  explorePrice: {
    fontSize: theme.fonts.size.medium,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  exploreOriginalPrice: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  exploreAddButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorText: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.error || '#ff4444',
    marginTop: theme.spacing.medium,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginTop: theme.spacing.medium,
  },
  retryText: {
    color: 'white',
    fontSize: theme.fonts.size.medium,
    fontFamily: theme.fonts.family.bold,
  },
});

export default ExploreScreen;