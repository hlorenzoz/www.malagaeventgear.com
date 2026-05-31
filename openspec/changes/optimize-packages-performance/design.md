# Design: Packages & Services Performance Optimization

## Architecture & Naming Strategy
Instead of hardcoding image properties or changing the raw `image` definitions in `src/lib/data/packages.ts`, we dynamically resolve the responsive crops based on the base path (`pkg.image`).
This ensures:
1. High modularity: no changes required to packages configuration schema or business definitions.
2. Dynamic resolution: `replace('.webp', '-mobile.webp')` and `replace('.webp', '-desktop.webp')` will dynamically output the correct URLs.

## Image Processing & Crops
The display ratio of the card cover image is defined by `h-44` (Tailwind `height: 11rem` or `176px`).
With card width roughly ~370px, the exact aspect ratio is ~2.102:1.
By taking the original 800x800 square images:
- **Desktop Crop**: center-crop the vertical range `[210, 590]` to obtain an 800x380 pixel landscape version.
- **Mobile Crop**: resize the 800x380 crop to 400x190.
This perfectly matches the container display aspect ratio, preventing download of unused vertical pixels.

For the **Services** images:
- Source images are around 600x400 / 600x600.
- We center-crop to 600x400 for desktop (`*-desktop.webp`) and 400x266 for mobile (`*-mobile.webp`).
- We convert CSS background-image properties into semantic HTML `<picture>` elements.

## Markup Details

### `/packages/` Cards Listing
```svelte
<picture class="absolute inset-0 w-full h-full">
	<source media="(max-width: 767px)" srcset={mobileImage} type="image/webp" />
	<source media="(min-width: 768px)" srcset={desktopImage} type="image/webp" />
	<img
		src={desktopImage}
		alt={plan.name}
		loading={i === 0 ? 'eager' : 'lazy'}
		fetchpriority={i === 0 ? 'high' : 'auto'}
		decoding="async"
		class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
		width="800"
		height="380"
	/>
</picture>
```

### `/packages/[slug]/` Detail Bento Grid
```svelte
<picture class="absolute inset-0 w-full h-full">
	<source media="(max-width: 767px)" srcset={mobileImage} type="image/webp" />
	<source media="(min-width: 768px)" srcset={desktopImage} type="image/webp" />
	<img
		alt={pkg.name}
		class="w-full h-full object-cover opacity-90"
		src={desktopImage}
		loading="lazy"
		decoding="async"
		width="800"
		height="380"
	/>
</picture>
```

### Services Grid (on `/equipment/` and `/`)
```svelte
<picture class="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105 pointer-events-none">
	<source media="(max-width: 767px)" srcset="/images/services/sound-mobile.webp" type="image/webp" />
	<source media="(min-width: 768px)" srcset="/images/services/sound-desktop.webp" type="image/webp" />
	<img 
		alt="Professional sound system rental" 
		class="w-full h-full object-cover" 
		src="/images/services/sound-desktop.webp"
		loading="lazy"
		decoding="async"
		width="600"
		height="400"
	/>
</picture>
```
