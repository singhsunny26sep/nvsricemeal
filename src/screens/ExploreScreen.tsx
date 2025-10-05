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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../constants/products';
import { useCart } from '../context/CartContext';
import { riceProducts } from '../constants/products';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

interface ExploreItemProps {
  item: Product;
  onAddToCart: (product: Product) => void;
}

const ExploreItem: React.FC<ExploreItemProps> = ({ item, onAddToCart }) => {
  const navigation = useNavigation();

  const handleAddToCart = () => {
    onAddToCart(item);
    navigation.getParent()?.navigate('CartScreen');
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
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<'featured' | 'popular' | 'new'>('featured');

  // Filter products based on selection
  const getFilteredProducts = () => {
    switch (selectedFilter) {
      case 'featured':
        return riceProducts.filter(product => product.rating >= 4.5);
      case 'popular':
        return riceProducts.filter(product => product.reviewCount > 50);
      case 'new':
        return riceProducts.slice(0, 8); // Show first 8 as "new"
      default:
        return riceProducts;
    }
  };

  const filters = [
    { key: 'featured', label: 'Featured', icon: 'star' },
    { key: 'popular', label: 'Popular', icon: 'trending-up' },
    { key: 'new', label: 'New Arrivals', icon: 'new-releases' },
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Explore</Text>
              <Text style={styles.headerSubtitle}>Discover amazing rice varieties</Text>
            </View>
            <TouchableOpacity
              style={styles.cartIconContainer}
              onPress={() => navigation.getParent()?.navigate('CartScreen')}
            >
              <Icon name="shopping-cart" size={24} color={theme.colors.primary} />
              {cart.items.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <FlatList
            horizontal
            data={filters}
            renderItem={renderFilter}
            keyExtractor={(item) => item.key}
            style={styles.filterList}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          />
        </View>

        <View style={styles.exploreSection}>
          <FlatList
            data={getFilteredProducts()}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.exploreList}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.exploreRow}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={60} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Try selecting a different filter</Text>
              </View>
            }
          />
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
  filterList: {
    maxHeight: 70,
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
  exploreList: {
    paddingHorizontal: theme.spacing.small,
    paddingBottom: theme.spacing.large,
  },
  exploreRow: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.small,
  },
  exploreCard: {
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
    marginBottom: theme.spacing.small,
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
});

export default ExploreScreen;