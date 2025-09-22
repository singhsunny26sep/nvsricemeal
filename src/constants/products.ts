export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  weight: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  discount?: number;
  nutritionInfo?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  specifications?: {
    origin: string;
    processing: string;
    shelfLife: string;
    storage: string;
  };
  images?: string[];
}

export interface RiceCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  products: Product[];
}

export const riceCategories: RiceCategory[] = [
  {
    id: 'basmati',
    name: 'Basmati Rice',
    description: 'Premium long grain aromatic rice varieties',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&crop=center',
    products: [
      {
        id: '1',
        name: 'Premium Basmati',
        price: 150,
        description: 'Premium long grain basmati rice, perfect for biryani.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
        category: 'Basmati',
        weight: '5kg',
        brand: 'NVS Premium',
        rating: 4.8,
        reviewCount: 245,
        inStock: true,
        discount: 10,
        nutritionInfo: {
          calories: '130 kcal',
          protein: '2.7g',
          carbs: '28g',
          fat: '0.3g',
          fiber: '0.4g',
        },
        specifications: {
          origin: 'Punjab, India',
          processing: 'Steam Parboiled',
          shelfLife: '24 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
        ],
      },
      {
        id: '6',
        name: 'Aged Basmati',
        price: 180,
        description: 'Aged basmati rice with enhanced flavor and aroma.',
        image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=400&fit=crop&crop=center',
        category: 'Basmati',
        weight: '5kg',
        brand: 'Aged Premium',
        rating: 4.9,
        reviewCount: 189,
        inStock: true,
        nutritionInfo: {
          calories: '130 kcal',
          protein: '2.7g',
          carbs: '28g',
          fat: '0.3g',
          fiber: '0.4g',
        },
        specifications: {
          origin: 'Haryana, India',
          processing: 'Aged Premium',
          shelfLife: '24 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
        ],
      },
    ],
  },
  {
    id: 'daily',
    name: 'Daily Rice',
    description: 'Everyday rice varieties for regular meals',
    image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=300&fit=crop&crop=center',
    products: [
      {
        id: '2',
        name: 'Sona Masoori Rice',
        price: 100,
        description: 'Fine grain rice suitable for daily meals.',
        image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=400&fit=crop&crop=center',
        category: 'Daily Rice',
        weight: '10kg',
        brand: 'Daily Fresh',
        rating: 4.5,
        reviewCount: 189,
        inStock: true,
        nutritionInfo: {
          calories: '130 kcal',
          protein: '2.7g',
          carbs: '28g',
          fat: '0.3g',
          fiber: '0.4g',
        },
        specifications: {
          origin: 'Andhra Pradesh, India',
          processing: 'Raw Rice',
          shelfLife: '18 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
        ],
      },
      {
        id: '5',
        name: 'Parboiled Rice',
        price: 120,
        description: 'Nutrient-rich parboiled rice for everyday cooking.',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=400&h=400&fit=crop&crop=center',
        category: 'Daily Rice',
        weight: '10kg',
        brand: 'Nutri Rice',
        rating: 4.4,
        reviewCount: 167,
        inStock: false,
        nutritionInfo: {
          calories: '130 kcal',
          protein: '2.7g',
          carbs: '28g',
          fat: '0.3g',
          fiber: '0.4g',
        },
        specifications: {
          origin: 'West Bengal, India',
          processing: 'Parboiled',
          shelfLife: '18 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
        ],
      },
    ],
  },
  {
    id: 'healthy',
    name: 'Healthy Rice',
    description: 'Nutritious and healthy rice options',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=400&h=300&fit=crop&crop=center',
    products: [
      {
        id: '3',
        name: 'Brown Rice',
        price: 200,
        description: 'Healthy whole grain brown rice, rich in fiber.',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=400&h=400&fit=crop&crop=center',
        category: 'Healthy Rice',
        weight: '2kg',
        brand: 'Organic Harvest',
        rating: 4.7,
        reviewCount: 156,
        inStock: true,
        nutritionInfo: {
          calories: '111 kcal',
          protein: '2.6g',
          carbs: '23g',
          fat: '0.9g',
          fiber: '1.8g',
        },
        specifications: {
          origin: 'Organic Farms, India',
          processing: 'Unpolished',
          shelfLife: '12 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
        ],
      },
      {
        id: '7',
        name: 'Red Rice',
        price: 160,
        description: 'Nutrient-rich red rice with natural antioxidants.',
        image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=400&fit=crop&crop=center',
        category: 'Healthy Rice',
        weight: '2kg',
        brand: 'Health Plus',
        rating: 4.6,
        reviewCount: 134,
        inStock: true,
        nutritionInfo: {
          calories: '110 kcal',
          protein: '2.5g',
          carbs: '22g',
          fat: '0.8g',
          fiber: '2.0g',
        },
        specifications: {
          origin: 'Kerala, India',
          processing: 'Natural',
          shelfLife: '12 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
        ],
      },
    ],
  },
  {
    id: 'aromatic',
    name: 'Aromatic Rice',
    description: 'Fragrant rice varieties from around the world',
    image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=300&fit=crop&crop=center',
    products: [
      {
        id: '4',
        name: 'Jasmine Rice',
        price: 180,
        description: 'Aromatic rice with a soft texture.',
        image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=400&fit=crop&crop=center',
        category: 'Aromatic Rice',
        weight: '5kg',
        brand: 'Thai Royal',
        rating: 4.6,
        reviewCount: 203,
        inStock: true,
        nutritionInfo: {
          calories: '129 kcal',
          protein: '2.4g',
          carbs: '28g',
          fat: '0.2g',
          fiber: '0.5g',
        },
        specifications: {
          origin: 'Thailand',
          processing: 'Premium Grade',
          shelfLife: '24 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
        ],
      },
      {
        id: '8',
        name: 'Thai Rice',
        price: 140,
        description: 'Premium Thai rice with delicate fragrance.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
        category: 'Aromatic Rice',
        weight: '5kg',
        brand: 'Thai Premium',
        rating: 4.5,
        reviewCount: 156,
        inStock: true,
        nutritionInfo: {
          calories: '129 kcal',
          protein: '2.4g',
          carbs: '28g',
          fat: '0.2g',
          fiber: '0.5g',
        },
        specifications: {
          origin: 'Thailand',
          processing: 'Premium Grade',
          shelfLife: '24 months',
          storage: 'Cool, dry place',
        },
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
        ],
      },
    ],
  },
];

