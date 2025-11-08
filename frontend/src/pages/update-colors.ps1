$exclude = @('Dashboard.tsx', 'Community.tsx', 'Landing.tsx', 'Jobs.tsx')
$files = Get-ChildItem -Path . -Filter "*.tsx" | Where-Object { $exclude -notcontains $_.Name }

$replacements = @{
    'bg-blue-600' = 'bg-emerald-600'
    'hover:bg-blue-700' = 'hover:bg-emerald-700'
    'text-blue-600' = 'text-emerald-600'
    'border-blue-600' = 'border-emerald-600'
    'ring-blue-500' = 'ring-emerald-500'
    'from-blue-500' = 'from-emerald-500'
    'to-blue-600' = 'to-emerald-600'
    'focus:ring-blue-500' = 'focus:ring-emerald-500'
    'bg-blue-50' = 'bg-emerald-50'
    'text-blue-700' = 'text-emerald-700'
    'bg-indigo-600' = 'bg-emerald-600'
    'hover:bg-indigo-700' = 'hover:bg-emerald-700'
    'text-indigo-600' = 'text-emerald-600'
    'from-indigo-600' = 'from-emerald-600'
    'to-indigo-700' = 'to-emerald-700'
    'bg-purple-100' = 'bg-emerald-100'
    'text-purple-700' = 'text-emerald-700'
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    foreach ($find in $replacements.Keys) {
        $replace = $replacements[$find]
        $content = $content -replace $find, $replace
    }
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $($file.Name)"
}

Write-Host "Completed! Updated $($files.Count) files."
