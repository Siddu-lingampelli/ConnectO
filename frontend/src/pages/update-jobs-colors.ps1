# Update Jobs.tsx colors to professional palette
$file = "Jobs.tsx"
$content = Get-Content $file -Raw

# Blue buttons to primary
$content = $content -replace 'bg-blue-600', 'bg-primary'
$content = $content -replace 'hover:bg-blue-700', 'hover:bg-primary-dark'
$content = $content -replace 'border-blue-600', 'border-primary'
$content = $content -replace 'text-blue-600', 'text-primary'
$content = $content -replace 'hover:bg-blue-50', 'hover:bg-primary/5'

# Blue badges to primary
$content = $content -replace 'bg-blue-100 text-blue-700', 'bg-primary/10 text-primary'
$content = $content -replace 'hover:bg-blue-200', 'hover:bg-primary/20'

# Gray borders and backgrounds
$content = $content -replace 'border-gray-300', 'border-border'
$content = $content -replace 'border-gray-200', 'border-border'
$content = $content -replace 'text-gray-700', 'text-text-primary'
$content = $content -replace 'text-gray-900', 'text-text-primary'
$content = $content -replace 'text-gray-600', 'text-text-secondary'
$content = $content -replace 'bg-gray-100', 'bg-surface'
$content = $content -replace 'hover:bg-gray-50', 'hover:bg-surface'
$content = $content -replace 'bg-gray-50', 'bg-surface'

# Text color for warnings (keep yellow as warning)
$content = $content -replace 'text-yellow-500', 'text-warning'
$content = $content -replace 'text-yellow-300', 'text-warning'

Set-Content $file $content -NoNewline
Write-Host "Updated $file with professional colors" -ForegroundColor Green
