# Update MyOrders.tsx to professional design
$file = "MyOrders.tsx"
$content = Get-Content $file -Raw

# Update container and layout
$content = $content -replace 'bg-gradient-to-br from-\[#E3EFD3\] via-white to-\[#F8FBF9\]', 'bg-background'
$content = $content -replace 'max-w-\[1500px\]', 'max-w-7xl'
$content = $content -replace 'px-4 sm:px-6 lg:px-8 py-8', 'px-6 py-24'

# Update text colors
$content = $content -replace 'text-\[#0D2B1D\]', 'text-text-primary'
$content = $content -replace 'text-\[#345635\]', 'text-primary'
$content = $content -replace 'text-\[#6B8F71\]', 'text-text-secondary'
$content = $content -replace 'text-gray-900', 'text-text-primary'
$content = $content -replace 'text-gray-800', 'text-text-primary'
$content = $content -replace 'text-gray-700', 'text-text-primary'
$content = $content -replace 'text-gray-600', 'text-text-secondary'
$content = $content -replace 'text-gray-500', 'text-text-muted'

# Update backgrounds
$content = $content -replace 'bg-gray-100', 'bg-surface'
$content = $content -replace 'bg-gray-50', 'bg-surface'
$content = $content -replace 'hover:bg-gray-50', 'hover:bg-surface'

# Update borders
$content = $content -replace 'border-\[#AEC3B0\]', 'border-border'
$content = $content -replace 'border-\[#6B8F71\]', 'border-primary'
$content = $content -replace 'border-\[#345635\]', 'border-primary'
$content = $content -replace 'border-gray-200', 'border-border'
$content = $content -replace 'border-gray-300', 'border-border'
$content = $content -replace 'border-2 border-', 'border border-'

# Update gradients to solid/simple
$content = $content -replace 'bg-gradient-to-br from-\[#0D2B1D\] via-\[#345635\] to-\[#6B8F71\]', 'bg-primary'
$content = $content -replace 'bg-gradient-to-r from-\[#345635\] to-\[#6B8F71\]', 'bg-primary'
$content = $content -replace 'bg-gradient-to-br from-\[#E3EFD3\] to-\[#AEC3B0\]', 'bg-surface'
$content = $content -replace 'bg-gradient-to-br from-\[#E3EFD3\] to-white', 'bg-surface'
$content = $content -replace 'bg-gradient-to-br from-\[#6B8F71\]/10 to-white', 'bg-surface'
$content = $content -replace 'bg-gradient-to-br from-\[#6B8F71\]/20 to-white', 'bg-surface'
$content = $content -replace 'from-\[#E3EFD3\] to-\[#AEC3B0\]', 'from-primary/10 to-primary/20'
$content = $content -replace 'from-\[#6B8F71\] to-\[#AEC3B0\]', 'from-primary/70 to-primary/40'

# Update blue colors to primary
$content = $content -replace 'bg-blue-600', 'bg-primary'
$content = $content -replace 'hover:bg-blue-700', 'hover:bg-primary-dark'
$content = $content -replace 'bg-blue-100 text-blue-700', 'bg-primary/10 text-primary'
$content = $content -replace 'from-blue-500 to-indigo-600', 'from-primary to-primary-dark'

# Update hover effects
$content = $content -replace 'hover:shadow-xl', 'hover:shadow-soft'
$content = $content -replace 'hover:shadow-2xl', 'hover:shadow-medium'
$content = $content -replace 'hover:scale-105', ''
$content = $content -replace 'scale-105', ''
$content = $content -replace 'hover:border-\[#345635\]', 'hover:border-primary/30'
$content = $content -replace 'hover:border-\[#6B8F71\]', 'hover:border-primary/30'

# Update shadows
$content = $content -replace 'shadow-lg', 'shadow-soft'
$content = $content -replace 'shadow-xl', 'shadow-medium'
$content = $content -replace 'shadow-md', ''

# Update rounded corners
$content = $content -replace 'rounded-lg(?!-)', 'rounded-xl'

# Update font weights
$content = $content -replace 'font-bold', 'font-semibold'

# Update transitions
$content = $content -replace 'duration-300', 'duration-200'

Set-Content $file $content -NoNewline
Write-Host "Updated $file with professional design" -ForegroundColor Green
