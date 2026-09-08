import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { useCart } from '../context/CartContext'
import { Product } from '../constants/products'
import SkeletonLoader from '../components/SkeletonLoader'
import HeaderSkeleton from '../components/HeaderSkeleton'
import BannerSkeleton from '../components/BannerSkeleton'
import { theme } from '../constants/theme'

const GRADIENT_COLORS: string[] = ['#1b50aa', '#3d81e8']

export default function ExploreScreen() {
  const { addToCart, addOrUpdateToCart } = useCart()
  const navigation = useNavigation<any>()
  const [products, setProducts] = useState<any>([])
  const [loading, setLoading] = useState<any>(true)
  const [searchQuery, setSearchQuery] = useState<any>('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const fadeAnim = useState(new Animated.Value(0))[0]
  const searchFocusAnim = useState(new Animated.Value(0))[0]

  const fetchProducts = useCallback(async (currentPage = 1, isLoadMore = false) => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken')

      if (!storedToken) {
        Alert.alert('Error', 'User token not found')
        setLoading(false)
        return
      }

      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const response = await fetch(`https://api.nvsricemart.com/nvs-rice-mart/products/getAll?page=${currentPage}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      })
      const data = await response.json()
      if (data.success) {
        const formattedProducts = data.data.data.map((product: any) => ({
          id: product._id,
          name: product.name,
          price: `₹${product.generalPrice}`,
          image: product.image,
          category: product.type || 'Grocery',
          brand: product.brand,
          description: product.description,
          weight: `${product.weightInKg}kg`,
          rating: 4.5,
          isFavorite: false,
          stockQuantity: product.stockQuantity,
          sku: product.SKU
        }))

        if (isLoadMore) {
          setProducts((prevProducts: any[]) => [...prevProducts, ...formattedProducts])
        } else {
          setProducts(formattedProducts)
        }

        if (formattedProducts.length < 10) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }

        if (!isLoadMore) {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start()
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      Alert.alert('Error', 'Failed to load products. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [fadeAnim])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchProducts(1, false)
  }, [fetchProducts])

  const onRefresh = () => {
    setRefreshing(true)
    setPage(1)
    setHasMore(true)
    fetchProducts(1, false)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore && !refreshing) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(nextPage, true)
    }
  }

  const handleProductPress = (item: any) => {
    (navigation as any).navigate('ProductDetails', { product: item });
  };

  const toggleFavorite = (productId: any) => {
    setProducts(products.map((product: any) =>
      product.id === productId
        ? { ...product, isFavorite: !product.isFavorite }
        : product
    ))
  }

  const handleAddToCart = async (product: any) => {
    const productForCart: Product = {
      id: product.id,
      name: product.name,
      price: parseInt(product.price.replace('₹', ''), 10),
      description: product.description || '',
      image: product.image,
      category: product.category,
      weight: product.weight,
      brand: product.brand,
      rating: product.rating || 4.5,
      reviewCount: 0,
      inStock: product.stockQuantity > 0,
      discount: 0,
      nutritionInfo: {
        calories: '130 kcal',
        protein: '2.7 g',
        carbs: '28 g',
        fat: '0.3 g',
        fiber: '0.4 g'
      },
      specifications: {
        origin: 'India',
        processing: 'Premium',
        shelfLife: '18 months',
        storage: 'Store in cool, dry place'
      }
    }

    try {
      console.log('🛒 Explore - Add to Cart clicked for product:', product.name);
      console.log('🛒 Explore - Product ID:', product.id);
      console.log('🛒 Explore - Quantity: 1');

      const success = await addOrUpdateToCart(product.id, 1);

      if (success) {
        console.log('✅ Explore - Cart API call successful');
        addToCart(productForCart);
        Alert.alert(
          'Success! 🎉',
          `${product.name} added to cart!`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel'
            },
            {
              text: 'View Cart',
              onPress: () => {
                navigation.getParent()?.navigate('Cart');
              }
            }
          ]
        );
      } else {
        console.log('❌ Explore - Cart API call failed');
        addToCart(productForCart);
        Alert.alert(
          'Partial Success ⚠️',
          `${product.name} added locally but server sync failed.`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel'
            },
            {
              text: 'View Cart',
              onPress: () => {
                navigation.getParent()?.navigate('Cart');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Explore - Error in handleAddToCart:', error);
      addToCart(productForCart);
      Alert.alert(
        'Network Error ⚠️',
        `${product.name} added locally. Server sync will happen when online.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel'
          },
          {
            text: 'View Cart',
            onPress: () => {
              navigation.getParent()?.navigate('Cart');
            }
          }
        ]
      );
    }
  }

  const categories = useMemo(() => {
    const cats = ['All']
    products.forEach((p: any) => {
      if (p.category && !cats.includes(p.category)) {
        cats.push(p.category)
      }
    })
    return cats
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === 'All' ||
        product.category === activeCategory ||
        product.name.toLowerCase().includes(activeCategory.toLowerCase())
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, activeCategory])

  const renderCategoryItem = ({ item }: { item: string }) => {
    const isActive = item === activeCategory
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setActiveCategory(item)
          Animated.spring(searchFocusAnim, { toValue: 0, useNativeDriver: false }).start()
        }}
        style={[
          styles.categoryButton,
          isActive && styles.categoryButtonActive,
        ]}
      >
        {isActive ? (
          <LinearGradient colors={GRADIENT_COLORS} style={styles.categoryButtonGradient}>
            <Text style={[styles.categoryButtonText, styles.categoryButtonTextActive]}>{item}</Text>
          </LinearGradient>
        ) : (
          <Text style={styles.categoryButtonText}>{item}</Text>
        )}
      </TouchableOpacity>
    )
  }

  const renderProductItem = ({ item }: any) => (
    <Animated.View
      style={[
        styles.productCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }
      ]}
    >
      <TouchableOpacity onPress={() => handleProductPress(item)}>
        <View style={styles.imageWrap}>
          {item.stockQuantity === 0 && <View style={styles.soldOutOverlay} />}
          <Image
            source={{ uri: item.image }}
            style={[
              styles.productImage,
              item.stockQuantity === 0 && styles.outOfStockImage
            ]}
            resizeMode="cover"
            defaultSource={require('../assets/img/logos.jpeg')}
          />
          {item.stockQuantity === 0 && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutBadgeText}>Sold Out</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({42})</Text>
          </View>
          <View style={styles.priceWeightContainer}>
            <Text style={styles.productPrice}>{item.price}</Text>
            <Text style={styles.productWeight}>{item.weight}</Text>
          </View>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={[
            styles.stockText,
            item.stockQuantity === 0 ? styles.outOfStockText :
              item.stockQuantity <= 10 ? styles.lowStockText : styles.inStockText
          ]}>
            {item.stockQuantity === 0 ? 'Out of Stock' : `${item.stockQuantity} in stock`}
          </Text>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              item.stockQuantity === 0 && styles.addToCartButtonDisabled
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={item.stockQuantity === 0}
          >
            {item.stockQuantity === 0 ? (
              <Ionicons name="close-circle" size={16} color="#ccc" />
            ) : (
              <LinearGradient colors={GRADIENT_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cartIconGradient}>
                <Ionicons name="add-circle" size={18} color="white" />
              </LinearGradient>
            )}
            <Text style={[
              styles.addToCartButtonText,
              item.stockQuantity === 0 && styles.addToCartButtonTextDisabled
            ]}>
              {item.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.favoriteButton, item.isFavorite && styles.favoriteButtonFilled]}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={item.isFavorite ? '#FF6B6B' : '#666'}
          />
        </TouchableOpacity>

        {item.stockQuantity > 0 && item.stockQuantity <= 10 && (
          <View style={styles.lowStockWrap}>
            <Text style={styles.lowStockText}>Low Stock</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.card} />
        <HeaderSkeleton animatedValue={fadeAnim} />
        <BannerSkeleton animatedValue={fadeAnim} />
        <SkeletonLoader count={8} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.card} />

      {/* Header */}
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>Fresh rice varieties & grocery</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              borderColor: searchFocusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(255,255,255,0.3)', theme.colors.primary],
              }),
              shadowOpacity: searchFocusAnim,
            },
          ]}
        >
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => Animated.timing(searchFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
            onBlur={() => Animated.timing(searchFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </LinearGradient>
      <View style={styles.categoriesContainer}>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.columnWrapper}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color={theme.colors.primary} /> : null}
        ListEmptyComponent={
          searchQuery || activeCategory !== 'All' ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <SkeletonLoader count={6} />
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bannerContent: {
    flex: 1,
    paddingRight: 8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5a4500',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#7a6620',
    marginBottom: 8,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  bannerImage: {
    width: 80,
    height: 80,
  },
  categoriesContainer: {
    backgroundColor: theme.colors.card,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#f4f6fb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 80, 170, 0.08)',
  },
  categoryButtonGradient: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  productsList: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: theme.colors.card,
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
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  outOfStockImage: {
    opacity: 0.5,
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  soldOutBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  soldOutBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lowStockWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
  favoriteButtonFilled: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  productInfo: {
    paddingHorizontal: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 18,
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  priceWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  productWeight: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryTag: {
    backgroundColor: '#f1f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#856404',
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#721C24',
  },
  inStockText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#155724',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 5,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  cartIconGradient: {
    borderRadius: 10,
    padding: 2,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addToCartButtonTextDisabled: {
    color: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
})
