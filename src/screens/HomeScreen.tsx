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

const categories = ['All','Sona Masoori Rice', 'Parboiled Rice', 'Sona Masoori Steam Rice', 'Sona Masoori Raw Rice', 'RNR Steam Rice', 'RNR Rice', 'RAW Rice', 'Gira RAW Rice', 'Gira Steam Rice', 'Bowled Rice', 'Broken Rice', 'Broken Steam Rice', 'Broken RAW Rice','Basmati Rice', 'Jasmine Rice', 'Italia Dosa Rice', 'HMT Steam Rice'];

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

  // Simplified and corrected category filtering logic
  const filteredProducts = riceProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'All') {
      return matchesSearch;
    }
    
    // Direct name matching for all categories
    const matchesCategory = product.name === selectedCategory;
    
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

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item && styles.categoryTextActive,
        ]}
        numberOfLines={1}
      >
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
        
        <View style={styles.categorySection}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item}
            style={styles.categoryList}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          />
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={60} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try a different search or category</Text>
            </View>
          }
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
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
    textAlign: 'center',
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
});

export default HomeScreen;