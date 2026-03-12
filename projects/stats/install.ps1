# EDIT THIS: Replace with your GitHub username and repo name
$githubUser = "Akshay-86"
$repoName = "spicetify-apps"
$branch = "main"

$customAppsDir = "$env:APPDATA\spicetify\CustomApps"
$extensionsDir = "$env:APPDATA\spicetify\Extensions"
$statsDir = "$customAppsDir\stats"

Write-Host "Downloading and Installing Fixed Spicetify Stats..." -ForegroundColor Cyan

# Create folders
If (!(Test-Path -Path $statsDir)) { New-Item -ItemType Directory -Path $statsDir -Force }
If (!(Test-Path -Path $extensionsDir)) { New-Item -ItemType Directory -Path $extensionsDir -Force }

# Download files from your GitHub 'dist' folder
$baseUrl = "https://raw.githubusercontent.com/$githubUser/$repoName/$branch/dist"

Invoke-WebRequest -Uri "$baseUrl/index.js" -OutFile "$statsDir\index.js"
Invoke-WebRequest -Uri "$baseUrl/index.css" -OutFile "$statsDir\index.css"
Invoke-WebRequest -Uri "$baseUrl/manifest.json" -OutFile "$statsDir\manifest.json"
Invoke-WebRequest -Uri "$baseUrl/extension.js" -OutFile "$extensionsDir\stats_extension.js"

# Apply Spicetify config
spicetify config custom_apps stats extensions stats_extension.js
spicetify apply

Write-Host "Success! Stats installed from GitHub." -ForegroundColor Green
