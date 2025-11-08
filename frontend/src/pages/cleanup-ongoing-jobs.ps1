# Clean up remaining old colors and emojis in OngoingJobs.tsx
$file = "OngoingJobs.tsx"
$content = Get-Content $file -Raw

# Remove all emojis from labels
$content = $content -replace '⏳ ', ''
$content = $content -replace '🔨 ', ''
$content = $content -replace '✅ ', ''
$content = $content -replace '💰 ', ''
$content = $content -replace '💳 ', ''
$content = $content -replace '↩️ ', ''
$content = $content -replace '⚠️ ', ''
$content = $content -replace '❌ ', ''
$content = $content -replace '📊 ', ''
$content = $content -replace '💼 ', ''
$content = $content -replace '🚫 ', ''

# Replace specific hex colors with professional palette
$content = $content -replace '\[#0D2B1D\]', 'text-primary'
$content = $content -replace '\[#345635\]', 'primary'
$content = $content -replace '\[#6B8F71\]', 'primary'
$content = $content -replace '\[#AEC3B0\]', 'border'
$content = $content -replace '\[#E3EFD3\]', 'surface'
$content = $content -replace 'text-primary mb', 'text-text-primary mb'
$content = $content -replace 'text-\[#6B8F71\]', 'text-text-secondary'

# Fix borders
$content = $content -replace 'border-2 border-border', 'border border-border'
$content = $content -replace 'hover:border-\[#6B8F71\]', 'hover:border-primary/30'

# Remove hover:scale-105
$content = $content -replace ' hover:scale-105', ''

# Fix gradient backgrounds to solid
$content = $content -replace 'bg-gradient-to-br from-surface to-white', 'bg-surface'
$content = $content -replace 'bg-gradient-to-br from-primary via-primary to-primary', 'bg-primary'

Set-Content $file $content -NoNewline
Write-Host "Cleaned up $file - removed emojis and fixed colors" -ForegroundColor Green
