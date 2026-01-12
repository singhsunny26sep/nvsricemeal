import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import { apiService } from '../utils/apiService';
import { LocationChecker, SavedLocation } from '../utils/locationChecker';
import AddToCartModal from '../components/AddToCartModal';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
}

interface ProductDetailsRouteParams {
  product: Product;
  productId?: string;
  categoryId?: string;
}

const ProductDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { addToCart, setUserLocation, setPincode, addOrUpdateToCart } = useCart();
  const routeParams = route.params as ProductDetailsRouteParams;
  const { product } = routeParams;
  // Extract _id from product for API calls
  const productId = (product as any)._id || product.id;
  console.log('ProductDetails - Product ID:', productId);
  console.log('ProductDetails - Full product:', product);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiProduct, setApiProduct] = useState<Product | null>(null);
  const [relatedProductsData, setRelatedProductsData] = useState<RelatedProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [hasCheckedLocations, setHasCheckedLocations] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  
  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get product ID from route params or use the product from navigation
        let productId = '';
        
        // Check if product ID is passed directly in route params
        if (routeParams.productId) {
          productId = routeParams.productId;
        }
        // Check if product data is passed with an ID
        else if ((product as any)._id) {
          productId = (product as any)._id;
        }
        // Fallback to the product.id from the passed product
        else if (product.id) {
          productId = product.id;
        }
        
        console.log('Fetching product details for ID:', productId);
        
        if (productId) {
          const response = await apiService.getProductById(productId);
          
          if (response.success && response.data) {
            console.log('🎯 Product details API Response:', response.data);
            
            // Transform API response to match Product interface
            // Handle both single product and paginated response
            const apiProductData = response.data.data?.data?.[0] || response.data.data || response.data;
            console.log('🎯 Product data from API:', apiProductData);
            console.log('🎯 API Product structure:', {
              hasId: !!apiProductData._id,
              hasName: !!apiProductData.name,
              hasPrice: !!apiProductData.generalPrice,
              hasImage: !!apiProductData.image,
              stockQuantity: apiProductData.stockQuantity,
              isActive: apiProductData.isActive,
              isArray: Array.isArray(response.data.data?.data)
            });
            
            const transformedProduct: Product = {
              id: apiProductData._id || apiProductData.id || productId,
              name: apiProductData.name || apiProductData.productName || '',
              price: apiProductData.generalPrice || apiProductData.price || 0,
              originalPrice: apiProductData.generalPrice || apiProductData.originalPrice || apiProductData.mrp,
              discount: apiProductData.discount || 0,
              image: apiProductData.image || apiProductData.images?.[0] || '',
              images: [apiProductData.image].filter(Boolean),
              rating: apiProductData.rating || apiProductData.averageRating || 4.5,
              reviewCount: apiProductData.reviewCount || apiProductData.totalReviews || 0,
              description: apiProductData.description || apiProductData.productDescription || '',
              inStock: (apiProductData.stockQuantity || 0) > 0 && apiProductData.isActive !== false,
              category: product?.category || apiProductData.category || apiProductData.categoryName || '',
              brand: apiProductData.brand || '',
              weight: `${apiProductData.weightInKg || 1} kg`,
              specifications: {
                origin: apiProductData.origin || 'India',
                processing: apiProductData.processing || 'Premium',
                shelfLife: apiProductData.shelfLife || '18 months',
                storage: apiProductData.storage || 'Store in cool, dry place'
              },
              nutritionInfo: apiProductData.nutritionInfo || {
                calories: '130 kcal',
                protein: '2.7 g',
                carbs: '28 g',
                fat: '0.3 g',
                fiber: '0.4 g'
              }
            };
            
            console.log('🎯 Transformed product:', transformedProduct);
            setApiProduct(transformedProduct);
          } else {
            setError(response.error || 'Failed to fetch product details');
            console.error('❌ API Error:', response.error);
          }
        } else {
          setError('Product ID not found');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [routeParams.productId, routeParams.categoryId, product.id, (product as any)._id]);

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      user: 'Rajesh K.',
      rating: 5,
      comment: 'Excellent quality basmati rice. Perfect for biryani! The aroma and grain length are exceptional.',
      date: '2024-01-10',
    },
    {
      id: '2',
      user: 'Priya M.',
      rating: 4,
      comment: 'Good rice, nice aroma. Will buy again. Delivery was prompt and packaging was secure.',
      date: '2024-01-08',
    },
    {
      id: '3',
      user: 'Amit S.',
      rating: 5,
      comment: 'Best basmati rice I have tried. Highly recommended for daily cooking and special occasions.',
      date: '2024-01-05',
    },
    {
      id: '4',
      user: 'Sneha R.',
      rating: 4,
      comment: 'Good value for money. Rice cooks well and has nice fragrance.',
      date: '2024-01-03',
    },
  ];

  // Fetch related products from API
  const fetchRelatedProducts = async (category: string) => {
    console.log('🔍 fetchRelatedProducts called with category:', category);
    console.log('🔍 Current productId:', productId);
    console.log('🔍 Route params:', routeParams);
    
    try {
      setRelatedLoading(true);
      
      // Use the API to get all products, then filter by category
      const response = await apiService.getAllProducts();
      
      if (response.success && response.data) {
        console.log('📦 Related products API response:', response.data);
        
        // Handle the actual API response structure
        // response.data contains: {success: true, message: "...", data: {total: 4, data: [...]}}
        const apiResponse = response.data;
        const dataContainer = apiResponse.data; // This contains pagination info
        const products = dataContainer.data || []; // This is the actual products array
        
        console.log('📦 API Response structure:', {
          hasSuccess: !!apiResponse.success,
          message: apiResponse.message,
          hasData: !!apiResponse.data,
          total: dataContainer.total,
          totalPages: dataContainer.totalPages,
          productsLength: products.length,
          firstProductName: products[0]?.name
        });
        
        // Transform API response to match RelatedProduct interface
        const transformedProducts: RelatedProduct[] = products.map((product: any, index: number) => {
          const transformed = {
            id: product._id || '',
            name: product.name || product.productName || '',
            price: product.generalPrice || product.price || 0,
            originalPrice: product.generalPrice || product.mrp || product.price || 0,
            discount: product.discount || 0,
            image: product.image || product.images?.[0] || '',
            rating: product.rating || product.averageRating || 4.5,
            reviewCount: product.reviewCount || product.totalReviews || 0,
            category: product.category || product.categoryName || category || '',
            inStock: (product.stockQuantity || 0) > 0 && product.isActive !== false,
          };
          
          console.log(`🎯 Transform Product ${index}:`, {
            originalName: product.name,
            transformedName: transformed.name,
            originalPrice: product.generalPrice,
            transformedPrice: transformed.price,
            stockQuantity: product.stockQuantity,
            isActive: product.isActive,
            inStock: transformed.inStock
          });
          
          return transformed;
        });
        
        console.log('🎯 Current Product ID to filter out:', productId);
        console.log('🎯 All transformed products before filtering:', transformedProducts.map(p => ({ id: p.id, name: p.name })));
        
        // Filter out the current product from related products
        const filteredProducts = transformedProducts.filter(product => {
          const shouldExclude = product.id !== productId;
          console.log(`🎯 Filter check - Product ${product.name} (${product.id}):`, {
            productId,
            currentProductId: product.id,
            shouldExclude
          });
          return shouldExclude;
        });
        
        // Limit to 5 products
        const limitedProducts = filteredProducts.slice(0, 5);
        
        setRelatedProductsData(limitedProducts);
        
        console.log('🎯 Final related products after filtering:', limitedProducts);
        console.log('🎯 Product IDs in final related products:', limitedProducts.map(p => p.id));
      } else {
        console.warn('❌ Failed to fetch related products:', response.error);
        console.warn('❌ Response details:', {
          success: response.success,
          hasData: !!response.data,
          dataContent: response.data
        });
        // Fallback to empty array if API fails
        setRelatedProductsData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching related products:', error);
      // Fallback to empty array on error
      setRelatedProductsData([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Call fetch related products when component mounts or category changes
  useEffect(() => {
    const category = apiProduct?.category || product?.category;
    console.log('🔄 useEffect triggered for fetchRelatedProducts');
    console.log('🔄 API product category:', apiProduct?.category);
    console.log('🔄 Navigation product category:', product?.category);
    console.log('🔄 Final category to use:', category);
    
    if (category) {
      console.log('🔄 Calling fetchRelatedProducts with category:', category);
      fetchRelatedProducts(category);
    } else {
      console.log('⚠️ No category found, skipping fetchRelatedProducts');
    }
  }, [apiProduct?.category, product?.category]);

  // Related products from API
  const relatedProducts: RelatedProduct[] = relatedProductsData;

  // Check for saved locations when user first views the page
  useEffect(() => {
    const checkUserLocations = async () => {
      if (!hasCheckedLocations) {
        setHasCheckedLocations(true);
        const locations = await LocationChecker.getSavedLocations();
        setSavedLocations(locations || []);
      }
    };
    
    checkUserLocations();
  }, [hasCheckedLocations]);

  const handleAddToCart = async () => {
    try {
      console.log('🛒 ProductDetails - Add to Cart clicked for product:', displayProduct.name);
      console.log('🛒 ProductDetails - Product ID:', displayProduct.id);
      console.log('🛒 ProductDetails - Quantity:', quantity);

      // Call the cart API to add/update item
      const success = await addOrUpdateToCart(displayProduct.id, quantity);

      if (success) {
        console.log('✅ ProductDetails - Cart API call successful');

        // Also update local cart for immediate UI feedback
        addToCart(displayProduct);

        // Show success feedback
        Alert.alert(
          'Success! 🎉',
          `${quantity} ${displayProduct.name} added to cart!`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel'
            },
            {
              text: 'View Cart',
              onPress: () => {
                // Navigate to cart tab
                (navigation as any).getParent()?.navigate('Cart');
              }
            }
          ]
        );
      } else {
        console.log('❌ ProductDetails - Cart API call failed');

        // Still update local cart as fallback
        addToCart(displayProduct);

        // Show partial success feedback
        Alert.alert(
          'Partial Success ⚠️',
          `${quantity} ${displayProduct.name} added locally but server sync failed.`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel'
            },
            {
              text: 'View Cart',
              onPress: () => {
                // Navigate to cart tab
                (navigation as any).getParent()?.navigate('Cart');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ ProductDetails - Error in handleAddToCart:', error);
      // Fallback to local cart update
      addToCart(displayProduct);

      Alert.alert(
        'Network Error ⚠️',
        `${quantity} ${displayProduct.name} added locally. Server sync will happen when online.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel'
          },
          {
            text: 'View Cart',
            onPress: () => {
              // Navigate to cart tab
              (navigation as any).getParent()?.navigate('Cart');
            }
          }
        ]
      );
    }
  };

  const proceedWithAddToCart = async () => {
    try {
      // Set user location if available
      if (savedLocations.length > 0) {
        const primaryLocation = savedLocations[0]; // Use the first (most recent) location
        setUserLocation({
          coordinates: primaryLocation.coordinates,
          address: formatLocationDisplay(primaryLocation),
          name: primaryLocation.name || primaryLocation.address || 'Saved Location'
        });
      }

      console.log('🛒 Add to Cart clicked for product:', displayProduct.name);
      console.log('🛒 Product ID:', displayProduct.id);
      console.log('🛒 Quantity:', quantity);

      // Call the cart API to add/update item
      const success = await addOrUpdateToCart(displayProduct.id, quantity);

      if (success) {
        console.log('✅ Cart API call successful');
        
        // Also update local cart for immediate UI feedback
        addToCart(displayProduct);
        
        // Show success message and navigate to cart
        Alert.alert(
          'Success! 🎉',
          `${quantity} ${displayProduct.name} added to cart!\n\nRedirecting to payment...`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to Cart tab for payment
                (navigation as any).getParent()?.navigate('Cart');
              }
            }
          ]
        );
      } else {
        console.log('❌ Cart API call failed');
        
        // Still update local cart as fallback
        addToCart(displayProduct);
        
        // Show error message
        Alert.alert(
          'Partial Success ⚠️',
          `Item added locally but server sync failed.\nPlease check your internet connection.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Still navigate to cart
                (navigation as any).getParent()?.navigate('Cart');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error in proceedWithAddToCart:', error);
      
      // Fallback to local cart update
      addToCart(displayProduct);
      
      Alert.alert(
        'Network Error ⚠️',
        `Item added locally. Server sync will happen when you're back online.`,
        [
          {
            text: 'OK',
            onPress: () => {
              (navigation as any).getParent()?.navigate('Cart');
            }
          }
        ]
      );
    }
  };

  const handleLocationPromptResponse = (action: 'add' | 'skip') => {
    setShowLocationPrompt(false);
    
    if (action === 'add') {
      // Navigate to location fill page
      (navigation as any).navigate('Location');
    } else {
      // Skip and add to cart directly
      proceedWithAddToCart();
    }
  };

  const handleAddToCartModalConfirm = async (zipCode: string) => {
    setShowAddToCartModal(false);
    
    try {
      console.log('🛒 Add to Cart with zipcode:', zipCode);
      console.log('🛒 Product:', displayProduct.name);
      console.log('🛒 Quantity:', quantity);

      // Set the pincode in cart context
      setPincode(zipCode, true); // Assume delivery is available for now

      // Call the cart API to add/update item
      const success = await addOrUpdateToCart(displayProduct.id, quantity);

      if (success) {
        console.log('✅ Cart API call successful');
        
        // Also update local cart for immediate UI feedback
        addToCart(displayProduct);
        
        // Show success message and navigate to cart
        Alert.alert(
          'Success! 🎉',
          `${quantity} ${displayProduct.name} added to cart!\nDelivery to ${zipCode} confirmed.\n\nRedirecting to cart...`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to Cart tab for payment
                (navigation as any).getParent()?.navigate('Cart');
              }
            }
          ]
        );
      } else {
        console.log('❌ Cart API call failed');
        
        // Still update local cart as fallback
        addToCart(displayProduct);
        
        // Show error message
        Alert.alert(
          'Partial Success ⚠️',
          `Item added locally but server sync failed.\nPlease check your internet connection.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Still navigate to cart
                (navigation as any).getParent()?.navigate('Cart');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error in handleAddToCartModalConfirm:', error);
      
      // Fallback to local cart update
      addToCart(displayProduct);
      
      Alert.alert(
        'Network Error ⚠️',
        `Item added locally. Server sync will happen when you're back online.`,
        [
          {
            text: 'OK',
            onPress: () => {
              (navigation as any).getParent()?.navigate('Cart');
            }
          }
        ]
      );
    }
  };

  const handleAddToCartModalClose = () => {
    setShowAddToCartModal(false);
  };

  const formatLocationDisplay = (location: SavedLocation) => {
    const parts = [];
    
    if (location.name) parts.push(location.name);
    if (location.shopOrBuildingNumber) parts.push(location.shopOrBuildingNumber);
    if (location.address) parts.push(location.address);
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.district) parts.push(location.district);
    if (location.zipCode) parts.push(location.zipCode);
    if (location.state) parts.push(location.state);
    
    return parts.filter(Boolean).join(', ');
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleRelatedProductPress = (relatedProduct: RelatedProduct) => {
    // Navigate to the related product details
    (navigation as any).navigate('ProductDetails', { 
      product: {
        id: relatedProduct.id,
        name: relatedProduct.name,
        price: relatedProduct.price,
        originalPrice: relatedProduct.originalPrice,
        discount: relatedProduct.discount,
        image: relatedProduct.image,
        images: [relatedProduct.image],
        rating: relatedProduct.rating,
        reviewCount: relatedProduct.reviewCount,
        description: `Premium quality ${relatedProduct.name.toLowerCase()} with excellent taste and nutritional value.`,
        inStock: relatedProduct.inStock,
        category: relatedProduct.category,
        brand: 'Premium Grains',
        weight: '1 kg',
        specifications: {
          origin: 'India',
          processing: 'Polished',
          shelfLife: '18 months',
          storage: 'Store in cool, dry place'
        },
        nutritionInfo: {
          calories: '130 kcal',
          protein: '2.7 g',
          carbs: '28 g',
          fat: '0.3 g',
          fiber: '0.4 g'
        }
      }
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={16} color={theme.colors.primary} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color={theme.colors.primary} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-border" size={16} color={theme.colors.textSecondary} />
      );
    }

    return stars;
  };

  const renderImageThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        selectedImageIndex === index && styles.thumbnailActive,
      ]}
      onPress={() => setSelectedImageIndex(index)}
    >
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewUser}>{item.user}</Text>
        <View style={styles.reviewRating}>
          {renderStars(item.rating)}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>{item.date}</Text>
    </View>
  );

  const renderRelatedProduct = ({ item }: { item: RelatedProduct }) => (
    <TouchableOpacity 
      style={styles.relatedProduct}
      onPress={() => handleRelatedProductPress(item)}
    >
      <View style={styles.relatedProductImageContainer}>
        <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
        {item.discount && (
          <View style={styles.relatedProductDiscount}>
            <Text style={styles.relatedProductDiscountText}>{item.discount}% OFF</Text>
          </View>
        )}
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.relatedProductName} numberOfLines={2}>{item.name}</Text>
      
      <View style={styles.relatedProductPriceContainer}>
        <Text style={styles.relatedProductPrice}>₹{item.price}</Text>
        {item.originalPrice && (
          <Text style={styles.relatedProductOriginalPrice}>₹{item.originalPrice}</Text>
        )}
      </View>
      
      <View style={styles.relatedProductRatingContainer}>
        <View style={styles.relatedProductStars}>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.relatedProductRatingText}>({item.reviewCount})</Text>
      </View>
      
      <Text style={styles.relatedProductCategory}>{item.category}</Text>
      
      <TouchableOpacity 
        style={[
          styles.relatedProductAddButton,
          !item.inStock && styles.relatedProductAddButtonDisabled
        ]}
        disabled={!item.inStock}
      >
        <Icon 
          name="add-shopping-cart" 
          size={16} 
          color={item.inStock ? "white" : theme.colors.textSecondary} 
        />
        <Text style={[
          styles.relatedProductAddButtonText,
          !item.inStock && styles.relatedProductAddButtonTextDisabled
        ]}>
          {item.inStock ? 'Add' : 'Out of Stock'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Use API product data if available, otherwise fall back to navigation product
  const displayProduct = apiProduct || product;
  const images = displayProduct.images || [displayProduct.image];

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: theme.fonts.size.large, color: theme.colors.text }}>
          Loading product details...
        </Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="error-outline" size={48} color={theme.colors.error} />
        <Text style={{ fontSize: theme.fonts.size.large, color: theme.colors.text, marginTop: theme.spacing.medium }}>
          Error: {error}
        </Text>
        <TouchableOpacity 
          style={{ marginTop: theme.spacing.medium, padding: theme.spacing.medium }}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Trigger re-fetch
            const fetchProductDetails = async () => {
              try {
                let productId = '';
                
                if (routeParams.productId) {
                  productId = routeParams.productId;
                }
                else if ((product as any)._id) {
                  productId = (product as any)._id;
                }
                else if (product.id) {
                  productId = product.id;
                }
                
                if (productId) {
                  const response = await apiService.getProductById(productId);
                  
                  if (response.success && response.data) {
                    const apiProductData = response.data.data || response.data;
                    console.log('🔄 Retry - Product data from API:', apiProductData);
                    
                    const transformedProduct: Product = {
                      id: apiProductData._id || apiProductData.id || productId,
                      name: apiProductData.name || apiProductData.productName || '',
                      price: apiProductData.generalPrice || apiProductData.price || 0,
                      originalPrice: apiProductData.generalPrice || apiProductData.originalPrice || apiProductData.mrp,
                      discount: apiProductData.discount || 0,
                      image: apiProductData.image || apiProductData.images?.[0] || '',
                      images: [apiProductData.image].filter(Boolean),
                      rating: apiProductData.rating || apiProductData.averageRating || 4.5,
                      reviewCount: apiProductData.reviewCount || apiProductData.totalReviews || 0,
                      description: apiProductData.description || apiProductData.productDescription || '',
                      inStock: (apiProductData.stockQuantity || 0) > 0 && apiProductData.isActive !== false,
                      category: product?.category || apiProductData.category || apiProductData.categoryName || '',
                      brand: apiProductData.brand || '',
                      weight: `${apiProductData.weightInKg || 1} kg`,
                      specifications: {
                        origin: apiProductData.origin || 'India',
                        processing: apiProductData.processing || 'Premium',
                        shelfLife: apiProductData.shelfLife || '18 months',
                        storage: apiProductData.storage || 'Store in cool, dry place'
                      },
                      nutritionInfo: apiProductData.nutritionInfo || {
                        calories: '130 kcal',
                        protein: '2.7 g',
                        carbs: '28 g',
                        fat: '0.3 g',
                        fiber: '0.4 g'
                      }
                    };
                    
                    console.log('🔄 Retry - Transformed product:', transformedProduct);
                    setApiProduct(transformedProduct);
                  } else {
                    setError(response.error || 'Failed to fetch product details');
                  }
                } else {
                  setError('Product ID not found');
                }
              } catch (error) {
                console.error('Error fetching product details:', error);
                setError('Network error occurred');
              } finally {
                setLoading(false);
              }
            };
            
            fetchProductDetails();
          }}
        >
          <Text style={{ color: theme.colors.primary, fontSize: theme.fonts.size.medium }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Gallery */}
      <View style={styles.imageSection}>
        <Image source={{ uri: images[selectedImageIndex] }} style={styles.mainImage} />
        <FlatList
          horizontal
          data={images}
          renderItem={renderImageThumbnail}
          keyExtractor={(item, index) => index.toString()}
          style={styles.thumbnails}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.productName}>{displayProduct.name}</Text>
          {displayProduct.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{displayProduct.discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {renderStars(displayProduct.rating)}
          </View>
          <Text style={styles.ratingText}>
            {displayProduct.rating} ({displayProduct.reviewCount} reviews)
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{displayProduct.price}</Text>
          {displayProduct.originalPrice && (
            <Text style={styles.originalPrice}>
              ₹{displayProduct.originalPrice}
            </Text>
          )}
        </View>

        <View style={styles.stockInfo}>
          <Icon
            name={displayProduct.inStock ? "check-circle" : "cancel"}
            size={16}
            color={displayProduct.inStock ? theme.colors.success : theme.colors.error}
          />
          <Text style={[
            styles.stockText,
            { color: displayProduct.inStock ? theme.colors.success : theme.colors.error }
          ]}>
            {displayProduct.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>

        <Text style={styles.description}>{displayProduct.description}</Text>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Icon name="remove" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Icon name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[styles.addToCartButton, !displayProduct.inStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!displayProduct.inStock}
        >
          <Icon name="shopping-cart" size={20} color="white" />
          <Text style={styles.addToCartText}>
            {displayProduct.inStock ? `Add ${quantity} to Cart - ₹${displayProduct.price * quantity}` : 'Out of Stock'}
          </Text>
        </TouchableOpacity>

    
      </View>
      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'description', label: 'Description' },
          { key: 'specifications', label: 'Specifications' },
          { key: 'reviews', label: `Reviews (${reviews.length})` },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'description' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.sectionContent}>
              {displayProduct.description}{'\n\n'}
              Our premium basmati rice is carefully selected from the finest grains, ensuring exceptional quality and aroma. Each grain is long, slender, and aromatic, perfect for biryanis, pulao, and other traditional dishes.
            </Text>

            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Key Features:</Text>
              <View style={styles.featureListItem}>
                <Icon name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.featureListText}>100% Pure Basmati Rice</Text>
              </View>
              <View style={styles.featureListItem}>
                <Icon name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.featureListText}>Aged for Enhanced Flavor</Text>
              </View>
              <View style={styles.featureListItem}>
                <Icon name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.featureListText}>Extra Long Grains</Text>
              </View>
              <View style={styles.featureListItem}>
                <Icon name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.featureListText}>Natural Aroma</Text>
              </View>
              <View style={styles.featureListItem}>
                <Icon name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.featureListText}>No Artificial Additives</Text>
              </View>
            </View>

            {displayProduct.nutritionInfo && (
              <View style={styles.nutritionSection}>
                <Text style={styles.sectionTitle}>Nutrition Information (per 100g)</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>{displayProduct.nutritionInfo.calories}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{displayProduct.nutritionInfo.protein}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbohydrates</Text>
                    <Text style={styles.nutritionValue}>{displayProduct.nutritionInfo.carbs}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                    <Text style={styles.nutritionValue}>{displayProduct.nutritionInfo.fat}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fiber</Text>
                    <Text style={styles.nutritionValue}>{displayProduct.nutritionInfo.fiber}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Sugar</Text>
                    <Text style={styles.nutritionValue}>0.1g</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'specifications' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Product Specifications</Text>
            <View style={styles.specsContainer}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Brand:</Text>
                <Text style={styles.specValue}>{displayProduct.brand || 'Premium Grains'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Weight:</Text>
                <Text style={styles.specValue}>{displayProduct.weight || '1 kg'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Type:</Text>
                <Text style={styles.specValue}>Basmati Rice</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Grain Length:</Text>
                <Text style={styles.specValue}>Extra Long (8.3mm+)</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Aging:</Text>
                <Text style={styles.specValue}>1 Year Aged</Text>
              </View>
              {displayProduct.specifications && (
                <>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Origin:</Text>
                    <Text style={styles.specValue}>{displayProduct.specifications.origin}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Processing:</Text>
                    <Text style={styles.specValue}>{displayProduct.specifications.processing}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Shelf Life:</Text>
                    <Text style={styles.specValue}>{displayProduct.specifications.shelfLife}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Storage:</Text>
                    <Text style={styles.specValue}>{displayProduct.specifications.storage}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabSection}>
            <View style={styles.reviewsHeader}>
              <View>
                <Text style={styles.sectionTitle}>Customer Reviews</Text>
                <View style={styles.overallRating}>
                  <Text style={styles.overallRatingNumber}>{displayProduct.rating}</Text>
                  <View style={styles.overallRatingStars}>
                    {renderStars(displayProduct.rating)}
                  </View>
                  <Text style={styles.totalReviews}>{displayProduct.reviewCount} reviews</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.writeReviewButton}>
                <Icon name="edit" size={16} color="white" />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>

      {/* Related Products */}
      <View style={styles.relatedSection}>
        <View style={styles.relatedSectionHeader}>
          <Text style={styles.sectionTitle}>You Might Also Like ✨</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.relatedSectionSubtitle}>
          Customers who bought this also liked these products
        </Text>
        {relatedLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textSecondary }}>Loading related products...</Text>
          </View>
        ) : relatedProducts.length > 0 ? (
          <FlatList
            horizontal
            data={relatedProducts}
            renderItem={renderRelatedProduct}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
          />
        ) : (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textSecondary }}>No related products found</Text>
          </View>
        )}
      </View>

      {/* Recently Viewed */}
    
      {/* Location Prompt Modal */}
      {showLocationPrompt && (
        <View style={styles.locationPromptOverlay}>
          <View style={styles.locationPromptContainer}>
            <View style={styles.locationPromptHeader}>
              <Icon name="location-on" size={48} color={theme.colors.primary} />
              <Text style={styles.locationPromptTitle}>Add Delivery Location</Text>
              <Text style={styles.locationPromptSubtitle}>
                Please add your delivery location for better service
              </Text>
            </View>

            <View style={styles.locationPromptContent}>
              <TouchableOpacity
                style={styles.locationPromptButton}
                onPress={() => handleLocationPromptResponse('add')}
              >
                <Icon name="add-location" size={24} color="white" />
                <Text style={styles.locationPromptButtonText}>Add Location Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.locationPromptButton, styles.skipButton]}
                onPress={() => handleLocationPromptResponse('skip')}
              >
                <Text style={styles.locationPromptSkipText}>Skip for Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add to Cart Modal */}
      <AddToCartModal
        visible={showAddToCartModal}
        onClose={handleAddToCartModalClose}
        onConfirm={handleAddToCartModalConfirm}
        productName={displayProduct.name}
        quantity={quantity}
        totalPrice={displayProduct.price * quantity}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginBottom:50,
  },
  imageSection: {
    backgroundColor: theme.colors.card,
    paddingBottom: theme.spacing.medium,
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
    ...theme.shadows.card,
    elevation: 3,
    marginBottom: theme.spacing.medium,
  },
  mainImage: {
    width: width,
    height: 350,
    resizeMode: 'cover',
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },
  thumbnails: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: theme.colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.small,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.card,
    elevation: 3,
    marginHorizontal: theme.spacing.medium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.medium,
  },
  productName: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  discountBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  discountText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  stars: {
    flexDirection: 'row',
    marginRight: theme.spacing.small,
  },
  ratingText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  price: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  originalPrice: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    fontFamily: theme.fonts.family.regular,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  stockText: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  description: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.large,
    fontFamily: theme.fonts.family.regular,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
  },
  quantityLabel: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  quantityText: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.large,
    minWidth: 30,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.card,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: theme.spacing.large,
    marginHorizontal: theme.spacing.medium,
  },
  disabledButton: {
    backgroundColor: theme.colors.textSecondary,
  },
  addToCartText: {
    color: 'white',
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  quickFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    padding: 6,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.small,
    alignItems: 'center',
    borderRadius: theme.borderRadius.small,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
  },
  activeTabText: {
    color: 'white',
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  tabContent: {
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  tabSection: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  sectionContent: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    lineHeight: 22,
    fontFamily: theme.fonts.family.regular,
  },
  featuresList: {
    marginTop: theme.spacing.large,
  },
  featuresTitle: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  featureListText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  nutritionSection: {
    marginTop: theme.spacing.large,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  nutritionValue: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  specsContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  specLabel: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  specValue: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.large,
  },
  overallRating: {
    alignItems: 'flex-start',
  },
  overallRatingNumber: {
    fontSize: theme.fonts.size.header,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
  },
  overallRatingStars: {
    flexDirection: 'row',
    marginVertical: theme.spacing.small,
  },
  totalReviews: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  writeReviewButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
  },
  writeReviewText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  reviewItem: {
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  reviewUser: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  reviewDate: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  relatedSection: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    marginHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: 40,
    ...theme.shadows.card,
    elevation: 3,
    
  },
  relatedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  relatedSectionSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.regular,
  },
  seeAllText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  relatedList: {
    paddingTop: theme.spacing.medium,
  },
  relatedProduct: {
    width: 180,
    marginRight: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  relatedProductImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.small,
  },
  relatedProductImage: {
    width: '100%',
    height: 100,
    borderRadius: theme.borderRadius.small,
    resizeMode: 'cover',
  },
  relatedProductDiscount: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
  },
  relatedProductDiscountText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  relatedProductName: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontWeight: theme.fonts.weight.bold,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
    height: 40,
  },
  relatedProductPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  relatedProductPrice: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  relatedProductOriginalPrice: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    fontFamily: theme.fonts.family.regular,
  },
  relatedProductRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  relatedProductStars: {
    flexDirection: 'row',
    marginRight: theme.spacing.small,
  },
  relatedProductRatingText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  relatedProductCategory: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.regular,
  },
  relatedProductAddButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
  },
  relatedProductAddButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  relatedProductAddButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  relatedProductAddButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },

  // Location Prompt Modal Styles
  locationPromptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  locationPromptContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xlarge,
    margin: theme.spacing.large,
    width: '85%',
    ...theme.shadows.card,
    elevation: 10,
  },
  locationPromptHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge,
  },
  locationPromptTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  locationPromptSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: theme.fonts.family.regular,
  },
  locationPromptContent: {
    gap: theme.spacing.medium,
  },
  locationPromptButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.card,
    elevation: 4,
  },
  locationPromptButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  locationPromptSkipText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
});

export default ProductDetailsScreen;
