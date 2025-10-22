# CreatorPulse Platform Diagnostic Script - PowerShell Version
# Run this to understand what's actually built vs what was claimed

Write-Host "🔍 CreatorPulse Platform Diagnostic Report" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

# Check Node and npm versions
Write-Host "📦 Environment Check:" -ForegroundColor Green
Write-Host "Node version: $(node --version)"
try {
    Write-Host "npm version: $(npm --version 2>$null)"
} catch {
    Write-Host "npm version: ERROR - Cannot execute npm"
}
try {
    Write-Host "Firebase CLI: $(npx firebase --version 2>$null)"
} catch {
    Write-Host "Firebase CLI: NOT INSTALLED or ERROR"
}
Write-Host ""

# Check project structure
Write-Host "📁 Project Structure:" -ForegroundColor Green
Write-Host "Current directory: $(Get-Location)"
Write-Host ""

# Critical directories
Write-Host "Checking critical directories..."
if (Test-Path "functions") { Write-Host "✅ functions/ exists" -ForegroundColor Green } else { Write-Host "❌ functions/ MISSING" -ForegroundColor Red }
if (Test-Path "src") { Write-Host "✅ src/ exists" -ForegroundColor Green } else { Write-Host "❌ src/ MISSING" -ForegroundColor Red }
if (Test-Path "app") { Write-Host "✅ app/ exists" -ForegroundColor Green } else { Write-Host "❌ app/ MISSING" -ForegroundColor Red }
if (Test-Path "public") { Write-Host "✅ public/ exists" -ForegroundColor Green } else { Write-Host "❌ public/ MISSING" -ForegroundColor Red }
if (Test-Path "firebase.json") { Write-Host "✅ firebase.json exists" -ForegroundColor Green } else { Write-Host "❌ firebase.json MISSING" -ForegroundColor Red }
if (Test-Path ".firebaserc") { Write-Host "✅ .firebaserc exists" -ForegroundColor Green } else { Write-Host "❌ .firebaserc MISSING" -ForegroundColor Red }
if (Test-Path "package.json") { Write-Host "✅ package.json exists" -ForegroundColor Green } else { Write-Host "❌ package.json MISSING" -ForegroundColor Red }
Write-Host ""

# Check if functions directory has actual code
if (Test-Path "functions") {
    Write-Host "📂 Functions Directory Contents:" -ForegroundColor Green
    Get-ChildItem "functions" | Format-Table -AutoSize
    Write-Host ""
    
    if (Test-Path "functions/src") {
        Write-Host "📄 Functions Source Files:" -ForegroundColor Green
        $functionFiles = Get-ChildItem "functions/src" -Recurse -Include "*.js","*.ts" | Select-Object -First 20
        $functionFiles | ForEach-Object { Write-Host $_.FullName.Replace((Get-Location), ".") }
        Write-Host ""
        
        # Count actual function files
        $functionCount = (Get-ChildItem "functions/src" -Recurse -Include "*.js","*.ts" | Measure-Object).Count
        Write-Host "Total function files found: $functionCount"
        Write-Host "(Claimed: 39 functions)" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "⚠️  functions/src/ directory not found" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "❌ functions/ directory not found" -ForegroundColor Red
}

# Check environment variables
Write-Host "🔐 Environment Variables Check:" -ForegroundColor Green
if (Test-Path ".env") { Write-Host "✅ .env exists" -ForegroundColor Green } else { Write-Host "❌ .env MISSING" -ForegroundColor Red }
if (Test-Path ".env.local") { Write-Host "✅ .env.local exists" -ForegroundColor Green } else { Write-Host "❌ .env.local MISSING" -ForegroundColor Red }

if (Test-Path ".env.local") {
    Write-Host ""
    Write-Host "Environment variables (values hidden):"
    Get-Content ".env.local" | Where-Object { $_ -match "=" -and $_ -notmatch "^#" } | ForEach-Object { 
        $parts = $_.Split('=', 2)
        Write-Host "$($parts[0])=***"
    } | Select-Object -First 10
}
Write-Host ""

# Check running processes
Write-Host "🚀 Running Services:" -ForegroundColor Green
Write-Host "Checking ports..."

function Test-Port {
    param($Port, $Service)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ Port $Port ($Service) - RUNNING" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Port $Port ($Service) - NOT RUNNING" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Port $Port ($Service) - NOT RUNNING" -ForegroundColor Red
        return $false
    }
}

