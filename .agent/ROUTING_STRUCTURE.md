# Routing Structure Documentation

## Overview
The application now uses a proper routing structure that separates public landing pages from authenticated app pages.

## Route Structure

### Public Routes (No Navigation Bars)
These routes use `LandingLayout` which shows **NO sidebar or bottom navigation**.

```
/ (Root)
├─ NOT Authenticated → LandingPage.tsx
└─ Authenticated → Home.tsx

/auth → Auth.tsx (Google Sign-In)
```

### Protected App Routes (With Navigation)
These routes use `Layout` which shows **sidebar (desktop) and bottom navigation (mobile)**.

```
/profile → Profile page
/vocabularies → Vocabulary list
/vocabularies/:id → Vocabulary details
/vocabularies/add → Add vocabulary (Admin only)
/vocabularies/bulk-add → Bulk add (Admin only)
/vocabularies/edit/:id → Edit vocabulary (Admin only)

/resources → Resources gallery
/resources/:id → Resource details

/ielts → IELTS dashboard
/ielts/speaking → Speaking practice
/ielts/reading → Reading practice
/ielts/writing → Writing practice
/ielts/listening → Listening practice

/favorites → Favorite vocabularies
/admin/users → User management (Admin only)
/admin/duplicates → Duplicate manager (Admin only)
```

## How It Works

### 1. Root Route Handler (`RootRoute` component in App.tsx)
```tsx
const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Not authenticated: show LandingPage
  if (!user) {
    return <LandingPage />;
  }

  // Authenticated: show Home dashboard
  return <Home />;
};
```

### 2. Layout Separation

**LandingLayout** (No navigation)
- Used for `/` and `/auth`
- Clean, full-width pages
- No sidebar or bottom navigation
- Perfect for landing and sign-in pages

**Layout** (With navigation)
- Used for all app pages
- Shows sidebar on desktop
- Shows bottom navigation on mobile
- Only accessible to authenticated users

## User Journey

### First-Time Visitor (Not Signed In)
```
1. Visit website (localhost:5173/)
   → Sees LandingPage with:
      - Hero section
      - Features
      - Screenshot gallery
      - Benefits
      - CTA buttons

2. Click "Get Started Free"
   → Redirected to /auth
   → Sees Auth page with Google Sign-In

3. Sign in with Google
   → Redirected back to /
   → Now sees Home dashboard (authenticated view)
   → Bottom navigation/sidebar appears
```

### Returning User (Signed In)
```
1. Visit website (localhost:5173/)
   → Sees Home dashboard immediately with:
      - Welcome message
      - Search bar
      - Recent vocabularies
      - Daily tip
   → Bottom navigation/sidebar visible

2. Can navigate to any protected route
   → /vocabularies, /profile, /ielts, etc.
```

## Pages Breakdown

### LandingPage.tsx
- **Purpose**: Marketing page for non-authenticated visitors
- **Layout**: LandingLayout (no navigation)
- **Features**:
  - Hero section with CTA
  - Feature highlights
  - App screenshot gallery (6 images)
  - Benefits list
  - Final CTA section
  - Footer
- **Responsive**: Mobile-first design
- **Images**: Fixed `object-contain` to prevent truncation

### Auth.tsx
- **Purpose**: Google Sign-In page
- **Layout**: LandingLayout (no navigation)
- **Features**:
  - Firebase Google OAuth
  - Responsive two-column layout
  - Feature highlights
  - Stats (desktop only)
- **Responsive**: Mobile-first design

### Home.tsx
- **Purpose**: Authenticated user dashboard
- **Layout**: Layout (with navigation)
- **Features**:
  - Welcome message
  - Vocabulary search
  - Recent vocabularies (8 items)
  - Daily learning tip
- **Responsive**: Mobile-first design
- **Note**: This page is ONLY shown to authenticated users

## Key Benefits

✅ **Clear Separation**: Public vs authenticated pages
✅ **Better UX**: First-time visitors see marketing content
✅ **Proper Navigation**: Nav bars only show for app pages
✅ **SEO Friendly**: Landing page can be optimized for search
✅ **Responsive**: All pages work on mobile, tablet, desktop
✅ **Standard Pattern**: Follows common web app architecture

## Testing

### To Test Landing Page (Not Signed In)
1. Sign out if currently signed in
2. Visit `/`
3. Should see: LandingPage with no navigation bars
4. Click "Get Started Free" → should go to `/auth`

### To Test Home Dashboard (Signed In)
1. Sign in at `/auth`
2. Should redirect to `/`
3. Should see: Home dashboard with search and navigation bars
4. Bottom nav/sidebar should be visible

### To Test Protected Routes
1. Sign in
2. Click on Vocabulary in bottom nav
3. Should see: Vocabularies page with navigation
4. Try `/profile`, `/ielts`, etc. - all should show navigation
