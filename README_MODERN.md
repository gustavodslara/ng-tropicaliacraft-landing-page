# Angular Zoneless + Signals + Tailwind CSS

Modern Angular application demonstrating **zoneless change detection**, **signals-based state management**, and **Tailwind CSS v3** styling.

## 🚀 Features

- ✅ **Zoneless Change Detection** - No Zone.js dependency
- ✅ **Signals** - Modern reactive state management
- ✅ **Tailwind CSS v3** - Stable utility-first CSS framework
- ✅ **Angular 20+** - Latest Angular features
- ✅ **TypeScript** - Full type safety
- ✅ **Standalone Components** - No NgModules
- ✅ **Modern Control Flow** - @if, @for, @switch
- ✅ **inject()** - Function-based dependency injection

## 📦 Tech Stack

- **Angular**: 20.3.0
- **Tailwind CSS**: 3.x (stable)
- **TypeScript**: 5.9.2
- **RxJS**: 7.8.0

## 🎯 What's Demonstrated

### 1. **Product Service** (`src/app/services/product.service.ts`)

Complete signal-based service showing:
- Writable & readonly signals
- Computed signals for derived state
- Effects for side effects (logging, localStorage)
- CRUD operations with immutable updates
- Complex filtering & sorting
- Statistics computation

### 2. **Home Component** (`src/app/home/`)

Full-featured component with:
- Modern inject() for DI
- Signal-based local state
- Service signal consumption
- Event handlers
- Add/delete/update operations
- Real-time filtering & search
- Tailwind v4 styling

### 3. **Tailwind CSS v3 Setup**

- JavaScript-based configuration
- Custom color scheme
- Responsive design
- Gradient utilities
- Modern component styling
- Custom component classes with @layer

## 🏃‍♂️ Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser
http://localhost:4200
```

## 📝 Key Patterns

### Signal-Based Service

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  // Private writable signal
  private productsSignal = signal<Product[]>([]);
  
  // Public readonly signal
  readonly products = this.productsSignal.asReadonly();
  
  // Computed signal
  readonly filteredProducts = computed(() => {
    return this.productsSignal().filter(/*...*/);
  });
  
  // Update method
  addProduct(product: Product): void {
    this.productsSignal.update(products => [...products, product]);
  }
}
```

### Modern Component

```typescript
@Component({
  selector: 'app-home',
  imports: [CommonModule],
  template: `...`
})
export class HomeComponent {
  // Function-based DI
  private service = inject(ProductService);
  
  // Local signal
  isLoading = signal(false);
  
  // Expose service signals
  products = this.service.filteredProducts;
}
```

### Template with Modern Control Flow

```html
<!-- @if directive -->
@if (showAddForm()) {
  <div>Add Form</div>
}

<!-- @for directive with track -->
@for (product of products(); track product.id) {
  <div>{{ product.name }}</div>
} @empty {
  <div>No products</div>
}
```

### Tailwind CSS v3 Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b82f6', /* ... */ },
        secondary: { DEFAULT: '#8b5cf6', /* ... */ },
      },
    },
  },
}
```

```css
/* styles.scss */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🎨 Tailwind CSS Features Used

- **Gradient Utilities**: `bg-gradient-to-r from-blue-500 to-purple-600`
- **Responsive Design**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Hover States**: `hover:shadow-lg hover:-translate-y-1`
- **Custom Colors**: Extended color palette
- **Flexbox & Grid**: Modern layout utilities
- **Typography**: Font weights, sizes, colors
- **Component Classes**: Using @layer for reusable styles

## 📊 Benefits

### Zoneless
- ⚡ 30-50% faster change detection
- 📦 ~50KB smaller bundle (no Zone.js)
- 🐛 Easier debugging
- 🎯 Explicit control

### Signals
- 🎯 Fine-grained reactivity
- 💡 Simpler than RxJS for state
- 🔒 Type-safe
- 🚀 Better performance

### Tailwind CSS v3
- 🚀 Production-ready and stable
- 📦 Efficient CSS purging
- 🎨 Great DX with JIT mode
- � Extensive plugin ecosystem

## 🗂️ Project Structure

```
src/
├── app/
│   ├── home/
│   │   ├── home.component.ts
│   │   ├── home.component.html
│   │   └── home.component.scss
│   ├── services/
│   │   └── product.service.ts
│   ├── app.ts
│   ├── app.html
│   ├── app.config.ts
│   └── app.routes.ts
├── styles.scss (Tailwind v4 config)
└── main.ts
```

## 🔧 Configuration Files

### `app.config.ts` - Zoneless Setup

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Enable zoneless
    provideRouter(routes)
  ]
};
```

### `styles.scss` - Tailwind v4

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(51.01% 0.274 263.83);
}
```

## 📚 Learn More

- [Angular Signals](https://angular.dev/guide/signals)
- [Zoneless Angular](https://angular.dev/guide/experimental/zoneless)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [Modern Angular](https://angular.dev/overview)

## 🎓 Best Practices

1. ✅ Use signals for all component state
2. ✅ Use computed() for derived values
3. ✅ Use effect() only for side effects
4. ✅ Expose readonly signals from services
5. ✅ Use inject() for dependency injection
6. ✅ Use @if/@for/@switch instead of *ngIf/*ngFor
7. ✅ Use track in @for for performance
8. ✅ Use Tailwind utilities over custom CSS
9. ✅ Keep signals simple - avoid deep nesting
10. ✅ Update signals immutably

## 🚀 Features to Try

1. **Search Products** - Real-time filtering
2. **Category Filter** - Click category tabs
3. **Sort Products** - By name, price, category
4. **Add Product** - Click "Add Product" button
5. **Toggle Stock** - Click stock badges
6. **Delete Product** - Click trash icon
7. **Load More** - Load additional products

## 🎉 You're Ready!

This project demonstrates the future of Angular development:
- No Zone.js overhead
- Signals-first architecture
- Modern styling with Tailwind v4
- Better performance & DX

Happy coding! 🌴✨
