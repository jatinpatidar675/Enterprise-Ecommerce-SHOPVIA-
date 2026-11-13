# ================================================
# ShopVia - PowerShell Startup Script
# ================================================
# This script starts both backend and frontend
# Requirements: JDK 21, Node.js, and MySQL running
# ================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     ShopVia E-Commerce Platform - PowerShell Startup     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Check Maven
Write-Host "Checking Maven..." -ForegroundColor Yellow
if (Test-Path (Join-Path $PSScriptRoot "mvnw.cmd")) {
    Write-Host "✅ Maven wrapper found" -ForegroundColor Green
} else {
    Write-Host "❌ mvnw.cmd not found in the project directory." -ForegroundColor Red
    exit
}

Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    Write-Host "✅ Node.js found" -ForegroundColor Green
    node --version
} else {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit
}

Write-Host ""

 $localEnvPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $localEnvPath) {
    foreach ($line in Get-Content $localEnvPath) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
            $name = $matches[1]
            $value = $matches[2].Trim()
            if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET)) {
    $jwtBytes = New-Object byte[] 32
    $randomGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $randomGenerator.GetBytes($jwtBytes)
    $randomGenerator.Dispose()
    $env:JWT_SECRET = [Convert]::ToBase64String($jwtBytes)
    Write-Host "Generated a temporary local JWT key; existing sessions expire when the backend restarts." -ForegroundColor Yellow
} elseif ([System.Text.Encoding]::UTF8.GetByteCount($env:JWT_SECRET) -lt 32) {
    Write-Host "JWT_SECRET must be at least 32 UTF-8 bytes." -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrWhiteSpace($env:DB_URL)) {
    $env:DB_URL = "jdbc:mysql://localhost:3306/ecommerce_db"
}
if ([string]::IsNullOrWhiteSpace($env:DB_USERNAME)) {
    $env:DB_USERNAME = "root"
}
if ([string]::IsNullOrEmpty($env:DB_PASSWORD)) {
    $secureDbPassword = Read-Host "MySQL password for $($env:DB_USERNAME) (press Enter if none)" -AsSecureString
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureDbPassword)
    try {
        $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
        $secureDbPassword.Dispose()
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting ShopVia Backend and Frontend..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Backend startup
$backendPath = $PSScriptRoot
$frontendPath = Join-Path $PSScriptRoot "ecommerce-frontend"
Write-Host "🔧 Starting Backend..." -ForegroundColor Yellow
Write-Host "Backend will run on: http://localhost:8080" -ForegroundColor Green
Write-Host "Configure DB_URL, DB_USERNAME, and DB_PASSWORD in this shell if needed." -ForegroundColor Yellow

$backendCommand = "Set-Location -LiteralPath '$backendPath'; .\mvnw.cmd spring-boot:run"
Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoExit", "-Command", $backendCommand)

Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Green
$frontendCommand = "Set-Location -LiteralPath '$frontendPath'; if (-not (Test-Path 'node_modules')) { npm install }; npm run dev"
Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoExit", "-Command", $frontendCommand)

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ Startup Initiated!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📍 Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two terminal windows should open shortly:" -ForegroundColor Yellow
Write-Host "  - Terminal 1: Backend (Spring Boot)" -ForegroundColor Cyan
Write-Host "  - Terminal 2: Frontend (Vite Dev Server)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Wait for both to fully start before testing." -ForegroundColor Yellow
Write-Host ""
Write-Host "🔐 Default Test Credentials:" -ForegroundColor Green
Write-Host "  Customer: john@example.com / Test@123" -ForegroundColor Cyan
Write-Host "  Admin:    admin@shopvia.com / Test@123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Online payments are disabled unless Razorpay credentials are configured." -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Green
Write-Host "  See STARTUP_AND_TESTING.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit this window"
