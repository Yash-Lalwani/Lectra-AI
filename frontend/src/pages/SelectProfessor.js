import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  BookOpen, Mic, Brain, Users, Zap, FileText,
  Headphones, Presentation, Lightbulb, PenTool,
  MessageSquare, Award, TrendingUp, Sparkles, BookMarked
} from "lucide-react";
import toast from "react-hot-toast";

const SelectProfessor = () => {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const response = await axios.get("/api/auth/professors");
      setProfessors(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching professors:", error);
      toast.error("Failed to load professors");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProfessor) {
      toast.error("Please select a professor");
      return;
    }
    navigate(`/dashboard?professorId=${selectedProfessor}`);
  };

  // Floating icons configuration
  const floatingIcons = [
    { Icon: BookOpen, delay: 0, duration: 20, x: "10%", y: "20%" },
    { Icon: Mic, delay: 2, duration: 25, x: "80%", y: "15%" },
    { Icon: Brain, delay: 4, duration: 22, x: "15%", y: "70%" },
    { Icon: Users, delay: 1, duration: 24, x: "85%", y: "65%" },
    { Icon: FileText, delay: 3, duration: 23, x: "5%", y: "45%" },
    { Icon: Headphones, delay: 5, duration: 21, x: "90%", y: "40%" },
    { Icon: Presentation, delay: 2.5, duration: 26, x: "25%", y: "85%" },
    { Icon: Lightbulb, delay: 1.5, duration: 24, x: "75%", y: "80%" },
    { Icon: PenTool, delay: 4.5, duration: 22, x: "50%", y: "10%" },
    { Icon: MessageSquare, delay: 3.5, duration: 25, x: "60%", y: "90%" },
    { Icon: Award, delay: 0.5, duration: 23, x: "95%", y: "25%" },
    { Icon: TrendingUp, delay: 5.5, duration: 21, x: "40%", y: "5%" },
    { Icon: Sparkles, delay: 2.8, duration: 24, x: "70%", y: "50%" },
    { Icon: BookMarked, delay: 4.2, duration: 22, x: "30%", y: "35%" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map(({ Icon, delay, duration, x, y }, index) => (
          <div
            key={index}
            className="absolute opacity-10"
            style={{
              left: x,
              top: y,
              animation: `float ${duration}s ease-in-out ${delay}s infinite`,
            }}
          >
            <Icon className="h-12 w-12 text-primary-600" />
          </div>
        ))}
      </div>

      {/* Add keyframes animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            25% {
              transform: translateY(-20px) rotate(5deg);
            }
            50% {
              transform: translateY(0px) rotate(0deg);
            }
            75% {
              transform: translateY(20px) rotate(-5deg);
            }
          }
        `}
      </style>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-4 rounded-2xl shadow-lg inline-block mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
              Welcome, {user?.firstName}!
            </h1>
            <p className="text-lg text-gray-600">
              Select your professor to view lectures
            </p>
          </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="professor" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Professor
              </label>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <select
                  id="professor"
                  value={selectedProfessor}
                  onChange={(e) => setSelectedProfessor(e.target.value)}
                  className="w-full px-6 py-5 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-lg font-medium bg-white hover:border-primary-400"
                  required
                >
                  <option value="">-- Select a Professor --</option>
                  {professors.map((prof) => (
                    <option key={prof._id} value={prof._id}>
                      {prof.firstName} {prof.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Continue to Dashboard
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SelectProfessor;
