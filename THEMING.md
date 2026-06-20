# Theming Guidelines

This document outlines the theming approach used in the Printa project.

## Light Mode

The application uses **light mode by default**. No class is needed on the `<html>` element for light mode.

```html
<html lang="en">
```

## Semantic Color Classes

Always use semantic Tailwind CSS color classes instead of hardcoded colors. This ensures consistency and makes theme changes easier.

### Text Colors

| Class | Usage |
|-------|-------|
| `text-foreground` | Primary text (default, no class needed on body) |
| `text-muted-foreground` | Secondary/dimmed text |
| `text-primary` | Primary brand color text |
| `text-destructive` | Error/danger text |

### Background Colors

| Class | Usage |
|-------|-------|
| `bg-background` | Main background |
| `bg-card` | Card/elevated surfaces |
| `bg-muted` | Muted/subtle backgrounds |
| `bg-primary` | Primary brand background |
| `bg-secondary` | Secondary background |
| `bg-accent` | Accent/hover states |

### Border Colors

| Class | Usage |
|-------|-------|
| `border-border` | Default borders |
| `border-input` | Form input borders |

### Accent Color (Brand)

Use shadcn's semantic `primary` variables for all interactive elements:

```
text-primary              - Hover states, links
bg-primary                - Buttons, active states
hover:bg-primary/90       - Button hover
border-primary            - Accent borders
text-primary-foreground   - Text on primary background
```

## Component Styling Patterns

### Cards/Panels on Gradient Background

```tsx
className="border border-border bg-card/50 backdrop-blur-xl"
```

### Links with Hover

```tsx
className="text-muted-foreground hover:text-primary transition-colors"
```

### Icon Buttons

```tsx
className="border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
```

### Form Labels

```tsx
className="mb-2 block text-sm font-medium"
// No color class needed - inherits from foreground
```

## Gradient Background

The app uses a global gradient background applied at the Layout level via `GradientBackground` component:

- Base: `from-white via-gray-50 to-gray-100`
- Animated blobs with `bg-gray-200/50`, `bg-slate-200/40`, `bg-gray-300/30`

## DO NOT

- ❌ Use `text-white` - use default or `text-foreground`
- ❌ Use `text-slate-*` - use `text-muted-foreground`
- ❌ Use `text-gray-*` - use semantic classes
- ❌ Use `border-white/10` - use `border-border`
- ❌ Hardcode colors repeatedly - create reusable components

## CSS Variables

Theme colors are defined in `apps/web/src/assets/index.css` using CSS variables:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  /* ... */
}
```

These are mapped to Tailwind via `@theme inline` block.
