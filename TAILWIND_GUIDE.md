# Tailwind CSS v3 + Angular - Complete Guide

## 🎨 Why Tailwind CSS v3

Tailwind CSS v3 is the **stable, production-ready version**:
- ✅ **Battle-tested** - Used by millions of developers
- ✅ **JIT Mode** - Lightning-fast builds
- ✅ **Excellent Docs** - Comprehensive documentation
- ✅ **Rich Ecosystem** - Tons of plugins available
- ✅ **Stable API** - No breaking changes

## 📦 Installation

```bash
npm install -D tailwindcss postcss autoprefixer
```

## ⚙️ Configuration

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
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
    },
  },
  plugins: [],
}
```

### 2. Setup `styles.scss`

```css
/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    @apply antialiased;
  }
}

/* Custom component classes */
@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl;
  }
  
  .card {
    @apply bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300;
  }
  
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent;
  }
}

/* Custom utilities */
@layer utilities {
  .text-gradient {
    @apply text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600;
  }
}
```

## 🎨 Custom Colors

### Define Custom Palette

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
      },
    },
  },
}
```

### Use in Templates

```html
<div class="bg-brand text-white">Brand colored</div>
<div class="bg-brand-light">Light variant</div>
<div class="bg-brand-dark">Dark variant</div>
```

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
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
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
  transition-all duration-200
  rounded-lg">
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
  <img src="..." class="w-full h-48 object-cover" />
  <div class="p-6">
    <h3 class="text-xl font-bold">Title</h3>
    <p class="text-gray-600">Description</p>
  </div>
</div>
```

### Sticky Header

```html
<header class="
  bg-white
  shadow-md
  sticky top-0
  z-50">
  <div class="max-w-7xl mx-auto px-4 py-6">
    Header content
  </div>
</header>
```

## 🎯 Using @layer

### Base Layer - Global resets

```css
@layer base {
  h1 {
    @apply text-3xl font-bold;
  }
  
  a {
    @apply text-blue-500 hover:text-blue-700;
  }
}
```

### Components Layer - Reusable components

```css
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
}
```

### Utilities Layer - Custom utilities

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .scrollbar-hide {
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
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

### Focus States

```html
<input class="
  border-2 border-gray-300
  rounded-lg
  focus:ring-2
  focus:ring-purple-500
  focus:border-transparent
  transition-all" />
```

### Responsive Typography

```html
<h1 class="
  text-2xl sm:text-3xl md:text-4xl lg:text-5xl
  font-bold">
  Responsive heading
</h1>
```

### Flex Center

```html
<div class="flex items-center justify-center min-h-screen">
  Centered content
</div>
```

## 🎨 Component Examples

### Button

```html
<button class="btn-primary">
  Click Me
</button>

<!-- Or inline -->
<button class="
  px-6 py-3
  bg-blue-500 hover:bg-blue-600
  text-white
  rounded-lg
  transition-colors">
  Click Me
</button>
```

### Input

```html
<input
  type="text"
  class="input-field"
  placeholder="Enter text...">

<!-- Or inline -->
<input
  type="text"
  class="
    w-full px-4 py-2
    border border-gray-300
    rounded-lg
    focus:ring-2 focus:ring-blue-500
    focus:border-transparent"
  placeholder="Enter text...">
```

### Badge

```html
<span class="
  px-3 py-1
  rounded-full
  text-xs font-bold
  bg-green-500 text-white
  shadow-md">
  In Stock
</span>
```

### Modal

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
    max-w-md w-full
    p-6">
    Modal content
  </div>
</div>
```

## 📱 Responsive Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large Desktop
      '2xl': '1536px', // Extra Large
    },
  },
}
```

### Usage

```html
<div class="
  text-sm sm:text-base md:text-lg lg:text-xl
  p-4 md:p-6 lg:p-8">
  Responsive sizing
</div>
```

## 🎯 Best Practices

1. ✅ **Use @layer** for custom styles
2. ✅ **Extract common patterns** to component classes
3. ✅ **Mobile-first** approach
4. ✅ **Use semantic class names** in components
5. ✅ **Leverage JIT mode** for faster development
6. ✅ **Keep utilities in HTML** - Don't overuse @apply
7. ✅ **Use config for theme** - Colors, spacing, etc.
8. ✅ **Optimize for production** - Purge unused CSS

## 🚀 Performance Tips

1. **Content Configuration** - Include all template files
2. **JIT Mode** - Enabled by default in v3
3. **Purge CSS** - Automatic in production builds
4. **Minimize @apply** - Use utilities in HTML when possible
5. **Tree-shaking** - Angular handles automatically

## 🔧 Debugging

### Test if Tailwind works:

```html
<div class="bg-red-500 p-4 text-white">
  If this is red with padding and white text, Tailwind works!
</div>
```

### Common Issues:

1. **Styles not applying**
   - Check `@tailwind` imports in styles.scss
   - Verify `content` paths in config
   - Restart dev server

2. **Custom colors not working**
   - Check `tailwind.config.js` syntax
   - Extend theme, don't override

3. **Purging too much**
   - Add dynamic classes to safelist
   - Use complete class names (no string concatenation)

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/) - Premium components
- [Headless UI](https://headlessui.com/) - Unstyled components
- [Tailwind Play](https://play.tailwindcss.com/) - Online playground
- [Heroicons](https://heroicons.com/) - Icon library

## 🎉 You're Ready!

Tailwind CSS v3 is **stable, fast, and production-ready**. Build beautiful UIs with confidence! 🎨✨
