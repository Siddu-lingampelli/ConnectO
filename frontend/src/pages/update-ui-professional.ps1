# PowerShell Script to Update All Pages to Professional UI
# Run this from: a:\DT project\SIH 18 try\Connnecto\final 4\frontend\src\pages

$pagesDir = "a:\DT project\SIH 18 try\Connnecto\final 4\frontend\src\pages"

# Color replacements
$colorReplacements = @{
    'from-\[#E3EFD3\]' = 'from-surface'
    'to-\[#F8FBF9\]' = 'to-background'
    'via-white' = 'via-background'
    'bg-gradient-to-br from-\[#E3EFD3\] via-white to-\[#F8FBF9\]' = 'bg-background'
    'bg-gradient-to-r from-\[#345635\] to-\[#6B8F71\]' = 'bg-primary'
    'bg-gradient-to-r from-\[#0D2B1D\] to-\[#345635\]' = 'bg-primary'
    'text-\[#0D2B1D\]' = 'text-text-primary'
    'text-\[#345635\]' = 'text-text-primary'
    'text-\[#6B8F71\]' = 'text-text-secondary'
    'text-\[#AEC3B0\]' = 'text-text-muted'
    'text-\[#E3EFD3\]' = 'text-white/90'
    'border-\[#AEC3B0\]' = 'border-border'
    'border-\[#345635\]' = 'border-primary'
    'bg-\[#E3EFD3\]' = 'bg-surface'
    'bg-\[#AEC3B0\]' = 'bg-surface'
    'bg-\[#345635\]' = 'bg-primary'
    'bg-\[#0D2B1D\]' = 'bg-primary-dark'
    'hover:bg-\[#6B8F71\]' = 'hover:bg-primary-dark'
    'max-w-\[1500px\]' = 'max-w-7xl'
    'text-gray-700' = 'text-text-secondary'
    'text-gray-600' = 'text-text-secondary'
    'text-gray-500' = 'text-text-muted'
    'border-2' = 'border'
    'shadow-lg' = 'shadow-soft'
    'hover:shadow-xl' = 'hover:shadow-medium'
}

# Remove emojis patterns
$emojiPattern = '(<div className="text-[^"]+">)[🎯💼🚀⭐👁️🤝⚡🌟💡📊🔥✨💪🎨🎉🏆📈🌍💬📱💻🌟👥🔔❤️🎯🔑🏅🎓🔗⚙️📝💰🎁🌈🚦🔒🏠🌐✅❌⏰📅🖥️📲🔍](</div>)'

# Files to update
$filesToUpdate = @(
    "AboutUs.tsx",
    "HowItWorks.tsx",
    "Contact.tsx",
    "PrivacyPolicy.tsx",
    "TermsOfService.tsx",
    "BrowseProviders.tsx",
    "Community.tsx",
    "Collaboration.tsx"
)

Write-Host "Starting Professional UI Update..." -ForegroundColor Green
Write-Host ""

foreach ($file in $filesToUpdate) {
    $filePath = Join-Path $pagesDir $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        # Backup
        $backupPath = $filePath -replace '\.tsx$', '.backup.tsx'
        if (-not (Test-Path $backupPath)) {
            Copy-Item $filePath $backupPath
            Write-Host "  ✓ Backed up to $($file -replace '\.tsx$', '.backup.tsx')" -ForegroundColor Gray
        }
        
        # Read content
        $content = Get-Content $filePath -Raw
        
        # Replace colors
        foreach ($old in $colorReplacements.Keys) {
            $new = $colorReplacements[$old]
            if ($content -match $old) {
                $content = $content -replace $old, $new
                Write-Host "  ✓ Replaced $old → $new" -ForegroundColor Gray
            }
        }
        
        # Remove emojis (replace with nothing)
        $content = $content -replace $emojiPattern, '$1$2'
        
        # Update max-width container patterns
        $content = $content -replace 'max-w-\[1500px\] mx-auto px-4 sm:px-6 lg:px-8', 'max-w-7xl mx-auto px-6'
        
        # Update shadow patterns
        $content = $content -replace 'shadow-2xl', 'shadow-large'
        
        # Update rounded patterns for consistency
        $content = $content -replace 'rounded-3xl', 'rounded-2xl'
        
        # Save
        Set-Content $filePath $content -NoNewline
        Write-Host "  ✓ Updated and saved" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "Update complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of changes:" -ForegroundColor Cyan
Write-Host "- Removed all emojis" -ForegroundColor White
Write-Host "- Updated color palette to professional scheme" -ForegroundColor White
Write-Host "- Standardized container widths to max-w-7xl" -ForegroundColor White
Write-Host "- Updated shadows to subtle variants" -ForegroundColor White
Write-Host "- Standardized border widths" -ForegroundColor White
Write-Host ""
Write-Host "Backups created with .backup.tsx extension" -ForegroundColor Yellow
