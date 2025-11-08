# Final update for Community.tsx
$file = "Community.tsx"
$content = Get-Content $file -Raw

# Update emerald colors to primary
$content = $content -replace 'bg-emerald-600', 'bg-primary'
$content = $content -replace 'hover:bg-emerald-700', 'hover:bg-primary-dark'
$content = $content -replace 'bg-emerald-500', 'bg-primary'
$content = $content -replace 'text-emerald-700', 'text-primary'
$content = $content -replace 'text-emerald-600', 'text-primary'
$content = $content -replace 'bg-emerald-100', 'bg-primary/10'
$content = $content -replace 'bg-emerald-50', 'bg-primary/5'
$content = $content -replace 'from-emerald-50 to-teal-50', 'from-surface to-surface'
$content = $content -replace 'from-emerald-500 via-emerald-600 to-teal-600', 'from-primary via-primary to-primary-dark'

# Update blue gradients to primary
$content = $content -replace 'from-blue-500 to-blue-600', 'from-primary to-primary-dark'

# Update gray gradients
$content = $content -replace 'from-gray-500 to-gray-600', 'from-border to-border'

# Update rounded corners
$content = $content -replace 'rounded-lg(?!-)', 'rounded-xl'

# Update font weights
$content = $content -replace 'font-bold', 'font-semibold'

# Update transitions
$content = $content -replace 'duration-300', 'duration-200'

Set-Content $file $content -NoNewline
Write-Host "Final update for $file completed" -ForegroundColor Green
