#!/bin/bash

# EDIT THIS: Replace with your GitHub username and repo name
GITHUB_USER="Akshay-86"
REPO_NAME="spicetify-apps"
BRANCH="main"

SPICETIFY_DIR="$HOME/.config/spicetify"
CUSTOM_APPS_DIR="$SPICETIFY_DIR/CustomApps"
EXTENSIONS_DIR="$SPICETIFY_DIR/Extensions"
STATS_DIR="$CUSTOM_APPS_DIR/stats"

echo "Downloading and Installing Fixed Spicetify Stats..."

# Create folders
mkdir -p "$STATS_DIR"
mkdir -p "$EXTENSIONS_DIR"

# Download files from your GitHub 'dist' folder
BASE_URL="https://raw.githubusercontent.com/$GITHUB_USER/$REPO_NAME/$BRANCH/dist"

curl -fsSL "$BASE_URL/index.js" -o "$STATS_DIR/index.js"
curl -fsSL "$BASE_URL/index.css" -o "$STATS_DIR/index.css"
curl -fsSL "$BASE_URL/manifest.json" -o "$STATS_DIR/manifest.json"
curl -fsSL "$BASE_URL/extension.js" -o "$EXTENSIONS_DIR/stats_extension.js"

# Apply Spicetify config
spicetify config custom_apps stats extensions stats_extension.js
spicetify apply

echo "Success! Stats installed from GitHub."
