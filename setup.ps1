# PowerShell script to set up project folder structure for College Lab Portal

Write-Host "Creating folder structure for College Lab Portal..." -ForegroundColor Green

# Create main directories
$directories = @(
    "config",
    "middleware",
    "models",
    "public",
    "public/css",
    "public/js",
    "routes",
    "views",
    "views/layouts",
    "views/student",
    "views/teacher"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir" -ForegroundColor Cyan
    } else {
        Write-Host "Directory already exists: $dir" -ForegroundColor Yellow
    }
}

# Create main files
$files = @{
    "index.js" = "Index file"
    "config/database.js" = "Database configuration"
    "config/auth.js" = "Authentication utilities"
    "middleware/auth.js" = "Authentication middleware"
    "models/User.js" = "User model"
    "models/Attendance.js" = "Attendance model"
    "models/Lab.js" = "Lab model"
    "models/LabSession.js" = "Lab session model"
    "public/css/style.css" = "Main CSS stylesheet"
    "public/js/main.js" = "Main JavaScript file"
    "public/js/auth.js" = "Authentication JavaScript"
    "public/js/student.js" = "Student-specific JavaScript"
    "public/js/teacher.js" = "Teacher-specific JavaScript"
    "routes/auth.js" = "Authentication routes"
    "routes/student.js" = "Student routes"
    "routes/teacher.js" = "Teacher routes"
    "views/layouts/main.handlebars" = "Main layout template"
    "views/auth.handlebars" = "Login/register page"
    "views/student/dashboard.handlebars" = "Student dashboard"
    "views/student/attendance.handlebars" = "Student attendance page"
    "views/student/profile.handlebars" = "Student profile page"
    "views/teacher/dashboard.handlebars" = "Teacher dashboard"
    "views/teacher/students.handlebars" = "Students management"
    "views/teacher/student-details.handlebars" = "Student details view"
    "views/teacher/attendance.handlebars" = "Attendance management"
    "views/teacher/labs.handlebars" = "Labs management"
    "views/teacher/lab-sessions.handlebars" = "Lab sessions management"
    ".env.example" = "Environment variables example"
    "setup.sql" = "Database setup script"
}

foreach ($file in $files.Keys) {
    if (-not (Test-Path $file)) {
        New-Item -ItemType File -Path $file -Force | Out-Null
        Write-Host "Created file: $file - $($files[$file])" -ForegroundColor Cyan
    } else {
        Write-Host "File already exists: $file" -ForegroundColor Yellow
    }
}

# Create .env file with sample data
$envContent = @"
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=12345678
DB_NAME=college_lab_portal

# Server Configuration
PORT=5000
SESSION_SECRET=college_lab_portal_secret_key_change_this_in_production
"@

if (-not (Test-Path ".env")) {
    Set-Content -Path ".env" -Value $envContent
    Write-Host "Created .env file with sample configuration" -ForegroundColor Green
} else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

Write-Host "`nFolder structure created successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Magenta
Write-Host "1. Install required npm packages:" -ForegroundColor White
Write-Host "   npm install express express-handlebars express-session express-mysql-session mysql2 bcryptjs dotenv body-parser" -ForegroundColor Gray
Write-Host "2. Update the .env file with your database credentials" -ForegroundColor White
Write-Host "3. Set up the database by running the SQL script:" -ForegroundColor White
Write-Host "   mysql -u [username] -p < setup.sql" -ForegroundColor Gray
Write-Host "4. Start the server:" -ForegroundColor White
Write-Host "   node index.js" -ForegroundColor Gray
Write-Host "`nDefault login credentials:" -ForegroundColor Magenta
Write-Host "Teacher: email=teacher@example.com, password=password123" -ForegroundColor White
Write-Host "Student: email=student@example.com, password=password123" -ForegroundColor White
