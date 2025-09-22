import React, { useState } from 'react';
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
} from 'react-native';
import { Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../constants/products';
import { useCart } from '../context/CartContext';
import { riceProducts } from '../constants/products';
import { theme } from '../constants/theme';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');

interface ProductItemProps {
  item: Product;
  onAddToCart: (product: Product) => void;
  onFavorite: (productId: string) => void;
  isFavorite: boolean;
}

const categories = ['All', 'Premium', 'Organic', 'Daily'];

type Category = typeof categories[number];

const ProductItem: React.FC<ProductItemProps> = ({ item, onAddToCart, onFavorite, isFavorite }) => {
  const navigation = useNavigation();
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
          <Text style={styles.discountText}>{item.discount}% OFF</Text>
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
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
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
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const { addToCart } = useCart();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<Category>('All');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const filteredProducts = riceProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ||
      (selectedCategory === 'Premium' && ['Basmati Rice', 'Jasmine Rice'].includes(product.name)) ||
      (selectedCategory === 'Organic' && product.name === 'Brown Rice') ||
      (selectedCategory === 'Daily' && ['Sona Masoori Rice', 'Parboiled Rice'].includes(product.name));
    return matchesSearch && matchesCategory;
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

  const handleShopNow = () => {
    navigation.navigate('RiceCategory' as never);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item && styles.categoryTextActive,
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Logo
            size="medium"
            showText={true}
            style={styles.logo}
          />
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          style={styles.categoryList}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        />
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerText}>🛍️ Discover Our Premium Rice Collection</Text>
          <TouchableOpacity style={styles.bannerButton} onPress={handleShopNow}>
            <Text style={styles.bannerButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
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
        />
      </View>
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
    ...theme.shadows.card,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
    position: 'relative',
  },
  logo: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  header: {
    fontSize: theme.fonts.size.title,
    fontWeight: theme.fonts.weight.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
    color: theme.colors.text,
    letterSpacing: 0.5,
    fontFamily: theme.fonts.family.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: theme.fonts.size.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
    lineHeight: 20,
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
    ...theme.shadows.card,
    elevation: 2,
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
    marginTop: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    maxHeight: 40,
  },
  categoryContainer: {
    paddingHorizontal: theme.spacing.small,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    marginRight: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    ...theme.shadows.card,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.card,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: theme.colors.card,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
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
    position: 'relative',
    marginTop:20,
    ...theme.shadows.card,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.08)',
    overflow: 'hidden',
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
    fontSize: 12,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
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
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.1)',
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
    fontSize: theme.fonts.size.large,
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
    flexShrink: 1,
    fontFamily: theme.fonts.family.regular,
    maxHeight: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  stars: {
    flexDirection: 'row',
    marginRight: theme.spacing.small,
  },
  ratingText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  productPrice: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  addButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    width: '100%',
    justifyContent: 'center',
    ...theme.shadows.card,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButton: {
    width: '100%',
  },
  addButtonText: {
    color: theme.colors.card,
    fontWeight: theme.fonts.weight.bold,
    fontSize: theme.fonts.size.medium,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
    letterSpacing: 0.5,
  },
  bannerContainer: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.large,
    marginHorizontal: theme.spacing.medium,
    marginVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.card,
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerText: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.card,
    fontWeight: theme.fonts.weight.bold,
    flex: 1,
    fontFamily: theme.fonts.family.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
    fontSize: theme.fonts.size.medium,
  },
});

export default HomeScreen;