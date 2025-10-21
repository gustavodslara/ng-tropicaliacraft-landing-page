import { Injectable, signal, computed, effect } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  description?: string;
  image?: string;
}

/**
 * Modern Angular Service using Signals
 * Demonstrates zoneless + signals approach for state management
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // ============================================
  // PRIVATE WRITABLE SIGNALS (Internal State)
  // ============================================

  private productsSignal = signal<Product[]>([
    {
      id: 1,
      name: 'Tropicália T-Shirt',
      price: 29.99,
      category: 'clothing',
      inStock: true,
      description: 'Comfortable cotton t-shirt with vibrant tropical design',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
    },
    {
      id: 2,
      name: 'Craft Beer Collection',
      price: 45.00,
      category: 'beverages',
      inStock: true,
      description: 'Artisanal craft beer selection from local breweries',
      image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400'
    },
    {
      id: 3,
      name: 'Handmade Ceramic Mug',
      price: 15.99,
      category: 'home',
      inStock: false,
      description: 'Beautiful handcrafted ceramic mug for your morning coffee',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400'
    },
    {
      id: 4,
      name: 'Artisan Coffee Beans',
      price: 12.50,
      category: 'beverages',
      inStock: true,
      description: 'Premium single-origin coffee beans, freshly roasted',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
    },
    {
      id: 5,
      name: 'Eco-Friendly Tote Bag',
      price: 19.99,
      category: 'accessories',
      inStock: true,
      description: 'Sustainable canvas tote bag with tropical print',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'
    },
    {
      id: 6,
      name: 'Tropical Plant Set',
      price: 34.99,
      category: 'home',
      inStock: true,
      description: 'Set of 3 beautiful tropical plants for your home',
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400'
    },
  ]);

  private selectedCategorySignal = signal<string>('all');
  private searchTermSignal = signal<string>('');
  private sortBySignal = signal<'name' | 'price' | 'category'>('name');
  private sortDirectionSignal = signal<'asc' | 'desc'>('asc');

  // ============================================
  // PUBLIC READONLY SIGNALS (Exposed State)
  // ============================================

  readonly products = this.productsSignal.asReadonly();
  readonly selectedCategory = this.selectedCategorySignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly sortBy = this.sortBySignal.asReadonly();
  readonly sortDirection = this.sortDirectionSignal.asReadonly();

  // ============================================
  // COMPUTED SIGNALS (Derived State)
  // ============================================

  /**
   * Filtered and sorted products based on current filters
   */
  readonly filteredProducts = computed(() => {
    let products = this.productsSignal();
    const category = this.selectedCategorySignal();
    const search = this.searchTermSignal().toLowerCase();
    const sortBy = this.sortBySignal();
    const sortDirection = this.sortDirectionSignal();

    // Filter by category
    if (category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    // Filter by search term
    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    // Sort products
    products = [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return products;
  });

  /**
   * Products currently in stock
   */
  readonly productsInStock = computed(() =>
    this.productsSignal().filter(p => p.inStock)
  );

  /**
   * Products out of stock
   */
  readonly productsOutOfStock = computed(() =>
    this.productsSignal().filter(p => !p.inStock)
  );

  /**
   * Total inventory value
   */
  readonly totalInventoryValue = computed(() =>
    this.productsSignal().reduce((sum, p) => sum + p.price, 0)
  );

  /**
   * Average product price
   */
  readonly averagePrice = computed(() => {
    const products = this.productsSignal();
    return products.length > 0
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length
      : 0;
  });

  /**
   * Statistics object with all metrics
   */
  readonly statistics = computed(() => ({
    total: this.productsSignal().length,
    inStock: this.productsInStock().length,
    outOfStock: this.productsOutOfStock().length,
    filtered: this.filteredProducts().length,
    totalValue: this.totalInventoryValue(),
    averagePrice: this.averagePrice(),
  }));

  /**
   * Available categories (dynamically computed from products)
   */
  readonly availableCategories = computed(() => {
    const categories = new Set(this.productsSignal().map(p => p.category));
    return ['all', ...Array.from(categories).sort()];
  });

  /**
   * Products grouped by category
   */
  readonly productsByCategory = computed(() => {
    const products = this.productsSignal();
    const grouped = new Map<string, Product[]>();

    products.forEach(product => {
      const existing = grouped.get(product.category) || [];
      grouped.set(product.category, [...existing, product]);
    });

    return grouped;
  });

  // ============================================
  // EFFECTS (Side Effects)
  // ============================================

  constructor() {
    // Log filtered products count for debugging
    effect(() => {
      const filtered = this.filteredProducts();
      console.log(`📊 Filtered products: ${filtered.length}`);
    });

    // Persist products to localStorage
    effect(() => {
      const products = this.productsSignal();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tropicalia-products', JSON.stringify(products));
        console.log('💾 Products saved to localStorage');
      }
    });

    // Load from localStorage on init
    this.loadFromLocalStorage();
  }

  // ============================================
  // PUBLIC METHODS (State Updates)
  // ============================================

  /**
   * Set selected category filter
   */
  setCategory(category: string): void {
    this.selectedCategorySignal.set(category);
  }

  /**
   * Set search term
   */
  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
  }

  /**
   * Set sort field and direction
   */
  setSorting(sortBy: 'name' | 'price' | 'category', direction: 'asc' | 'desc' = 'asc'): void {
    this.sortBySignal.set(sortBy);
    this.sortDirectionSignal.set(direction);
  }

  /**
   * Toggle sort direction
   */
  toggleSortDirection(): void {
    this.sortDirectionSignal.update(dir => dir === 'asc' ? 'desc' : 'asc');
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedCategorySignal.set('all');
    this.searchTermSignal.set('');
    this.sortBySignal.set('name');
    this.sortDirectionSignal.set('asc');
  }

  /**
   * Add a new product
   */
  addProduct(product: Omit<Product, 'id'>): void {
    const newId = Math.max(...this.productsSignal().map(p => p.id), 0) + 1;
    this.productsSignal.update(products => [
      ...products,
      { ...product, id: newId }
    ]);
  }

  /**
   * Update existing product
   */
  updateProduct(id: number, updates: Partial<Product>): void {
    this.productsSignal.update(products =>
      products.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    );
  }

  /**
   * Delete a product
   */
  deleteProduct(id: number): void {
    this.productsSignal.update(products =>
      products.filter(product => product.id !== id)
    );
  }

  /**
   * Toggle product stock status
   */
  toggleStock(id: number): void {
    this.productsSignal.update(products =>
      products.map(product =>
        product.id === id ? { ...product, inStock: !product.inStock } : product
      )
    );
  }

  /**
   * Get product by ID
   */
  getProductById(id: number): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  /**
   * Load products from localStorage
   */
  private loadFromLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('tropicalia-products');
      if (stored) {
        try {
          const products = JSON.parse(stored);
          this.productsSignal.set(products);
          console.log('📦 Products loaded from localStorage');
        } catch (e) {
          console.error('Failed to load products from localStorage:', e);
        }
      }
    }
  }

  /**
   * Simulate API call to load more products
   */
  async loadMoreProducts(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProducts: Product[] = [
      {
        id: this.productsSignal().length + 1,
        name: 'Vinyl Record - Tropicália',
        price: 25.00,
        category: 'music',
        inStock: true,
        description: 'Classic Tropicália music on vinyl',
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400'
      },
      {
        id: this.productsSignal().length + 2,
        name: 'Art Print Poster',
        price: 18.00,
        category: 'art',
        inStock: true,
        description: 'Beautiful tropical art print',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400'
      },
    ];

    this.productsSignal.update(products => [...products, ...newProducts]);
  }

  /**
   * Reset to default products
   */
  resetToDefaults(): void {
    this.productsSignal.set([
      {
        id: 1,
        name: 'Tropicália T-Shirt',
        price: 29.99,
        category: 'clothing',
        inStock: true,
        description: 'Comfortable cotton t-shirt with vibrant tropical design',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
      },
    ]);
    this.clearFilters();
  }
}