export const riceProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Basmati Rice',
    price: 150,
    description: 'Premium long grain basmati rice, perfect for biryani and special occasions.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
    category: 'Basmati',
    weight: '5kg',
    brand: 'NVS Premium',
    rating: 4.8,
    reviewCount: 245,
    inStock: true,
    discount: 10,
    nutritionInfo: {
      calories: '130 kcal',
      protein: '2.7g',
      carbs: '28g',
      fat: '0.3g',
      fiber: '0.4g',
    },
    specifications: {
      origin: 'Punjab, India',
      processing: 'Steam Parboiled',
      shelfLife: '24 months',
      storage: 'Cool, dry place',
    },
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
    ],
  },
  {
    id: '2',
    name: 'Sona Masoori Rice',
    price: 100,
    description: 'Fine grain rice suitable for daily meals and traditional South Indian dishes.',
    image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=400&fit=crop&crop=center',
    category: 'Daily Rice',
    weight: '10kg',
    brand: 'Daily Fresh',
    rating: 4.5,
    reviewCount: 189,
    inStock: true,
    nutritionInfo: {
      calories: '130 kcal',
      protein: '2.7g',
      carbs: '28g',
      fat: '0.3g',
      fiber: '0.4g',
    },
    specifications: {
      origin: 'Andhra Pradesh, India',
      processing: 'Raw Rice',
      shelfLife: '18 months',
      storage: 'Cool, dry place',
    },
    images: [
      'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
    ],
  },
  {
    id: '3',
    name: 'Organic Brown Rice',
    price: 200,
    description: 'Healthy whole grain brown rice, rich in fiber and essential nutrients.',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=400&h=400&fit=crop&crop=center',
    category: 'Healthy Rice',
    weight: '2kg',
    brand: 'Organic Harvest',
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    nutritionInfo: {
      calories: '111 kcal',
      protein: '2.6g',
      carbs: '23g',
      fat: '0.9g',
      fiber: '1.8g',
    },
    specifications: {
      origin: 'Organic Farms, India',
      processing: 'Unpolished',
      shelfLife: '12 months',
      storage: 'Cool, dry place',
    },
    images: [
      'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
    ],
  },
  {
    id: '4',
    name: 'Thai Jasmine Rice',
    price: 180,
    description: 'Aromatic rice with a soft texture, perfect for Asian cuisine.',
    image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=400&h=400&fit=crop&crop=center',
    category: 'Aromatic Rice',
    weight: '5kg',
    brand: 'Thai Royal',
    rating: 4.6,
    reviewCount: 203,
    inStock: true,
    nutritionInfo: {
      calories: '129 kcal',
      protein: '2.4g',
      carbs: '28g',
      fat: '0.2g',
      fiber: '0.5g',
    },
    specifications: {
      origin: 'Thailand',
      processing: 'Premium Grade',
      shelfLife: '24 months',
      storage: 'Cool, dry place',
    },
    images: [
      'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
    ],
  },
  {
    id: '5',
    name: 'Parboiled Rice',
    price: 120,
    description: 'Nutrient-rich parboiled rice for everyday cooking and meal preparation.',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=400&h=400&fit=crop&crop=center',
    category: 'Daily Rice',
    weight: '10kg',
    brand: 'Nutri Rice',
    rating: 4.4,
    reviewCount: 167,
    inStock: false,
    nutritionInfo: {
      calories: '130 kcal',
      protein: '2.7g',
      carbs: '28g',
      fat: '0.3g',
      fiber: '0.4g',
    },
    specifications: {
      origin: 'West Bengal, India',
      processing: 'Parboiled',
      shelfLife: '18 months',
      storage: 'Cool, dry place',
    },
    images: [
      'https://images.unsplash.com/photo-1563379091339-03246963d4b6?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=600&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&crop=center',
    ],
  },
];