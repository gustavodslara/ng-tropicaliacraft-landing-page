import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  // Inject service using modern inject() function
  private productService = inject(ProductService);

  // Local component signals
  isLoading = signal(false);
  showAddForm = signal(false);

  // New product form
  newProduct = signal({
    name: '',
    price: 0,
    category: 'accessories',
    description: '',
    inStock: true
  });

  // Expose service signals to template
  products = this.productService.filteredProducts;
  statistics = this.productService.statistics;
  categories = this.productService.availableCategories;
  selectedCategory = this.productService.selectedCategory;
  searchTerm = this.productService.searchTerm;
  sortBy = this.productService.sortBy;
  sortDirection = this.productService.sortDirection;

  // ============================================
  // FILTER METHODS
  // ============================================

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.productService.setSearchTerm(target.value);
  }

  onCategoryChange(category: string): void {
    this.productService.setCategory(category);
  }

  onSortChange(sortBy: 'name' | 'price' | 'category'): void {
    this.productService.setSorting(sortBy, this.sortDirection());
  }

  toggleSortDirection(): void {
    this.productService.toggleSortDirection();
  }

  clearFilters(): void {
    this.productService.clearFilters();
  }

  // ============================================
  // PRODUCT METHODS
  // ============================================

  toggleStock(productId: number): void {
    this.productService.toggleStock(productId);
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId);
    }
  }

  async loadMoreProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.productService.loadMoreProducts();
    } finally {
      this.isLoading.set(false);
    }
  }

  // ============================================
  // ADD PRODUCT FORM
  // ============================================

  toggleAddForm(): void {
    this.showAddForm.update(show => !show);
  }

  updateNewProductField(field: string, value: any): void {
    this.newProduct.update(product => ({
      ...product,
      [field]: value
    }));
  }

  addProduct(): void {
    const product = this.newProduct();

    if (!product.name || product.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    this.productService.addProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      inStock: product.inStock,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    });

    // Reset form
    this.newProduct.set({
      name: '',
      price: 0,
      category: 'accessories',
      description: '',
      inStock: true
    });

    this.showAddForm.set(false);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  trackByProductId(index: number, product: any): number {
    return product.id;
  }
}
