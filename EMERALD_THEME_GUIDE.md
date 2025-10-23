# Emerald Theme CSS Update Guide

## Color Palette - Emerald Essence
- **Primary (Deep Emerald)**: `#0D2B1D` - Headers, primary buttons, dark backgrounds
- **Secondary (Forest Green)**: `#345635` - Text, secondary buttons, accents  
- **Tertiary (Sage Green)**: `#6B8F71` - Borders, hover states, icons
- **Quaternary (Light Sage)**: `#AEC3B0` - Light borders, backgrounds
- **Light (Pale Mint)**: `#E3EFD3` - Backgrounds, highlights

## Global Replacements Needed

### Background Colors
```
bg-gray-50 → bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]
bg-white → bg-white (keep, but add borders)
```

### Borders
```
border-gray-300 → border-2 border-[#AEC3B0]
border-gray-200 → border-2 border-[#AEC3B0]
rounded-lg → rounded-xl or rounded-2xl
shadow-md → shadow-lg
```

### Buttons - Primary
```
bg-blue-600 → bg-gradient-to-r from-[#345635] to-[#6B8F71]
hover:bg-blue-700 → hover:shadow-xl transition-all hover:scale-105
text-white → text-white (keep)
rounded-lg → rounded-xl
```

### Buttons - Secondary
```
bg-gray-100 → bg-[#E3EFD3]
text-gray-700 → text-[#345635]
hover:bg-gray-200 → hover:bg-[#AEC3B0]
```

### Buttons - Border
```
border border-gray-300 → border-2 border-[#6B8F71]
text-gray-700 → text-[#345635]
hover:bg-gray-50 → hover:bg-[#E3EFD3]
```

### Text Colors
```
text-gray-900 → text-[#0D2B1D]
text-gray-600 → text-[#6B8F71]
text-gray-700 → text-[#345635]
font-bold → font-bold (keep)
```

### Status Badges - Emerald Theme
```tsx
// Pending
bg-yellow-100 text-yellow-800 → bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] text-[#345635]

// Accepted/Success
bg-green-100 text-green-700 → bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white

// In Progress
bg-blue-100 text-blue-800 → bg-gradient-to-r from-[#6B8F71] to-[#AEC3B0] text-white

// Rejected/Error
bg-red-100 text-red-800 → bg-red-100 text-red-700 (keep for errors)

// Neutral
bg-gray-100 text-gray-700 → bg-[#E3EFD3] text-[#6B8F71]
```

### Loading Spinners
```
border-b-2 border-blue-600 → border-4 border-[#AEC3B0] border-t-[#345635]
h-12 w-12 → h-16 w-16
text-gray-600 → text-[#6B8F71] font-medium
```

### Cards
```
bg-white rounded-lg shadow-md p-6 → 
bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-6

hover:shadow-lg → hover:shadow-2xl hover:border-[#6B8F71] transition-all duration-300
```

### Stats Cards
```tsx
// Total/Main Stats
<div className="bg-white rounded-xl shadow-lg p-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div className="text-sm text-[#6B8F71] mb-2 font-medium">Label</div>
  <div className="text-3xl font-bold text-[#0D2B1D]">Value</div>
</div>

// Pending Stats
<div className="bg-gradient-to-br from-[#E3EFD3] to-white rounded-xl shadow-lg p-5 border-2 border-[#AEC3B0] hover:border-[#6B8F71] hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div className="text-sm text-[#345635] mb-2 font-medium">⏳ Label</div>
  <div className="text-3xl font-bold text-[#0D2B1D]">Value</div>
</div>

// In Progress Stats  
<div className="bg-gradient-to-br from-[#6B8F71]/10 to-white rounded-xl shadow-lg p-5 border-2 border-[#6B8F71] hover:border-[#345635] hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div className="text-sm text-[#345635] mb-2 font-medium">🔨 Label</div>
  <div className="text-3xl font-bold text-[#0D2B1D]">Value</div>
</div>

// Success/Earnings Stats
<div className="bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl shadow-xl p-5 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
  <div className="text-sm opacity-90 mb-2 font-medium">💰 Label</div>
  <div className="text-3xl font-bold">₹ Value</div>
</div>
```

### Filter Tabs
```tsx
<div className="bg-white rounded-xl shadow-lg p-3 mb-8 border-2 border-[#AEC3B0]">
  <div className="flex flex-wrap gap-2">
    <button className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg scale-105'
        : 'bg-[#E3EFD3] text-[#345635] hover:bg-[#AEC3B0] hover:scale-102'
    }`}>
      Label
    </button>
  </div>
