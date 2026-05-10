# NVS Rice Meal Codebase Exploration Summary

## 1. Overall Directory Structure

```
/Users/sunny/Documents/GitHub/nvsricemeal
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── RiceCategoryScreen.tsx
│   │   ├── ProductDetailsScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ExploreScreen.tsx
│   │   ├── SaveLocationScreen.tsx
│   │   ├── LocationFillPage.tsx
│   │   ├── CreateLocationScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── TermsConditionsScreen.tsx
│   │   ├── PrivacyPolicyScreen.tsx
│   │   ├── HelpSupportScreen.tsx
│   │   └── NotificationScreen.tsx
│   ├── components/
│   │   ├── Logo.tsx
│   │   ├── HeaderSkeleton.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── AttractiveBanner.tsx
│   │   ├── BannerSkeleton.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── AddToCartModal.tsx
│   │   └── GoogleMapComponent.tsx
│   ├── context/
│   │   ├── CartContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── constants/
│   │   ├── theme.ts
│   │   ├── config.ts
│   │   ├── Statusbar.tsx
│   │   └── googleMapsConfig.ts
│   ├── utils/
│   │   ├── apiService.ts
│   │   ├── locationService.ts
│   │   ├── locationChecker.ts
│   │   ├── localization.ts
│   │   └── pdfGenerator.ts
│   ├── assets/
│   │   └── img/
│   │       ├── logo.png
│   │       └── logos.jpeg
│   └── locales/
│       ├── en.json
│       └── kn.json
├── __tests__/
├── android/
├── ios/
├── node_modules/
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── .gitignore
├── .eslintrc.js
├── .prettierrc.js
├── babel.config.js
├── metro.config.js
├── jest.config.js
├── app.json
├── index.js
├── Gemfile
└── Gemfile.lock
```

## 2. HomeScreen.tsx Content

See the full content above (lines 1-1585). Key features:
- Category-based product filtering
- Banner carousel with auto-slide
- Search functionality
- Load more/infinite scroll implementation
- Favorite product toggling
- Add to cart with API integration
- Skeleton loaders for better UX
- Responsive design calculations

## 3. Category-Related Components and API Files

### Category-Related Components:
1. **HomeScreen.tsx** - Main screen with category filtering
2. **RiceCategoryScreen.tsx** - Dedicated screen for rice categories

### Category-Related API Files:
1. **src/utils/apiService.ts** - Contains category API methods:
   - `getCategories()` - GET `/categories/getAll`
   - `getSubCategories()` - GET `/subCategories/getAll`
   - `getSubCategoriesByCategory(categoryId)` - GET `/subCategories/getAll?categoryId=${categoryId}`
   - `getProductsByCategory(categoryId, limit?)` - GET `/products/getAll?categoryId=${categoryId}&limit=${limit}`

2. **src/constants/config.ts** - API endpoint configuration:
   ```typescript
   CATEGORIES_API: {
     GET_ALL: '/categories/getAll',
   },
   SUBCATEGORIES_API: {
     GET_ALL: '/subCategories/getAll',
   },
   PRODUCTS_API: {
     GET_ALL: '/products/getAll',
     // ... other endpoints
   }
   ```

## 4. Existing Limit/Load-More Functionality

### In HomeScreen.tsx:
- **State variables for pagination:**
  ```typescript
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  ```

- **Load more function:**
  ```typescript
  const loadMore = () => {
    if (!loadingMore && hasMore && !isProductsLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProductsByCategory(nextPage, true);
    }
  };
  ```

- **Infinite scroll implementation:**
  ```typescript
  <FlatList
    data={filteredProducts}
    renderItem={({ item }) => (
      <ProductItem
        item={item}
        onAddToCart={addToCart}
        onAddOrUpdateToCart={addOrUpdateToCart}
        onFavorite={handleFavorite}
        isFavorite={favorites.has(item.id)}
      />
    )}
    keyExtractor={(item) => item.id}
    numColumns={2}
    contentContainerStyle={styles.listContainer}
    showsVerticalScrollIndicator={false}
    columnWrapperStyle={styles.row}
    onEndReached={loadMore}
    onEndReachedThreshold={0.5}
    ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color={theme.colors.primary} /> : null}
    ListEmptyComponent={/* ... */}
  />
  ```

- **Product fetching with pagination:**
  ```typescript
  const fetchProductsByCategory = async (currentPage = 1, isLoadMore = false) => {
    // ... API calls with page parameter
    // Uses limit=10 in API calls
    // Updates hasMore based on returned product count
  };
  ```

### In RiceCategoryScreen.tsx:
- Basic loading state but no explicit load-more implementation seen

## 5. API Endpoints Related to Categories

From **src/constants/config.ts**:
```typescript
ENDPOINTS: {
  // ... other endpoints
  CATEGORIES_API: {
    GET_ALL: '/categories/getAll',
  },
  SUBCATEGORIES_API: {
    GET_ALL: '/subCategories/getAll',
  },
  // ... other endpoints
}
```

From **src/utils/apiService.ts** - corresponding service methods:
1. **getCategories()** - Fetches all main categories
   - Endpoint: `/categories/getAll`
   - Method: GET
   - Used in HomeScreen.tsx useEffect for initial category load

2. **getSubCategories()** - Fetches all subcategories
   - Endpoint: `/subCategories/getAll`
   - Method: GET

3. **getSubCategoriesByCategory(categoryId)** - Fetches subcategories for a specific category
   - Endpoint: `/subCategories/getAll?categoryId=${categoryId}`
   - Method: GET
   - Used in HomeScreen.tsx when fetching products by category

4. **getProductsByCategory(categoryId, limit?)** - Fetches products for a specific category
   - Endpoint: `/products/getAll?categoryId=${categoryId}&limit=${limit}`
   - Method: GET
   - Used in RiceCategoryScreen.tsx

5. **getProductsBySubCategory(subCategoryId, queryParams?)** - Fetches products for a specific subcategory
   - Endpoint: `/products/getAll?subCategoryId=${subCategoryId}&${queryParams}`
   - Method: GET
   - Used in HomeScreen.tsx for fetching products by subcategory

### Response Format (based on code):
The API returns data in this structure:
```json
{
  "success": true,
  "data": {
    "data": {
      "data": [/* array of items */],
      "total": /* total count */,
      "totalPages": /* total pages */,
      "page": /* current page */,
      "limit": /* items per page */
    }
  }
}
```

This structure is consistently handled in the API service methods and component usage.