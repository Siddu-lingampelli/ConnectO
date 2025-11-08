# Clean up remaining old colors in OngoingJobs.tsx
$file = "OngoingJobs.tsx"
$content = Get-Content $file -Raw

# Replace specific color patterns
$content = $content -replace 'text-\[#0D2B1D\]', 'text-text-primary'
$content = $content -replace 'from-\[#0D2B1D\]', 'from-primary'
$content = $content -replace 'via-\[#345635\]', 'via-primary'
$content = $content -replace 'to-\[#6B8F71\]', 'to-primary'
$content = $content -replace 'text-\[#6B8F71\]', 'text-text-secondary'
$content = $content -replace 'border-\[#AEC3B0\]', 'border-border'
$content = $content -replace 'hover:border-\[#6B8F71\]', 'hover:border-primary/30'
$content = $content -replace 'from-\[#E3EFD3\]', 'from-surface'
$content = $content -replace 'border-2 border-', 'border border-'
$content = $content -replace ' hover:scale-105', ''
$content = $content -replace 'duration-300', 'duration-200'

Set-Content $file $content -NoNewline
Write-Host "Cleaned up OngoingJobs.tsx colors" -ForegroundColor Green
