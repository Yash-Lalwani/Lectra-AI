# Lectra - AI-Powered Lecture Assistant

## 🎯 Project Overview

Lectra is a comprehensive real-time AI-powered lecture assistant that transforms traditional teaching by providing intelligent note-taking, interactive polling, and seamless student engagement. The application captures teacher voice during presentations, transcribes it using Deepgram Speech-to-Text, and generates clean bullet-point notes using Google's Gemini AI.

## ✨ Key Features Implemented

### 🎤 Real-time Voice Processing

- **Audio Capture**: Browser-based microphone recording with MediaRecorder API
- **Speech-to-Text**: Deepgram Speech-to-Text integration for accurate transcription
- **AI Note Generation**: Gemini API integration for intelligent note summarization
- **Voice Commands**: Natural language commands for slide management and interactive features

### 📝 Live Note Sharing

- **Real-time Updates**: Socket.IO for instant note broadcasting to students
- **Clean Formatting**: AI-generated bullet points with proper HTML structure
- **Slide Tracking**: Automatic slide number association with notes
- **Timestamp Management**: Chronological note organization

### 🎯 Interactive Polling & Quizzing

- **Live Polls**: Real-time poll creation with voice commands
- **Quiz Questions**: Multiple-choice questions with timer functionality
- **Student Participation**: Real-time response collection and display
- **Results Analytics**: Instant result visualization and statistics

### 👥 User Management

- **Role-based Access**: Separate interfaces for teachers and students
- **JWT Authentication**: Secure token-based authentication system
- **User Profiles**: Complete user management with registration/login
- **Session Management**: Persistent login sessions with automatic verification

### 📄 Content Generation

- **PDF Summaries**: Automatic lecture summary generation using Puppeteer
- **Quiz PDFs**: Detailed quiz results with individual responses
- **Beautiful Formatting**: Professional PDF layouts with proper styling
- **File Management**: Secure file serving and download functionality

## 🏗️ Technical Architecture

### Backend (Node.js + Express)

```
📁 backend/
├── 📁 models/           # MongoDB schemas
│   ├── User.js         # User management
│   ├── Lecture.js      # Lecture data structure
│   └── Quiz.js         # Quiz/poll management
├── 📁 routes/          # API endpoints
│   ├── auth.js         # Authentication routes
│   ├── lectures.js     # Lecture management
│   ├── quizzes.js      # Quiz/poll handling
│   └── files.js        # File generation & serving
├── 📁 services/        # External integrations
│   ├── speechService.js # Google Cloud STT
│   └── geminiService.js # Google Gemini AI
├── 📁 socket/          # Real-time communication
│   └── socketHandler.js # Socket.IO event handling
├── 📁 middleware/      # Express middleware
│   └── auth.js         # JWT authentication
└── server.js           # Main application server
```

### Frontend (React + Tailwind)

```
📁 frontend/src/
├── 📁 components/      # Reusable UI components
│   └── ProtectedRoute.js
├── 📁 contexts/        # React context providers
│   ├── AuthContext.js  # Authentication state
│   └── SocketContext.js # Socket.IO connection
├── 📁 pages/           # Main application pages
│   ├── Login.js        # Authentication interface
│   ├── Dashboard.js    # Main dashboard
│   ├── Lecture.js      # Teacher lecture interface
│   ├── Blackboard.js   # Student blackboard view
│   └── CreateLecture.js # Lecture creation
└── App.js              # Main application component
```

## 🔧 Core Technologies

### Backend Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.IO**: Real-time communication
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **Puppeteer**: PDF generation
- **Deepgram STT**: Speech-to-text service
- **Google Gemini AI**: Natural language processing

### Frontend Stack

- **React.js**: UI framework
- **Tailwind CSS**: Styling framework
- **React Router**: Client-side routing
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client
- **React Hot Toast**: Notifications

## 🚀 Deployment Ready

### Environment Configuration

- Comprehensive environment variable setup
- Production-ready configuration
- Security best practices implemented
- CORS and rate limiting configured

### Deployment Options

- **Frontend**: Netlify/Vercel ready
- **Backend**: Render/Railway compatible
- **Database**: MongoDB Atlas integration
- **File Storage**: Local filesystem with cloud migration path

## 📊 Database Schema

### Users Collection

```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: Enum ['student', 'teacher'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Lectures Collection

```javascript
{
  title: String,
  teacher: ObjectId (ref: User),
  status: Enum ['scheduled', 'active', 'paused', 'completed'],
  startTime: Date,
  endTime: Date,
  notes: [{
    content: String,
    timestamp: Date,
    slideNumber: Number
  }],
  slides: [{
    slideNumber: Number,
    title: String,
    content: String,
    createdAt: Date
  }],
  transcript: String,
  summary: String,
  pdfPath: String,
  participants: [ObjectId (ref: User)]
}
```

### Quizzes Collection

```javascript
{
  lecture: ObjectId (ref: Lecture),
  teacher: ObjectId (ref: User),
  type: Enum ['poll', 'quiz'],
  question: String,
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: Number,
  timeLimit: Number,
  status: Enum ['created', 'active', 'completed'],
  responses: [{
    student: ObjectId (ref: User),
    selectedOption: Number,
    timestamp: Date
  }],
  results: {
    totalResponses: Number,
    optionCounts: [{
      optionIndex: Number,
      count: Number
    }],
    correctResponses: Number
  }
}
```

## 🎮 User Experience Flow

### Teacher Workflow

1. **Login** → Teacher dashboard with lecture management
2. **Create Lecture** → Set title and description
3. **Start Lecture** → Activate real-time features
4. **Start Recording** → Begin voice capture and transcription
5. **Speak Naturally** → AI generates notes automatically
6. **Voice Commands** → "AI create a poll", "AI open new slide"
7. **Monitor Engagement** → View participant list and responses
8. **End Lecture** → Generate summary PDF and quiz questions

### Student Workflow

1. **Login** → Student dashboard with available lectures
2. **Join Lecture** → Enter live lecture session
3. **View Blackboard** → Real-time notes and slides
4. **Participate in Polls** → Answer questions when they appear
5. **Access Materials** → Download summaries and quiz results

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-based Access**: Teacher/student permission system
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **File Security**: Secure file serving and access control

## 📈 Performance Optimizations

- **Socket.IO Optimization**: Efficient real-time communication
- **Database Indexing**: Optimized MongoDB queries
- **Audio Chunking**: Efficient audio processing
- **PDF Caching**: Generated PDFs stored for reuse
- **Frontend Optimization**: React best practices
- **Error Handling**: Comprehensive error management

## 🧪 Testing & Quality

- **Demo Data Seeder**: Complete test data setup
- **Error Boundaries**: React error handling
- **API Validation**: Comprehensive input validation
- **Socket Error Handling**: Real-time error management
- **File Upload Security**: Safe file handling

## 🎉 Ready for Production

The application is fully functional and ready for deployment with:

✅ Complete authentication system  
✅ Real-time voice processing  
✅ AI-powered note generation  
✅ Interactive polling system  
✅ PDF generation  
✅ Professional UI/UX  
✅ Comprehensive documentation  
✅ Deployment configuration  
✅ Security best practices  
✅ Error handling  
✅ Demo data for testing

## 🚀 Next Steps

1. **Set up environment variables** with your API keys
2. **Run the setup script** to install dependencies
3. **Seed demo data** for testing
4. **Start the application** and begin using
5. **Deploy to production** using provided configurations

The project is complete and ready to revolutionize educational experiences with AI-powered real-time assistance!
