# Lectra - AI-Powered Lecture Assistant

A real-time AI-powered lecture assistant that captures teacher voice, transcribes it, generates clean notes, and provides interactive polling features.

## 🚀 Features

- **Real-time Voice Transcription**: Capture teacher's voice and transcribe using Google Cloud STT
- **AI-Powered Note Generation**: Generate clean bullet-point notes using Gemini API
- **Live Blackboard**: Real-time HTML + Tailwind frontend for students
- **Voice Commands**: Support for teacher voice commands (e.g., "AI open a new slide")
- **Interactive Polling**: Live quiz/poll creation with student participation
- **PDF Generation**: Automatic lecture summary and quiz generation
- **Role-based Access**: Separate login flows for students and teachers

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB
- **AI Services**: Google Cloud STT + Gemini API
- **PDF Generation**: Puppeteer
- **Authentication**: JWT

## 📋 Prerequisites

Before setting up the project, make sure you have:

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **Google Cloud Account** (for Speech-to-Text API)
4. **Google Gemini API Key**

## ⚡ Quick Setup

1. **Clone and setup:**

```bash
git clone <your-repo-url>
cd Lectra
chmod +x setup.sh
./setup.sh
```

2. **Configure environment variables:**

   - Copy `backend/env.example` to `backend/.env`
   - Update the following values in `backend/.env`:
     ```env
     MONGODB_URI=mongodb://localhost:27017/lectra
     GEMINI_API_KEY=your-gemini-api-key-here
     GOOGLE_PROJECT_ID=your-google-cloud-project-id
     GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
     JWT_SECRET=your-super-secret-jwt-key
     ```

3. **Start the application:**

```bash
npm run dev
```

## 🔧 Detailed Setup

### 1. Google Cloud Speech-to-Text Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Speech-to-Text API
4. Create a service account and download the JSON key
5. Set the path to the key file in `GOOGLE_APPLICATION_CREDENTIALS`

### 2. Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file

### 3. MongoDB Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb    # Ubuntu

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI`

### 4. Install Dependencies

```bash
# Install all dependencies
npm run install-all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

## 🚀 Running the Application

### Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server  # Backend only
npm run client  # Frontend only
```

### Production Mode

```bash
# Build frontend
npm run build

# Start backend
cd backend && npm start
```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## 👥 Demo Accounts

The application includes demo accounts for testing:

- **Teacher**: teacher@demo.com / password123
- **Student**: student@demo.com / password123

## 🎯 How to Use

### For Teachers:

1. **Create a Lecture**: Go to "Create New Lecture" and fill in the details
2. **Start Lecture**: Click "Start Lecture" to begin
3. **Start Recording**: Click "Start Recording" to begin voice capture
4. **Voice Commands**: Use these commands while speaking:
   - "AI open a new slide" - Create new slide
   - "AI create a poll" - Start a live poll
   - "AI create a quiz" - Start a quiz question
   - "AI end lecture" - End the lecture
5. **Generate Summary**: After ending, generate PDF summary and quiz questions

### For Students:

1. **Join Lecture**: Click "Join" on active lectures
2. **View Live Notes**: See real-time notes on the blackboard
3. **Participate in Polls/Quizzes**: Answer questions when they appear
4. **Access Materials**: Download summaries and quiz PDFs after lecture ends

## 🏗️ Project Structure

```
Lectra/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, Socket)
│   │   ├── pages/          # Main pages
│   │   └── App.js          # Main app component
│   ├── public/             # Static files
│   └── package.json
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # External service integrations
│   ├── socket/             # Socket.IO handlers
│   ├── middleware/         # Express middleware
│   ├── uploads/            # File uploads
│   ├── pdfs/               # Generated PDFs
│   └── server.js           # Main server file
├── setup.sh               # Setup script
├── package.json           # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify` - Verify JWT token

### Lectures

- `GET /api/lectures` - Get all lectures
- `POST /api/lectures` - Create new lecture (teacher only)
- `GET /api/lectures/:id` - Get specific lecture
- `POST /api/lectures/:id/start` - Start lecture (teacher only)
- `POST /api/lectures/:id/end` - End lecture (teacher only)
- `POST /api/lectures/:id/join` - Join lecture (student only)

### Quizzes/Polls

- `GET /api/quizzes/lecture/:lectureId` - Get quizzes for lecture
- `POST /api/quizzes` - Create quiz/poll (teacher only)
- `POST /api/quizzes/:id/start` - Start quiz/poll
- `POST /api/quizzes/:id/respond` - Submit response (student only)
- `GET /api/quizzes/:id/results` - Get quiz results (teacher only)

### Files

- `POST /api/files/lecture/:id/summary` - Generate lecture summary PDF
- `POST /api/files/quiz/:id/pdf` - Generate quiz results PDF
- `GET /api/files/:filename` - Download file

## 🔧 Environment Variables

### Required Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/lectra

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_PROJECT_ID=your-project-id

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# File Storage
UPLOAD_PATH=./uploads
PDF_PATH=./pdfs

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🚀 Deployment

### Frontend (Netlify)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `frontend/build`
4. Add environment variables for API URL

### Backend (Render/Railway)

1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables

### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Update `MONGODB_URI` with Atlas connection string
3. Configure IP whitelist for your deployment

## 🐛 Troubleshooting

### Common Issues

1. **Audio not recording**: Check microphone permissions in browser
2. **Socket connection failed**: Verify CORS settings and network
3. **Speech-to-Text not working**: Check Google Cloud credentials
4. **PDF generation failed**: Ensure Puppeteer dependencies are installed

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Ensure all environment variables are set correctly
4. Verify all external services (MongoDB, Google Cloud, Gemini) are accessible

## 🎉 Features Roadmap

- [ ] Multi-language support
- [ ] Video recording integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Integration with LMS platforms
- [ ] Advanced quiz types (drag-drop, matching, etc.)
- [ ] Real-time collaboration tools
- [ ] Cloud storage integration
