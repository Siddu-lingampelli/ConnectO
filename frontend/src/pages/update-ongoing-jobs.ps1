# Update OngoingJobs.tsx to professional design
$file = "OngoingJobs.tsx"
$content = Get-Content $file -Raw

# Update container and layout
$content = $content -replace 'bg-gradient-to-br from-\[#E3EFD3\] via-white to-\[#F8FBF9\]', 'bg-background'
$content = $content -replace 'max-w-\[1500px\]', 'max-w-7xl'
$content = $content -replace 'px-4 sm:px-6 lg:px-8 py-8', 'px-6 py-24'

# Update text colors
$content = $content -replace 'text-gray-900', 'text-text-primary'
$content = $content -replace 'text-gray-700', 'text-text-primary'
$content = $content -replace 'text-gray-600', 'text-text-secondary'
$content = $content -replace 'text-gray-500', 'text-text-muted'

# Update backgrounds
$content = $content -replace 'bg-gray-100', 'bg-surface'
$content = $content -replace 'bg-gray-50', 'bg-surface'
$content = $content -replace 'hover:bg-gray-50', 'hover:bg-surface'

# Update borders
$content = $content -replace 'border-gray-200', 'border-border'
$content = $content -replace 'border-gray-300', 'border-border'

# Update emerald colors to primary
$content = $content -replace 'from-\[#345635\] to-\[#6B8F71\]', 'from-primary to-primary-dark'
$content = $content -replace 'from-\[#6B8F71\] to-\[#AEC3B0\]', 'from-primary/70 to-primary/40'
$content = $content -replace 'from-\[#E3EFD3\] to-\[#AEC3B0\]', 'from-primary/10 to-primary/20'
$content = $content -replace 'text-\[#345635\]', 'text-primary'

# Update orange to warning
$content = $content -replace 'bg-orange-100', 'bg-warning/10'
$content = $content -replace 'text-orange-800', 'text-warning'

# Update buttons
$content = $content -replace 'bg-emerald-600', 'bg-primary'
$content = $content -replace 'hover:bg-emerald-700', 'hover:bg-primary-dark'
$content = $content -replace 'bg-blue-600', 'bg-primary'
$content = $content -replace 'hover:bg-blue-700', 'hover:bg-primary-dark'
$content = $content -replace 'border-blue-300', 'border-primary/30'
$content = $content -replace 'text-blue-600', 'text-primary'

# Update rounded corners
$content = $content -replace 'rounded-lg(?!-)', 'rounded-xl'

# Update shadows
$content = $content -replace 'shadow-lg', 'shadow-soft'
$content = $content -replace 'shadow-xl', 'shadow-medium'

# Update font weights
$content = $content -replace 'font-bold', 'font-semibold'

Set-Content $file $content -NoNewline
Write-Host "Updated $file with professional design" -ForegroundColor Green
