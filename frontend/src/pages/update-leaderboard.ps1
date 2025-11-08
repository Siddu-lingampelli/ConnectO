# Update Leaderboard.tsx to professional design
$file = "Leaderboard.tsx"
$content = Get-Content $file -Raw

# Update container and layout
$content = $content -replace 'bg-gradient-to-br from-\[#E3EFD3\] via-white to-\[#F8FBF9\]', 'bg-background'
$content = $content -replace 'max-w-\[1500px\]', 'max-w-7xl'
$content = $content -replace 'px-4 sm:px-6 lg:px-8 py-8', 'px-6 py-24'

# Update text colors
$content = $content -replace 'text-\[#0D2B1D\]', 'text-text-primary'
$content = $content -replace 'text-\[#345635\]', 'text-primary'
$content = $content -replace 'text-\[#6B8F71\]', 'text-text-secondary'
$content = $content -replace 'text-emerald-900', 'text-text-primary'
$content = $content -replace 'text-emerald-800', 'text-text-primary'
$content = $content -replace 'text-emerald-700', 'text-primary'
$content = $content -replace 'text-emerald-600', 'text-primary'
$content = $content -replace 'text-gray-900', 'text-text-primary'
$content = $content -replace 'text-gray-800', 'text-text-primary'
$content = $content -replace 'text-gray-700', 'text-text-primary'
$content = $content -replace 'text-gray-600', 'text-text-secondary'
$content = $content -replace 'text-gray-500', 'text-text-muted'

# Update backgrounds
$content = $content -replace 'bg-gray-100', 'bg-surface'
$content = $content -replace 'bg-gray-50', 'bg-surface'
$content = $content -replace 'hover:bg-gray-50', 'hover:bg-surface'
$content = $content -replace 'bg-emerald-50', 'bg-primary/10'
$content = $content -replace 'hover:bg-emerald-50', 'hover:bg-primary/10'

# Update borders
$content = $content -replace 'border-\[#AEC3B0\]', 'border-border'
$content = $content -replace 'border-\[#6B8F71\]', 'border-primary'
$content = $content -replace 'border-\[#345635\]', 'border-primary'
$content = $content -replace 'border-emerald-200', 'border-primary/30'
$content = $content -replace 'border-emerald-300', 'border-primary/30'
$content = $content -replace 'border-gray-200', 'border-border'
$content = $content -replace 'border-gray-300', 'border-border'
$content = $content -replace 'border-2 border-', 'border border-'
$content = $content -replace 'border-3 border-', 'border-2 border-'

# Update gradients
$content = $content -replace 'bg-gradient-to-r from-emerald-600 to-emerald-700', 'bg-primary'
$content = $content -replace 'bg-gradient-to-br from-emerald-600 to-emerald-700', 'bg-primary'
$content = $content -replace 'from-emerald-500 to-emerald-600', 'from-primary to-primary-dark'
$content = $content -replace 'from-yellow-400 to-yellow-500', 'from-warning to-warning'
$content = $content -replace 'from-gray-300 to-gray-400', 'from-border to-border'

# Update buttons
$content = $content -replace 'bg-emerald-600', 'bg-primary'
$content = $content -replace 'hover:bg-emerald-700', 'hover:bg-primary-dark'
$content = $content -replace 'bg-emerald-500', 'bg-primary'

# Update hover effects
$content = $content -replace 'hover:shadow-xl', 'hover:shadow-soft'
$content = $content -replace 'hover:shadow-2xl', 'hover:shadow-medium'
$content = $content -replace 'hover:scale-105', ''
$content = $content -replace 'scale-105', ''

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
