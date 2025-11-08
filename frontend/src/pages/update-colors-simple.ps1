# PowerShell Script to Update Pages to Professional UI - Simple Version
# Run from: a:\DT project\SIH 18 try\Connnecto\final 4\frontend\src\pages

$ErrorActionPreference = 'Continue'

# Files to update
$files = @(
    "AboutUs.tsx",
    "HowItWorks.tsx",
    "Contact.tsx",
    "PrivacyPolicy.tsx",
    "TermsOfService.tsx",
    "BrowseProviders.tsx",
    "Community.tsx",
    "Collaboration.tsx",
    "FindNearbyProviders.tsx"
)

Write-Host "Starting UI Update..." -ForegroundColor Green

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "`nProcessing: $file" -ForegroundColor Yellow
        
        # Backup
        $backup = $file -replace '\.tsx$', '.oldui.tsx'
        if (-not (Test-Path $backup)) {
            Copy-Item $file $backup
            Write-Host "  Backed up" -ForegroundColor Gray
        }
        
        $content = Get-Content $file -Raw
        
        # Replace color classes
        $content = $content -replace 'bg-gradient-to-br from-\[#E3EFD3\] via-white to-\[#F8FBF9\]', 'bg-background'
        $content = $content -replace 'bg-gradient-to-r from-\[#345635\] to-\[#6B8F71\]', 'bg-primary'
        $content = $content -replace 'bg-gradient-to-r from-\[#0D2B1D\] to-\[#345635\]', 'bg-primary'
        $content = $content -replace 'text-\[#0D2B1D\]', 'text-text-primary'
        $content = $content -replace 'text-\[#345635\]', 'text-text-primary'
        $content = $content -replace 'text-\[#6B8F71\]', 'text-text-secondary'
        $content = $content -replace 'text-\[#AEC3B0\]', 'text-text-muted'
        $content = $content -replace 'text-\[#E3EFD3\]', 'text-white/90'
        $content = $content -replace 'border-2 border-\[#AEC3B0\]', 'border border-border'
        $content = $content -replace 'border-2 border-\[#345635\]', 'border border-primary'
        $content = $content -replace 'bg-\[#E3EFD3\]', 'bg-surface'
        $content = $content -replace 'bg-\[#345635\]', 'bg-primary'
        $content = $content -replace 'bg-\[#0D2B1D\]', 'bg-primary-dark'
        $content = $content -replace 'max-w-\[1500px\]', 'max-w-7xl'
        $content = $content -replace 'text-gray-700', 'text-text-secondary'
        $content = $content -replace 'text-gray-600', 'text-text-secondary'
        $content = $content -replace 'shadow-lg', 'shadow-soft'
        $content = $content -replace 'hover:shadow-xl', 'hover:shadow-medium'
        $content = $content -replace 'rounded-3xl', 'rounded-2xl'
        
        # Remove specific emoji divs
        $content = $content -replace '<div className="text-4xl mb-4">[^<]+</div>', '<div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-6"><svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>'
        $content = $content -replace '<div className="text-3xl">[^<]+</div>', ''
        $content = $content -replace '<div className="text-4xl">[^<]+</div>', ''
        
        Set-Content $file $content -NoNewline
        Write-Host "  Updated" -ForegroundColor Green
    }
}

Write-Host "`nDone!" -ForegroundColor Green
