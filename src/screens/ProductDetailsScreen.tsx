import React, { useState } from 'react';
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
import { Product } from '../constants/products';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

const ProductDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { product } = route.params as { product: Product };

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      user: 'Rajesh K.',
      rating: 5,
      comment: 'Excellent quality basmati rice. Perfect for biryani!',
      date: '2024-01-10',
    },
    {
      id: '2',
      user: 'Priya M.',
      rating: 4,
      comment: 'Good rice, nice aroma. Will buy again.',
      date: '2024-01-08',
    },
    {
      id: '3',
      user: 'Amit S.',
      rating: 5,
      comment: 'Best basmati rice I have tried. Highly recommended.',
      date: '2024-01-05',
    },
  ];

  const relatedProducts = [
    {
      id: '6',
      name: 'Aged Basmati',
      price: 180,
      image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center',
      rating: 4.9,
    },
    {
      id: '7',
      name: 'Red Rice',
      price: 160,
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=300&h=300&fit=crop&crop=center',
      rating: 4.6,
    },
  ];

  const handleAddToCart = () => {
    // Add items to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    // Show brief success message and navigate to cart
    Alert.alert(
      'Success! 🎉',
      `${quantity} ${product.name} added to cart!\n\nRedirecting to payment...`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to Cart tab for payment
            navigation.getParent()?.navigate('Cart');
          }
        }
      ]
    );
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
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

  const renderRelatedProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.relatedProduct}>
      <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
      <Text style={styles.relatedProductName}>{item.name}</Text>
      <Text style={styles.relatedProductPrice}>₹{item.price}</Text>
      <View style={styles.relatedProductRating}>
        {renderStars(item.rating)}
      </View>
    </TouchableOpacity>
  );

  const images = product.images || [product.image];

  return (
    <ScrollView style={styles.container}>
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
          <Text style={styles.productName}>{product.name}</Text>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.ratingText}>
            {product.rating} ({product.reviewCount} reviews)
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.discount && (
            <Text style={styles.originalPrice}>
              ₹{Math.round(product.price * 100 / (100 - product.discount))}
            </Text>
          )}
        </View>

        <View style={styles.stockInfo}>
          <Icon
            name={product.inStock ? "check-circle" : "cancel"}
            size={16}
            color={product.inStock ? theme.colors.success : theme.colors.error}
          />
          <Text style={[
            styles.stockText,
            { color: product.inStock ? theme.colors.success : theme.colors.error }
          ]}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>

        <Text style={styles.description}>{product.description}</Text>

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
          style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Icon name="shopping-cart" size={20} color="white" />
          <Text style={styles.addToCartText}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'description', label: 'Description' },
          { key: 'specifications', label: 'Specs' },
          { key: 'reviews', label: 'Reviews' },
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
            <Text style={styles.sectionContent}>{product.description}</Text>

            {product.nutritionInfo && (
              <View style={styles.nutritionSection}>
                <Text style={styles.sectionTitle}>Nutrition Information (per 100g)</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>{product.nutritionInfo.calories}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{product.nutritionInfo.protein}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                    <Text style={styles.nutritionValue}>{product.nutritionInfo.carbs}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                    <Text style={styles.nutritionValue}>{product.nutritionInfo.fat}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fiber</Text>
                    <Text style={styles.nutritionValue}>{product.nutritionInfo.fiber}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'specifications' && product.specifications && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Brand:</Text>
              <Text style={styles.specValue}>{product.brand}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Weight:</Text>
              <Text style={styles.specValue}>{product.weight}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Origin:</Text>
              <Text style={styles.specValue}>{product.specifications.origin}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Processing:</Text>
              <Text style={styles.specValue}>{product.specifications.processing}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Shelf Life:</Text>
              <Text style={styles.specValue}>{product.specifications.shelfLife}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Storage:</Text>
              <Text style={styles.specValue}>{product.specifications.storage}</Text>
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
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
        <Text style={styles.sectionTitle}>You might also like</Text>
        <FlatList
          horizontal
          data={relatedProducts}
          renderItem={renderRelatedProduct}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedList}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageSection: {
    backgroundColor: theme.colors.card,
    paddingBottom: theme.spacing.medium,
  },
  mainImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
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
    paddingHorizontal: theme.spacing.small,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.small,
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
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.card,
    elevation: 3,
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    padding: 4,
    marginBottom: theme.spacing.medium,
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
    marginBottom: theme.spacing.large,
  },
  relatedList: {
    paddingTop: theme.spacing.medium,
  },
  relatedProduct: {
    width: 120,
    marginRight: theme.spacing.medium,
    alignItems: 'center',
  },
  relatedProductImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    resizeMode: 'cover',
  },
  relatedProductName: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  relatedProductPrice: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
  },
  relatedProductRating: {
    flexDirection: 'row',
    marginTop: theme.spacing.small,
  },
});

export default ProductDetailsScreen;