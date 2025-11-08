# Final cleanup for Leaderboard.tsx - remove emojis and remaining old colors
$file = "Leaderboard.tsx"
$content = Get-Content $file -Raw

# Remove emoji character patterns and old hex colors
$content = $content -replace 'border-\[#E3EFD3\]', 'border-border'
$content = $content -replace 'from-\[#345635\] to-\[#6B8F71\]', 'from-primary to-primary-dark'
$content = $content -replace 'from-\[#6B8F71\] to-\[#AEC3B0\]', 'from-primary/70 to-primary/40'
$content = $content -replace 'from-\[#AEC3B0\] to-\[#E3EFD3\]', 'from-surface to-surface'
$content = $content -replace 'from-\[#0D2B1D\] to-\[#345635\]', 'from-primary to-primary'
$content = $content -replace 'group-hover:scale-110 transition-transform', ''

# Simplify transition classes
$content = $content -replace 'hover:shadow-soft  transition', 'hover:shadow-soft transition'

Set-Content $file $content -NoNewline
Write-Host "Final cleanup for $file completed" -ForegroundColor Green
