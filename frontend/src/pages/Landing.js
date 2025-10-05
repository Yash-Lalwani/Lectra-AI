import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Spline from '@splinetool/react-spline';
import {
  BookOpen, Mic, Brain, Users, Zap, GraduationCap,
  Mail, Lock, User, Eye, EyeOff, Sparkles, FileText,
  BookMarked, Headphones, Presentation, Lightbulb, PenTool,
  MessageSquare, Award, TrendingUp
} from "lucide-react";

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const { login, register, isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Students always go to select-professor first, teachers go to dashboard
      let redirectPath;
      if (user.role === "student") {
        redirectPath = "/select-professor";
      } else {
        redirectPath = location.state?.from?.pathname || "/dashboard";
      }
      console.log("User role:", user.role);
      console.log("Redirecting to:", redirectPath);
      window.location.href = redirectPath;
    }
  }, [isAuthenticated, user, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
        // Redirect is handled by useEffect after login success
      } else {
        result = await register(formData);
        if (result.success) {
          // Switch to login mode after successful registration
          setIsLogin(true);
          setFormData({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            role: "student",
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    // Students always go to select-professor first, teachers go to dashboard
    const redirectPath = user.role === "student"
      ? "/select-professor"
      : (location.state?.from?.pathname || "/dashboard");
    return <Navigate to={redirectPath} replace />;
  }

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
    { Icon: GraduationCap, delay: 1.8, duration: 26, x: "12%", y: "55%" },
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
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lectra
                </h1>
                <p className="text-xs text-gray-600 font-medium">AI-Powered Learning Platform</p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Sign-in Form */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Conditional Left Side Content */}
              {isLogin ? (
                /* Website Info for Sign-In */
                <div className="text-center lg:text-left space-y-8">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Welcome to the Future of Learning</span>
                  </div>

                  <div>
                    <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                      Transform Your
                      <br />
                      <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Learning Journey
                      </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                      Experience real-time AI-powered lecture transcription, intelligent note-taking,
                      and interactive learning tools designed for modern education.
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/80">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-lg">
                          <Mic className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Live Transcription</p>
                          <p className="text-xs text-gray-600">Real-time voice to text</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/80">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-2 rounded-lg">
                          <Brain className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">AI Notes</p>
                          <p className="text-xs text-gray-600">Smart summaries</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/80">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Interactive Polls</p>
                          <p className="text-xs text-gray-600">Engage students</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/80">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-2 rounded-lg">
                          <Zap className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Live Blackboard</p>
                          <p className="text-xs text-gray-600">Real-time sync</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Spline 3D Robot for Sign-Up */
                <div className="w-full h-[580px] flex items-center justify-center lg:justify-end lg:pr-8">
                  <Spline
                    scene="https://prod.spline.design/QquQtjoFpS9ta9eI/scene.splinecode"
                    style={{ width: '100%', height: '100%', background: 'transparent' }}
                  />
                </div>
              )}

              {/* Sign-in Form Box */}
              <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-0">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80 p-8">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {isLogin ? "Welcome Back!" : "Join Lectra"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {isLogin ? "Sign in to continue your learning" : "Create your account to get started"}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                              First Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required={!isLogin}
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="John"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                              Last Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required={!isLogin}
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Doe"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                            I am a
                          </label>
                          <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete={isLogin ? "current-password" : "new-password"}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        </div>
                      ) : isLogin ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Lectra. Empowering education with AI technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
