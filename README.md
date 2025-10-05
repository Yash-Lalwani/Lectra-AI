# Lectra AI - Real-time AI-Powered Lecture Assistant

A comprehensive real-time AI-powered lecture assistant that transforms traditional teaching by providing intelligent note-taking, interactive polling, and seamless student engagement.

## 🚀 Live Demo

- **Frontend**: [https://lectra-ai.vercel.app](https://lectra-ai.vercel.app)
- **Backend API**: [https://lectra-ai-backend.onrender.com](https://lectra-ai-backend.onrender.com)

## ✨ Features

- 🎤 **Real-time Voice Processing** - Speech-to-text with Deepgram
- 📝 **AI Note Generation** - Intelligent summarization with Google Gemini
- 🎯 **Interactive Polling** - Live polls and quizzes
- 👥 **User Management** - Role-based access for teachers and students
- 📄 **PDF Generation** - Automatic lecture summaries and quiz results
- 🔒 **Secure Authentication** - JWT-based authentication system

## 🏗️ Tech Stack

### Backend

- Node.js + Express.js
- Socket.IO for real-time communication
- MongoDB with Mongoose
- JWT authentication
- Deepgram Speech-to-Text
- Google Gemini AI

### Frontend

- React.js
- Tailwind CSS
- Socket.IO Client
- React Router

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Deepgram API key
- Google Gemini API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/lectra-ai.git
   cd lectra-ai
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your API keys
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:5001

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lectra

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Deepgram Speech-to-Text
DEEPGRAM_API_KEY=your-deepgram-api-key-here

# Gemini AI API
GEMINI_API_KEY=your-gemini-api-key-here

# File Storage
UPLOAD_PATH=./uploads
PDF_PATH=./pdfs

# CORS
FRONTEND_URL=http://localhost:3001
```

## 📱 Usage

### For Teachers

1. Register/Login with teacher role
2. Create a new lecture
3. Start recording and speak naturally
4. Use voice commands for interactive features
5. Monitor student participation
6. Generate lecture summaries

### For Students

1. Register/Login with student role
2. Join available lectures
3. View real-time notes and slides
4. Participate in polls and quizzes
5. Download lecture materials

## 🚀 Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`
4. Add environment variables for API URL

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Lectures

- `GET /api/lectures` - Get all lectures
- `POST /api/lectures` - Create new lecture
- `PUT /api/lectures/:id` - Update lecture
- `DELETE /api/lectures/:id` - Delete lecture

### Quizzes

- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create new quiz
- `POST /api/quizzes/:id/respond` - Submit quiz response

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Rate limiting
- Input validation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com/) for speech-to-text services
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- [Render](https://render.com/) for backend hosting
- [Vercel](https://vercel.com/) for frontend hosting

## 📞 Support

If you have any questions or need help, please open an issue or contact us at [your-email@example.com](mailto:your-email@example.com).
