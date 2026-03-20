#!/bin/bash
set -e

echo "Starting build process..."

# Install root dependencies
echo "Installing root dependencies..."
npm install --production=false

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Build completed successfully!"

# Verify build files exist
if [ -f "frontend/build/index.html" ]; then
    echo "✅ Frontend build files created successfully"
else
    echo "❌ Frontend build files missing!"
    exit 1
fi
