import React, { useState } from 'react';
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
} from 'react-native';
import { Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RiceCategory, Product } from '../constants/products';
import { riceCategories } from '../constants/products';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

interface CategoryCardProps {
  category: RiceCategory;
  onPress: (category: RiceCategory) => void;
}

interface ProductItemProps {
  item: Product;
  onAddToCart: (product: Product) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

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

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => onPress(category)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: category.image }}
          style={styles.categoryImage}
          defaultSource={{ uri: 'https://via.placeholder.com/200x150/4CAF50/FFFFFF?text=Rice' }}
        />
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          <View style={styles.categoryFooter}>
            <Text style={styles.productCount}>
              {category.products.length} varieties
            </Text>
            <Icon name="arrow-forward" size={20} color={theme.colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProductItem: React.FC<ProductItemProps> = ({ item, onAddToCart }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

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
  };

  return (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://via.placeholder.com/150' }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color={theme.colors.primary} />
          <Text style={styles.ratingText}>4.5 (12)</Text>
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
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const RiceCategoryScreen: React.FC = () => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<RiceCategory | null>(null);

  const handleCategoryPress = (category: RiceCategory) => {
    setSelectedCategory(category);
  };

  const handleBackPress = () => {
    setSelectedCategory(null);
  };

  const renderCategory = ({ item }: { item: RiceCategory }) => (
    <CategoryCard category={item} onPress={handleCategoryPress} />
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductItem item={item} onAddToCart={addToCart} />
  );

  if (selectedCategory) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Icon name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.header}>{selectedCategory.name}</Text>
            <Text style={styles.subtitle}>{selectedCategory.description}</Text>
          </View>

          <FlatList
            data={selectedCategory.products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Rice Categories</Text>
          <Text style={styles.heroSubtitle}>
            Discover our premium collection of rice varieties from around the world
          </Text>
          <Image
            source={{ uri: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Rice+Collection' }}
            style={styles.heroImage}
            defaultSource={{ uri: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Rice' }}
          />
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Choose Your Category</Text>
          <FlatList
            data={riceCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={1}
            contentContainerStyle={styles.categoriesList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Icon name="stars" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Why Choose Our Rice?</Text>
            <Icon name="stars" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name="verified" size={28} color={theme.colors.card} />
              </View>
              <Text style={styles.featureTitle}>Premium Quality</Text>
              <Text style={styles.featureDescription}>Sourced from trusted farmers</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name="local-shipping" size={28} color={theme.colors.card} />
              </View>
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>Quick and reliable shipping</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name="eco" size={28} color={theme.colors.card} />
              </View>
              <Text style={styles.featureTitle}>Organic Options</Text>
              <Text style={styles.featureDescription}>Natural and chemical-free</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name="support" size={28} color={theme.colors.card} />
              </View>
              <Text style={styles.featureTitle}>24/7 Support</Text>
              <Text style={styles.featureDescription}>Always here to help</Text>
            </View>
          </View>
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
  heroSection: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.large,
    alignItems: 'center',
    paddingTop: theme.spacing.xlarge,
    paddingBottom: theme.spacing.xlarge,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: theme.spacing.medium,
  },
  heroTitle: {
    fontSize: theme.fonts.size.header,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.card,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.card,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    opacity: 0.9,
    fontFamily: theme.fonts.family.regular,
    lineHeight: 22,
  },
  heroImage: {
    width: 300,
    height: 200,
    borderRadius: theme.borderRadius.large,
    resizeMode: 'cover',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  categoriesSection: {
    padding: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.title,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  categoriesList: {
    paddingBottom: theme.spacing.large,
  },
  categoryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    overflow: 'hidden',
    ...theme.shadows.card,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  categoryImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  categoryInfo: {
    padding: theme.spacing.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  categoryName: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
    letterSpacing: 0.5,
  },
  categoryDescription: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.regular,
    lineHeight: 18,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: theme.spacing.small,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.small,
  },
  featuresSection: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.large,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    width: (width - theme.spacing.large * 4) / 2,
    alignItems: 'center',
    marginBottom: theme.spacing.large,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  featureTitle: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.small,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  featureDescription: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
    lineHeight: 16,
  },
  headerContainer: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    ...theme.shadows.card,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.medium,
    left: theme.spacing.medium,
    zIndex: 1,
  },
  header: {
    fontSize: theme.fonts.size.title,
    fontWeight: theme.fonts.weight.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  subtitle: {
    fontSize: theme.fonts.size.medium,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.small,
    paddingBottom: theme.spacing.large,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    width: (width - theme.spacing.medium * 3) / 2,
    alignItems: 'center',
    ...theme.shadows.card,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.08)',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    resizeMode: 'cover',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    alignItems: 'center',
    width: '100%',
  },
  productName: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  productDescription: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
    fontFamily: theme.fonts.family.regular,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  ratingText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  productPrice: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
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
    ...theme.shadows.card,
  },
  addButton: {
    width: '100%',
  },
  addButtonText: {
    color: theme.colors.card,
    fontWeight: theme.fonts.weight.bold,
    fontSize: theme.fonts.size.small,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
});

export default RiceCategoryScreen;