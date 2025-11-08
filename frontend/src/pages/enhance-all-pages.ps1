# Enhanced Page Redesign Script - Full Fiverr Style for ALL Pages
# Adds: Full-width layout, Framer Motion animations, Emerald theme enhancements

$exclude = @('Dashboard.tsx', 'Community.tsx', 'Messages.tsx', 'Landing.tsx', 'Jobs.tsx', 'Dashboard.backup.tsx')
$files = Get-ChildItem -Path . -Filter "*.tsx" | Where-Object { $exclude -notcontains $_.Name }

$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # 1. Replace standard container with full-width layout
    if ($content -match 'className="flex-1 container mx-auto px-4') {
        $content = $content -replace 'className="flex-1 container mx-auto px-4', 'className="flex-1 w-full">\n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8'
        
        # Add closing div before </main>
        $content = $content -replace '(\s*)</main>', '$1</div>$1</main>'
        $modified = $true
    }
    
    # 2. Add motion animations to page headers with gradient backgrounds
    if ($content -match 'className="([^"]*bg-gradient-to-r[^"]*)"') {
        # Wrap gradient headers in motion.div if not already wrapped
        if ($content -notmatch '<motion\.div[^>]*className="[^"]*bg-gradient-to-r') {
            $content = $content -replace '(<div\s+className="[^"]*bg-gradient-to-r[^"]*">)', '<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} $1'
            
            # Find and close the motion.div (look for the matching closing div)
            $content = $content -replace '(bg-gradient-to-r[^>]*>[\s\S]*?)(</div>)(\s*<div)', '$1</motion.div>$3<div'
            $modified = $true
        }
    }
    
    # 3. Add hover animations to buttons that don't have them
    if ($content -match 'className="[^"]*px-\d+\s+py-\d+[^"]*bg-emerald-600[^"]*"') {
        # Convert regular buttons to motion.button with hover effects
        $content = $content -replace '(<button\s+)((?:[^>]*)className="[^"]*bg-emerald-600[^"]*">)', '<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} $2'
        $content = $content -replace '(</button>)(\s*<!--.*emerald.*-->)', '</motion.button>$2'
        $modified = $true
    }
    
    # 4. Convert static divs with rounded corners to motion.div with entrance animations
    if ($content -match '<div className="[^"]*rounded-(?:lg|xl|2xl)[^"]*shadow[^"]*">') {
        $content = $content -replace '(<div)(className="[^"]*rounded-(?:lg|xl|2xl)[^"]*shadow[^"]*">)', '<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} $2'
        $modified = $true
    }
    
    # 5. Add stagger animations to grid items
    if ($content -match 'className="[^"]*grid[^"]*gap-\d+[^"]*"') {
        # Add motion container for grid
        $content = $content -replace '(<div\s+className="[^"]*grid[^"]*">)', '<motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} $1'
        $modified = $true
    }
    
    # 6. Enhanced emerald gradients for headers
    $content = $content -replace 'from-gray-900 via-indigo-900 to-blue-900', 'from-emerald-500 via-emerald-600 to-teal-600'
    $content = $content -replace 'from-\[#1e3a3a\] to-\[#2e5266\]', 'from-emerald-500 via-emerald-600 to-teal-600'
    
    # 7. Add glassmorphism to stat cards
    $content = $content -replace 'bg-white/20 backdrop-blur-sm', 'bg-white/20 backdrop-blur-sm border border-white/30'
    
    # 8. Enhance loading states with emerald spinner
    if ($content -match 'border-blue-600') {
        $content = $content -replace 'border-blue-600', 'border-emerald-600'
        $modified = $true
    }
    
    # 9. Add hover lift to cards
    if ($content -match 'className="[^"]*bg-white[^"]*rounded-[^"]*shadow-sm[^"]*"') {
        $content = $content -replace '(<div)(className="[^"]*bg-white[^"]*rounded-[^"]*shadow-sm[^"]*">)', '<motion.div whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} $2'
        $modified = $true
    }
    
    # 10. Add scale animation to icons
    if ($content -match 'className="[^"]*w-\d+\s+h-\d+[^"]*bg-gradient-to-br[^"]*rounded[^"]*"') {
        $content = $content -replace '(<div)(className="[^"]*w-\d+\s+h-\d+[^"]*bg-gradient-to-br[^"]*rounded[^"]*">)', '<motion.div whileHover={{ scale: 1.05, rotate: 5 }} $2'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "Enhanced: $($file.Name)"
    }
}

Write-Host "`nCompleted! Enhanced $count pages with full Fiverr-style animations and layouts."