$port3001 = Test-Port 3001 "Frontend (Next.js)"
$port4000 = Test-Port 4000 "Firebase Emulator UI"
$port5001 = Test-Port 5001 "Firebase Functions"
$port8080 = Test-Port 8080 "Firestore Emulator"
$port9099 = Test-Port 9099 "Auth Emulator"
Write-Host ""

# Test API endpoints if running
Write-Host "🌐 API Connectivity Tests:" -ForegroundColor Green

function Test-Endpoint {
    param($Url, $Name)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $Name - Accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        if ($_.Exception.Message -match "Unable to connect") {
            Write-Host "❌ $Name - Connection refused" -ForegroundColor Red
        } else {
            Write-Host "⚠️  $Name - Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        return $false
    }
}

$frontendOK = Test-Endpoint "http://localhost:3001" "Frontend Homepage"
$emulatorOK = Test-Endpoint "http://localhost:4000" "Firebase Emulator UI"
$apiOK = Test-Endpoint "http://localhost:5001/demo-project/us-central1/healthCheck" "API Health Check"
Write-Host ""

# Check Firebase configuration
if (Test-Path "firebase.json") {
    Write-Host "⚙️  Firebase Configuration:" -ForegroundColor Green
    Write-Host "Configured services:"
    $firebaseConfig = Get-Content "firebase.json" | ConvertFrom-Json
    $firebaseConfig.PSObject.Properties.Name | ForEach-Object { Write-Host "  - $_" }
    Write-Host ""
}

# Package dependencies
Write-Host "📦 Installed Dependencies:" -ForegroundColor Green
if (Test-Path "package.json") {
    Write-Host "Main project dependencies:"
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.dependencies) {
        $packageJson.dependencies.PSObject.Properties | Select-Object -First 10 | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Value)"
        }
    }
    Write-Host ""
}

if (Test-Path "functions/package.json") {
    Write-Host "Functions dependencies:"
    $functionsPackageJson = Get-Content "functions/package.json" | ConvertFrom-Json
    if ($functionsPackageJson.dependencies) {
        $functionsPackageJson.dependencies.PSObject.Properties | Select-Object -First 10 | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Value)"
        }
    }
    Write-Host ""
}

# Summary
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "📊 SUMMARY" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host ""

# Determine what to do next
if (!(Test-Path "functions")) {
    Write-Host "❌ CRITICAL: Backend (functions/) not found" -ForegroundColor Red
    Write-Host "   Action: Create backend structure using TDD as reference" -ForegroundColor Yellow
} elseif (!$port5001) {
    Write-Host "⚠️  Backend exists but not running" -ForegroundColor Yellow
    Write-Host "   Action: Run 'npx firebase emulators:start' to start backend" -ForegroundColor Cyan
} else {
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Action: Proceed with testing using evaluation protocol" -ForegroundColor Cyan
}
Write-Host ""

if (!$port3001) {
    Write-Host "⚠️  Frontend not running" -ForegroundColor Yellow
    Write-Host "   Action: Run 'npm run dev' to start frontend" -ForegroundColor Cyan
} else {
    Write-Host "✅ Frontend is running!" -ForegroundColor Green
}
Write-Host ""

# Final status
Write-Host "🎯 CURRENT SYSTEM STATUS:" -ForegroundColor Magenta
Write-Host "Frontend: $(if($frontendOK){'✅ RUNNING'}else{'❌ DOWN'})"
Write-Host "Firebase Emulators: $(if($emulatorOK){'✅ RUNNING'}else{'❌ DOWN'})"
Write-Host "Backend API: $(if($apiOK){'✅ RUNNING'}else{'❌ DOWN'})"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Run completed: $(Get-Date)" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Yellow