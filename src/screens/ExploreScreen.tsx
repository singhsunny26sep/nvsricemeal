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
  Alert
} from 'react-native'
import React, { useState, useEffect } from 'react'
import Ionicons from "react-native-vector-icons/Ionicons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCart } from '../context/CartContext'
import { Product } from '../constants/products'

export default function ExploreScreen() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<any>([])
  const [loading, setLoading] = useState<any>(true)
  const [searchQuery, setSearchQuery] = useState<any>('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [refreshing, setRefreshing] = useState(false)
  const fadeAnim = useState(new Animated.Value(0))[0]
  const categories = ['All', 'Rice', 'Grocery', 'Basmati', 'Steam']

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken')

      if (!storedToken) {
        Alert.alert('Error', 'User token not found')
        setLoading(false)
        return
      }

      const response = await fetch('https://nvs-rice-mart.onrender.com/nvs-rice-mart/products/getAll', {
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
          rating: 4.5, // You can add rating to your API or calculate dynamically
          isFavorite: false,
          stockQuantity: product.stockQuantity,
          sku: product.SKU
        }))

        setProducts(formattedProducts)

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start()
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      Alert.alert('Error', 'Failed to load products. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchProducts()
  }

  const toggleFavorite = (productId: any) => {
    setProducts(products.map((product: any) =>
      product.id === productId
        ? { ...product, isFavorite: !product.isFavorite }
        : product
    ))
  }

  const handleAddToCart = (product: any) => {
    // Transform product to match Product interface
    const productForCart: Product = {
      id: product.id,
      name: product.name,
      price: parseInt(product.price.replace('₹', '')), // Convert "₹800" to 800
      description: product.description || '',
      image: product.image,
      category: product.category,
      weight: product.weight,
      brand: product.brand,
      rating: product.rating || 4.5,
      reviewCount: 0, // Default since not in API
      inStock: product.stockQuantity > 0,
      discount: 0, // Default since not in API
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

    addToCart(productForCart)

    // Show success feedback
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
            // You can navigate to cart here if you have navigation
            console.log('Navigate to cart')
          }
        }
      ]
    )
  }

  const renderProductItem = ({ item, index }: any) => (
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
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons
          name={item.isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={item.isFavorite ? "#FF6B6B" : "#666"}
        />
      </TouchableOpacity>

      {/* Stock Status Badge */}
      {item.stockQuantity <= 10 && item.stockQuantity > 0 && (
        <View style={styles.lowStockBadge}>
          <Text style={styles.lowStockText}>Low Stock</Text>
        </View>
      )}

      {item.stockQuantity === 0 && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}

      <Image
        source={{ uri: item.image }}
        style={[
          styles.productImage,
          item.stockQuantity === 0 && styles.outOfStockImage
        ]}
        resizeMode="cover"
        defaultSource={require('../assets/img/logo.png')} // Add a placeholder image
      />

      <View style={styles.productInfo}>
        <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>

        <View style={styles.priceWeightContainer}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <Text style={styles.productWeight}>{item.weight}</Text>
        </View>

        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {/* Stock Information */}
        <Text style={[
          styles.stockText,
          item.stockQuantity === 0 ? styles.outOfStockText :
            item.stockQuantity <= 10 ? styles.lowStockText : styles.inStockText
        ]}>
          {item.stockQuantity === 0 ? 'Out of Stock' : `${item.stockQuantity} in stock`}
        </Text>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            item.stockQuantity === 0 && styles.addToCartButtonDisabled
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={item.stockQuantity === 0}
        >
          <Ionicons
            name={item.stockQuantity === 0 ? "close-circle" : "add-circle"}
            size={16}
            color={item.stockQuantity === 0 ? "#ccc" : "white"}
          />
          <Text style={[
            styles.addToCartButtonText,
            item.stockQuantity === 0 && styles.addToCartButtonTextDisabled
          ]}>
            {item.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' ||
      product.category === activeCategory ||
      product.name.toLowerCase().includes(activeCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.columnWrapper}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery || activeCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'No products available'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
 marginBottom:60
  },
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  productsList: {
    padding: 16,
    paddingTop: 8,
   
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,

  },
  productCard: {
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
    position: 'relative',
   
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
  lowStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    backgroundColor: '#F8D7DA',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  outOfStockImage: {
    opacity: 0.5,
  },
  productInfo: {
    paddingHorizontal: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 18,
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
  priceWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
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
    color: '#6366F1',
    textTransform: 'uppercase',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
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
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addToCartButtonTextDisabled: {
    color: '#ccc',
  },
})