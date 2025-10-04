#!/bin/bash

echo "🚀 Setting up Lectra - AI-Powered Lecture Assistant"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB first."
    echo "   You can use MongoDB Atlas (cloud) or install locally."
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "📁 Creating necessary directories..."
mkdir -p backend/uploads backend/pdfs

echo "⚙️  Setting up environment files..."

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please update backend/.env with your actual API keys and database URL"
else
    echo "✅ Backend .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your API keys:"
echo "   - MONGODB_URI (MongoDB connection string)"
echo "   - GEMINI_API_KEY (Google Gemini API key)"
echo "   - GOOGLE_PROJECT_ID (Google Cloud project ID)"
echo "   - GOOGLE_APPLICATION_CREDENTIALS (path to service account key)"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Or start them separately:"
echo "   Backend: npm run server"
echo "   Frontend: npm run client"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo ""
echo "📚 For detailed setup instructions, see README.md"
