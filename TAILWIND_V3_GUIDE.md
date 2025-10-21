# Tailwind CSS v3 + Angular Integration Guide

## 🎨 Why Tailwind CSS v3

Tailwind CSS v3 is the stable, production-ready version:
- **Battle-tested** - Used by millions of developers
- **JIT mode** - Fast compilation in development
- **Excellent documentation** - Comprehensive guides
- **Rich ecosystem** - Tons of plugins and resources
- **TypeScript support** - Full type safety

## 📦 Installation

```bash
npm install -D tailwindcss postcss autoprefixer
```

## ⚙️ Setup

### 1. Create `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          // ... more shades
        },
      },
    },
  },
  plugins: [],
}
```

### 2. Import Tailwind in `styles.scss`

```css
/* src/styles.scss */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

/* Custom component styles */
@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-blue-500 text-white rounded-lg;
  }
}
```

## 🎨 Using Custom Theme Values

### Define in CSS

```css
@theme {
  --color-brand: #3b82f6;
  --font-brand: "Inter", sans-serif;
  --spacing-lg: 2rem;
}
```

### Use in HTML

```html
<div class="text-brand font-brand p-lg">
  Custom themed content
</div>
```

## 🌈 Modern Color Spaces

Tailwind v4 supports modern color spaces like `oklch`:

```css
@theme {
  /* OKLCH - perceptually uniform colors */
  --color-primary: oklch(51.01% 0.274 263.83);
  
  /* RGB (still supported) */
  --color-secondary: rgb(59 130 246);
  
  /* HSL (still supported) */
  --color-tertiary: hsl(221 83% 53%);
}
```

**Why oklch?**
- More perceptually uniform
- Wider color gamut
- Better for gradients
- Future-proof

## 📐 Common Patterns

### Gradient Backgrounds

```html
<div class="bg-gradient-to-r from-blue-500 to-purple-600">
  Gradient background
</div>

<div class="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
  Subtle gradient
</div>
```

### Responsive Grid

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items -->
</div>
```

### Hover Effects

```html
<button class="
  px-6 py-3
  bg-blue-500
  hover:bg-blue-600
  hover:shadow-lg
  hover:-translate-y-1
  transition-all duration-200">
  Hover me
</button>
```

### Card Component

```html
<div class="
  bg-white
  rounded-2xl
  shadow-lg
  hover:shadow-2xl
  transition-all duration-300
  transform hover:-translate-y-1
  overflow-hidden">
  <!-- Card content -->
</div>
```

### Sticky Header

```html
<header class="
  bg-white
  shadow-md
  sticky top-0
  z-50">
  <!-- Header content -->
</header>
```

### Flex Center

```html
<div class="flex items-center justify-center min-h-screen">
  <!-- Centered content -->
</div>
```

## 🎯 Utility Class Patterns

### Spacing Scale

```html
<!-- Padding -->
<div class="p-4">All sides</div>
<div class="px-6 py-3">Horizontal & Vertical</div>
<div class="pt-8 pb-4">Top & Bottom</div>

<!-- Margin -->
<div class="m-auto">Auto margins</div>
<div class="mx-4">Horizontal</div>
<div class="my-8">Vertical</div>
```

### Typography

```html
<h1 class="text-3xl font-bold text-gray-800">
  Large heading
</h1>

<p class="text-sm text-gray-600">
  Small text
</p>

<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
  Gradient text
</span>
```

### Borders & Shadows

```html
<div class="
  border-2 border-gray-200
  rounded-lg
  shadow-md
  hover:shadow-xl">
  Card with border
</div>
```

### Transitions

```html
<button class="
  transition-all duration-200
  hover:scale-105">
  Smooth transition
</button>
```

## 🔥 Advanced Patterns

### Glass Morphism

```html
<div class="
  bg-white/10
  backdrop-blur-lg
  border border-white/20
  rounded-2xl
  shadow-xl">
  Glass effect
</div>
```

### Neumorphism

```html
<div class="
  bg-gray-100
  rounded-2xl
  shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
  Neumorphic design
</div>
```

### Custom Focus States

```html
<input class="
  border-2 border-gray-300
  rounded-lg
  focus:ring-2
  focus:ring-purple-500
  focus:border-transparent
  transition-all">
```

### Responsive Images

```html
<img
  src="..."
  class="w-full h-48 object-cover rounded-t-2xl"
  alt="Product">
```

## 🎨 Component Examples

### Button

```html
<button class="
  px-6 py-3
  bg-gradient-to-r from-blue-500 to-purple-600
  text-white
  rounded-lg
  font-semibold
  hover:from-blue-600 hover:to-purple-700
  transition-all duration-200
  shadow-lg hover:shadow-xl
  transform hover:-translate-y-0.5
  disabled:opacity-50 disabled:cursor-not-allowed">
  Click Me
</button>
```

### Input

```html
<input
  type="text"
  class="
    w-full
    px-4 py-3
    border-2 border-gray-200
    rounded-lg
    focus:ring-2
    focus:ring-purple-500
    focus:border-transparent
    transition-all"
  placeholder="Enter text...">
```

### Badge

```html
<span class="
  px-3 py-1
  rounded-full
  text-xs font-bold
  bg-green-500
  text-white
  shadow-md">
  In Stock
</span>
```

### Modal Overlay

```html
<div class="
  fixed inset-0
  bg-black/50
  backdrop-blur-sm
  flex items-center justify-center
  z-50">
  <div class="
    bg-white
    rounded-2xl
    shadow-2xl
    max-w-md
    w-full
    p-6">
    <!-- Modal content -->
  </div>
</div>
```

## 📱 Responsive Design

### Breakpoints

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

### Example

```html
<div class="
  text-sm sm:text-base md:text-lg lg:text-xl
  p-4 md:p-6 lg:p-8">
  Responsive sizing
</div>
```

## 🎯 Best Practices

1. **Use semantic class names** in components
2. **Extract repeated patterns** into components
3. **Use @apply sparingly** - prefer utilities in HTML
4. **Mobile-first approach** - Start with small screens
5. **Use custom theme** for brand colors
6. **Leverage modern CSS** - oklch, cascade layers
7. **Keep it simple** - Don't over-customize

## 🚀 Performance Tips

1. **Purge unused styles** - Automatic in production
2. **Use JIT mode** - Enabled by default in v4
3. **Minimize custom CSS** - Use utilities
4. **Optimize images** - Use proper sizing classes
5. **Lazy load** - Use Angular's lazy loading

## 🔧 Debugging

### Check if Tailwind is working:

```html
<div class="bg-red-500 p-4">
  If this is red with padding, Tailwind works!
</div>
```

### Common issues:

1. **Styles not applying** - Check import in styles.scss
2. **Custom theme not working** - Verify @theme syntax
3. **Build errors** - Ensure @tailwindcss/vite is installed

## 📚 Resources

- [Tailwind v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [Tailwind Play](https://play.tailwindcss.com/) - Online playground
- [Tailwind UI](https://tailwindui.com/) - Official components
- [Headless UI](https://headlessui.com/) - Unstyled components

## 🎉 You're Ready!

Start building beautiful UIs with Tailwind v4! 🎨✨
