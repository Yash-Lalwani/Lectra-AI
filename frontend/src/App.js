import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import SelectProfessor from "./pages/SelectProfessor";
import Dashboard from "./pages/Dashboard";
import Lecture from "./pages/Lecture";
import Blackboard from "./pages/Blackboard";
import CreateLecture from "./pages/CreateLecture";
import LectureNotes from "./pages/LectureNotes";
import TakeQuiz from "./pages/TakeQuiz";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Landing />} />
              <Route
                path="/select-professor"
                element={
                  <ProtectedRoute requireRole="student">
                    <SelectProfessor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lecture/:id"
                element={
                  <ProtectedRoute>
                    <Lecture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blackboard/:id"
                element={
                  <ProtectedRoute>
                    <Blackboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-lecture"
                element={
                  <ProtectedRoute requireRole="teacher">
                    <CreateLecture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lecture/:id/notes"
                element={
                  <ProtectedRoute requireRole="student">
                    <LectureNotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lecture/:id/quiz"
                element={
                  <ProtectedRoute requireRole="student">
                    <TakeQuiz />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
