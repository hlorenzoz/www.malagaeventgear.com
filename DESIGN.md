---
name: Ether Event Luxury
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#cac4d1'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#948f9a'
  outline-variant: '#49454f'
  surface-tint: '#cebdff'
  primary: '#cebdff'
  on-primary: '#352561'
  primary-container: '#31215d'
  on-primary-container: '#9b89cd'
  inverse-primary: '#645493'
  secondary: '#ffb4a4'
  on-secondary: '#591c0f'
  secondary-container: '#793425'
  on-secondary-container: '#ff9f8b'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#2c2c2c'
  on-tertiary-container: '#959393'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#200e4c'
  on-primary-fixed-variant: '#4c3d7a'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#ffb4a4'
  on-secondary-fixed: '#3c0701'
  on-secondary-fixed-variant: '#763223'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
  electric-blue: '#4D8CFF'
  surface-glass: rgba(255, 255, 255, 0.05)
  border-glass: rgba(255, 255, 255, 0.12)
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

This design system is crafted for the high-end event equipment market, targeting premium corporate clients and luxury event planners. The brand personality is **Exclusive, Sophisticated, and Technological**. The UI evokes a sense of high-production value, mirroring the premium gear—lighting, sound, and staging—that the service provides.

The aesthetic direction is **Refined Glassmorphism**. We utilize deep, multi-layered backgrounds with frosted glass surfaces to create a sense of physical depth and transparency. The interface feels light despite its dark color palette, using blurred backdrops and vibrant light-leaks to suggest the atmosphere of a live event. The design prioritizes high-quality imagery and "airy" layouts to communicate quality over quantity.

## Colors

The palette is anchored in a **Sophisticated Dark Theme**. The primary color is a deep, royal violet-indigo (`#31215D`), used for structural depth and brand presence. The secondary color, a soft coral-gold (`#FF9F8A`), serves as a warm accent to guide the eye toward premium actions and highlights.

To achieve the "Electric" luxury feel, we introduce a vibrant blue (`#4D8CFF`) for interactive elements and data points. Neutral colors are kept at the extremes: absolute black (`#121212`) for the base canvas and pure white (`#FFFFFF`) for high-contrast typography. Backgrounds are not flat; they utilize subtle radial gradients from the primary indigo to black to simulate event lighting.

## Typography

The typography system pairs **Playfair Display**, a sophisticated serif, with **Plus Jakarta Sans**, a modern and welcoming geometric sans-serif. 

Playfair Display is reserved for high-impact headlines and display text, evoking the elegance of a luxury invitation. Plus Jakarta Sans handles all functional and body text, ensuring high legibility and a contemporary technical feel. For labels and small callouts, we use uppercase tracking (0.1em) to add an "editorial" touch. Large display sizes are scaled down aggressively for mobile to maintain the layout's integrity.

## Layout & Spacing

The layout follows a **Fluid Grid with Generous Whitespace**. We utilize a 12-column system for desktop with significant outer margins to center-stage the content, creating an "airy" and exclusive feel. 

Spacing follows a base-8 rhythm, but with a preference for larger increments (32px, 48px, 64px) to avoid visual clutter. Section vertical padding should be substantial (120px+) on desktop to separate different gear categories or brand messages. On mobile, we reduce margins to 20px but maintain the vertical breathing room between components to keep the premium feel intact.

## Elevation & Depth

Hierarchy is established through **Backdrop Blur and Tonal Layering** rather than traditional heavy shadows.

- **Base Layer:** Deep charcoal (`#121212`) or dark indigo (`#31215D`) with subtle grain.
- **Surface Layer:** 5% white opacity with a 20px `backdrop-filter: blur()`. This creates the frosted glass effect.
- **Interactive Layer:** Enhanced brightness (10% white opacity) and a thin 1px border (`rgba(255, 255, 255, 0.15)`) to define edges.
- **Shadows:** When used, shadows are "Ambient"—very large blur radius (40px+), low opacity (15%), and tinted with the primary indigo color to prevent a "dirty" look.

## Shapes

The shape language is **Softly Rounded**, moving away from harsh technical angles to a more organic, premium feel. UI elements like cards and input fields use a 0.5rem (8px) radius. Larger containers or "Hero" glass panels use the `rounded-xl` (24px) setting to emphasize the softness of the glass material. Buttons are slightly more pronounced but should stop short of being fully pill-shaped to maintain a professional, corporate edge.

## Components

### Buttons
Primary buttons use a solid gradient of Electric Blue to Indigo, or a solid Coral-Gold for "Book Now" actions. Secondary buttons are "Ghost" style with a glass-blur background and a 1px white border.

### Input Fields
Inputs are transparent with a bottom-only border or a very subtle glass fill. On focus, the border glows with the Electric Blue accent. Labels sit above the field in a small, tracked-out sans-serif.

### Cards
Cards are the primary vehicle for equipment listings. They feature a high-blur glass background, a subtle 1px top-left highlight border, and no fill color. The product image should appear to "float" above the glass surface.

### Chips & Badges
Small, semi-transparent capsules used for "Available" or "New" status. They use a low-opacity version of the accent colors (e.g., 20% blue fill) to maintain the glass aesthetic.

### Equipment Lists
Lists should be spacious, using thin horizontal glass dividers. Each item should have a hover state that increases the backdrop-blur intensity and adds a subtle outer glow.