</div>
```

### Headers with Icon
```tsx
<div className="flex items-center mb-3">
  <div className="w-14 h-14 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-xl flex items-center justify-center mr-4 shadow-lg">
    <span className="text-3xl">🎯</span>
  </div>
  <div>
    <h1 className="text-4xl font-bold text-[#0D2B1D]">Title</h1>
    <p className="text-[#6B8F71] mt-1">Subtitle</p>
  </div>
</div>
```

### Back Buttons
```tsx
<button
  onClick={() => navigate(-1)}
  className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-4 transition-all duration-300 group"
>
  <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
  <span className="font-medium">Back</span>
</button>
```

### Empty States
```tsx
<div className="bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12 text-center">
  <div className="w-28 h-28 bg-gradient-to-br from-[#E3EFD3] to-[#AEC3B0] rounded-full mx-auto mb-6 flex items-center justify-center">
    <span className="text-6xl">📋</span>
  </div>
  <h3 className="text-2xl font-bold text-[#0D2B1D] mb-3">Title</h3>
  <p className="text-[#6B8F71] mb-8 text-lg">Description</p>
  <button className="px-8 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium hover:scale-105">
    Action
  </button>
</div>
```

### Pagination
```tsx
<div className="flex justify-center gap-3 mt-8">
  <button
    disabled={currentPage === 1}
    className="px-5 py-2.5 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] disabled:opacity-50 transition-all font-semibold hover:scale-105"
  >
    Previous
  </button>
  <span className="px-5 py-2.5 text-[#0D2B1D] font-bold bg-gradient-to-r from-[#E3EFD3] to-[#AEC3B0] rounded-xl">
    Page {currentPage} of {totalPages}
  </span>
  <button
    disabled={currentPage === totalPages}
    className="px-5 py-2.5 border-2 border-[#6B8F71] text-[#345635] rounded-xl hover:bg-[#E3EFD3] disabled:opacity-50 transition-all font-semibold hover:scale-105"
  >
    Next
  </button>
</div>
```

### Input Fields
```
border border-gray-300 → border-2 border-[#AEC3B0]
focus:ring-2 focus:ring-blue-500 → focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71]
```

### Access Denied Pages
```tsx
<div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
  <Header />
  <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
    <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-[#AEC3B0] p-12">
      <div className="w-24 h-24 bg-gradient-to-br from-[#0D2B1D] via-[#345635] to-[#6B8F71] rounded-full mx-auto mb-6 flex items-center justify-center">
        <span className="text-5xl">🚫</span>
      </div>
      <h2 className="text-2xl font-bold text-[#0D2B1D] mb-3">Access Denied</h2>
      <p className="text-[#6B8F71] mb-6">Message</p>
      <button className="px-6 py-3 bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white rounded-xl hover:shadow-xl transition-all font-semibold hover:scale-105">
        Action
      </button>
    </div>
  </main>
  <Footer />
</div>
```

## Files Completed
✅ NotificationsPage.tsx - Full emerald theme applied
✅ OngoingJobs.tsx - Full emerald theme applied  
✅ PostJob.tsx - Full emerald theme applied
✅ Dashboard.tsx - Full emerald theme applied
✅ Leaderboard.tsx - Full emerald theme applied
✅ Settings.tsx - Full emerald theme applied
✅ Referrals.tsx - Full emerald theme applied
✅ Jobs.tsx - Header & filters with emerald theme
✅ Messages.tsx - Full emerald theme applied
✅ Home.tsx - Full emerald theme applied

## Files Needing Updates
- MyProposals.tsx
- MyOrders.tsx
- JobProposals.tsx
- ApplyJob.tsx
- EditJob.tsx
- EditProposal.tsx
- BrowseProviders.tsx
- FindNearbyProviders.tsx

## Quick Reference Pattern Matching

Use Find & Replace in VS Code:
1. Find: `bg-gray-50` → Replace: `bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]`
2. Find: `border-gray-300` → Replace: `border-[#AEC3B0]`
3. Find: `text-gray-900` → Replace: `text-[#0D2B1D]`
4. Find: `text-gray-600` → Replace: `text-[#6B8F71]`
5. Find: `bg-blue-600` → Replace: `bg-gradient-to-r from-[#345635] to-[#6B8F71]`

Remember to:
- Add `hover:scale-105` to buttons
- Change `rounded-lg` to `rounded-xl` or `rounded-2xl`
- Add `transition-all duration-300` for smooth animations
- Update loading spinners to emerald colors
- Update all status badges to emerald gradients
