#!/bin/bash

# Exit if any command fails
set -e 

echo "Building Frontend..."
cd front-end
npm install
npm run build
cd ..

echo "Building Backend..."
cd back-end
go build
cd ..

echo "Build completed successfully!"
