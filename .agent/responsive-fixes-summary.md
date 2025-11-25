# Responsive Design Fixes - Vocabularies Page

## Summary
Made the Vocabularies page (`/vocabularies`) and its filter UI fully responsive for mobile and small devices (down to 320px width).

## Changes Made

### 1. **Vocabularies Page Header** (`src/pages/Vocabularies.tsx`)
- **Padding**: Reduced from `px-4 pt-8 pb-6` to `px-3 sm:px-4 pt-4 sm:pt-8 pb-4 sm:pb-6`
- **Title**: Responsive sizing `text-lg sm:text-2xl` with truncation
- **Word Count**: Smaller text on mobile `text-xs sm:text-sm`
- **Admin Buttons**:
  - Smaller on mobile: `h-8 sm:h-9`
  - Icon-only on mobile with text hidden: `hidden sm:inline`
  - "Bulk Upload" button hidden on extra small screens: `hidden xs:flex`
- **Container**: Increased max-width from `max-w-lg` to `max-w-4xl` for better use of space

### 2. **Search and Filter Bar**
- **Search Input**:
  - Responsive height: `h-9 sm:h-10`
  - Adjusted padding: `pl-8 sm:pl-10 pr-8 sm:pr-10`
  - Smaller icons on mobile: `h-3.5 w-3.5 sm:h-4 sm:w-4`
- **Filter Button**:
  - Fixed size: `h-9 sm:h-10 w-9 sm:w-10`
  - Badge counter now shows number with responsive sizing
- **Gap**: Reduced from `gap-2` to `gap-1.5 sm:gap-2`

### 3. **Filter Sheet (Bottom Sheet)**
- **Height**: Adaptive `h-[85vh] sm:h-[80vh]` for better mobile fit
- **Padding**: Responsive `px-4 sm:px-6`
- **Title**: Responsive sizing `text-lg sm:text-xl`
- **Description**: Smaller on mobile `text-xs sm:text-sm`
- **Content Area**:
  - Added scrolling with `overflow-y-auto`
  - Responsive spacing: `space-y-4 sm:space-y-6`
- **Select Triggers**: Responsive height `h-10 sm:h-11`
- **Labels**: Responsive sizing `text-sm sm:text-base`
- **Favorites Toggle**:
  - Reduced padding on mobile: `p-3 sm:p-4`
  - Added flex-1 and pr-2 for better text wrapping
- **Filter Badges**: Smaller text on mobile `text-xs sm:text-sm`
- **Show Results Button**: Responsive height `h-10 sm:h-11`

### 4. **VocabCard Component** (`src/components/VocabCard.tsx`)
- **Card Padding**: Reduced on mobile `p-3 sm:p-4`
- **Layout**:
  - Added `gap-2` between content and buttons
  - Added `min-w-0` for proper text truncation
  - Made badge flex-shrink-0 to prevent squishing
- **Text Sizes**:
  - Bangla title: `text-base sm:text-xl`
  - English word: `text-sm sm:text-lg`
  - Pronunciation: `text-xs sm:text-sm`
  - Badge: `text-[10px] sm:text-xs`
- **Buttons**:
  - Smaller on mobile: `h-7 w-7 sm:h-8 sm:w-8`
  - Icons: `h-3.5 w-3.5 sm:h-4 sm:w-4`
  - Reduced gap: `gap-0.5 sm:gap-1`
- **Explanation**:
  - Added `line-clamp-2` for truncation
  - Added `break-words` for long words
  - Responsive sizing: `text-xs sm:text-sm`

### 5. **Main Content Container**
- **Max Width**: Increased from `max-w-lg` to `max-w-4xl`
- **Padding**: Responsive `px-3 sm:px-4 py-3 sm:py-4`
- **Empty State**:
  - Reduced padding on mobile: `py-8 sm:py-12`
  - Smaller icon: `h-12 w-12 sm:h-16 sm:w-16`
  - Responsive text sizes
- **Card Spacing**: Reduced on mobile `space-y-2.5 sm:space-y-3`

### 6. **CSS Utilities** (`src/index.css`)
- Added `.line-clamp-2` utility for text truncation
- Added touch-friendly tap targets (44px minimum) for mobile devices
- Added standard `line-clamp` property for better browser compatibility

### 7. **Tailwind Configuration** (`tailwind.config.ts`)
- Added custom breakpoint `xs: 475px` for extra small devices
- Defined all standard breakpoints explicitly for clarity

## Breakpoints Used
- **xs**: 475px (extra small phones)
- **sm**: 640px (small tablets and large phones)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large desktops)

## Testing Recommendations
Test the page at the following viewport widths:
- 320px (iPhone SE)
- 375px (iPhone 12/13 Mini)
- 390px (iPhone 12/13/14)
- 414px (iPhone 12/13 Pro Max)
- 768px (iPad)
- 1024px (iPad Pro)

## Notes
- All text now uses `break-words` to prevent overflow on long words
- Touch targets meet accessibility guidelines (44px minimum on mobile)
- Filter badge now shows the count of active filters
- The layout gracefully adapts from mobile to desktop
- CSS lint warnings for `@tailwind` and `@apply` are expected and can be ignored (they're Tailwind-specific directives)
