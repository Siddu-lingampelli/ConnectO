# Safe Page Enhancement Script - Adds full-width layouts only
# This is a safer approach that just updates container classes

$exclude = @('Dashboard.tsx', 'Community.tsx', 'Messages.tsx', 'Landing.tsx', 'Jobs.tsx', 'Dashboard.backup.tsx')
$files = Get-ChildItem -Path . -Filter "*.tsx" | Where-Object { $exclude -notcontains $_.Name }

$count = 0
$errors = @()

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        $modified = $false
        
        # Only do safe replacements - container to full-width layout
        # Pattern 1: Standard container pattern
        if ($content -match '<main className="flex-1 container mx-auto px-4 py-\d+">' -and 
            $content -notmatch 'max-w-\[1500px\]') {
            
            $content = $content -replace '<main className="flex-1 container mx-auto px-4 py-(\d+)">', '<main className="flex-1 w-full">`n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-$1">'
            
            # Find the closing </main> and add closing </div> before it
            $content = $content -replace '(\s+)</main>', '$1</div>$1</main>'
            
            $modified = $true
        }
        
        # Pattern 2: Container with different spacing
        if ($content -match '<main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-\d+">' -and 
            $content -notmatch 'max-w-\[1500px\]') {
            
            $content = $content -replace '<main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-(\d+)">', '<main className="flex-1 w-full">`n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-$1">'
            
            $content = $content -replace '(\s+)</main>', '$1</div>$1</main>'
            
            $modified = $true
        }
        
        if ($modified) {
            # Verify the change didn't break anything obvious
            $openDivs = ([regex]::Matches($content, '<div')).Count
            $closeDivs = ([regex]::Matches($content, '</div>')).Count
            $openMains = ([regex]::Matches($content, '<main')).Count
            $closeMains = ([regex]::Matches($content, '</main>')).Count
            
            if (($openDivs -eq $closeDivs) -and ($openMains -eq $closeMains)) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $count++
                Write-Host "Updated layout: $($file.Name)" -ForegroundColor Green
            } else {
                Write-Host "Skipped (structure mismatch): $($file.Name)" -ForegroundColor Yellow
                $errors += $file.Name
            }
        }
    }
    catch {
        Write-Host "Error processing: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $errors += $file.Name
    }
}

Write-Host "`nCompleted! Updated $count pages with full-width layouts."

if ($errors.Count -gt 0) {
    Write-Host "`nFiles that need manual review: $($errors.Count)" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
