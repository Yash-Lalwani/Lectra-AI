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
import Login from "./pages/Login";
import ProfessorSelect from "./pages/ProfessorSelect";
import Dashboard from "./pages/Dashboard";
import Lecture from "./pages/Lecture";
import Blackboard from "./pages/Blackboard";
import CreateLecture from "./pages/CreateLecture";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/professor-select"
                element={
                  <ProtectedRoute>
                    <ProfessorSelect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
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
