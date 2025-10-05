import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Play,
  Pause,
  Users,
  Clock,
  BookOpen,
  LogOut,
  User,
  Settings,
  Calendar,
  TrendingUp,
  RefreshCw,
  Mic,
  Brain,
  Zap,
  FileText,
  Headphones,
  Presentation,
  Lightbulb,
  PenTool,
  MessageSquare,
  Award,
  Sparkles,
  BookMarked,
} from "lucide-react";

const Dashboard = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLecture, setActiveLecture] = useState(null);
  const [lectureQuizzes, setLectureQuizzes] = useState({}); // Map of lectureId -> quiz count
  const [searchParams] = useSearchParams();
  const professorId = searchParams.get("professorId");

  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLectures();
  }, [professorId]);

  useEffect(() => {
    if (socket) {
      socket.on("lecture-state", (data) => {
        setActiveLecture(data.lecture);
      });

      socket.on("lecture-ended", () => {
        setActiveLecture(null);
        fetchLectures();
      });

      return () => {
        socket.off("lecture-state");
        socket.off("lecture-ended");
      };
    }
  }, [socket]);

  const fetchLectures = async () => {
    try {
      const url = professorId
        ? `/api/lectures?teacherId=${professorId}`
        : "/api/lectures";
      const response = await axios.get(url);
      setLectures(response.data.lectures);

      // Fetch quiz counts for each completed lecture (for students)
      if (user.role === "student") {
        const quizCounts = {};
        for (const lecture of response.data.lectures) {
          if (lecture.status === "completed") {
            try {
              const quizResponse = await axios.get(
                `/api/quizzes/lecture/${lecture._id}`
              );
              quizCounts[lecture._id] = quizResponse.data.quizzes.length;
            } catch (err) {
              quizCounts[lecture._id] = 0;
            }
          }
        }
        setLectureQuizzes(quizCounts);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast.error("Failed to fetch lectures");
    } finally {
      setLoading(false);
    }
  };

  const handleStartLecture = async (lectureId) => {
    try {
      await axios.post(`/api/lectures/${lectureId}/start`);
      toast.success("Lecture started!");
      fetchLectures();
    } catch (error) {
      console.error("Error starting lecture:", error);
      toast.error("Failed to start lecture");
    }
  };

  const handleEndLecture = async (lectureId) => {
    try {
      await axios.post(`/api/lectures/${lectureId}/end`);
      toast.success("Lecture ended!");
      setActiveLecture(null);
      fetchLectures();
    } catch (error) {
      console.error("Error ending lecture:", error);
      toast.error("Failed to end lecture");
    }
  };

  const handleJoinLecture = async (lectureId) => {
    try {
      await axios.post(`/api/lectures/${lectureId}/join`);
      toast.success("Joined lecture!");
      navigate(`/blackboard/${lectureId}`);
    } catch (error) {
      console.error("Error joining lecture:", error);
      toast.error("Failed to join lecture");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      case "completed":
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
      <div className="relative z-10 min-h-screen bg-transparent">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <BookOpen className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">Lectra</h1>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {user.role === "student" && (
                  <button
                    onClick={() => navigate("/select-professor")}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Change Professor</span>
                  </button>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === "teacher"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-gray-600">
              {user.role === "teacher"
                ? "Manage your lectures and engage with your students."
                : "Join active lectures and access your learning materials."}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Lectures
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lectures.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Lectures
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lectures.filter((l) => l.status === "active").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lectures.filter((l) => l.status === "completed").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Your Lectures
            </h3>
            {user.role === "teacher" && (
              <Link
                to="/create-lecture"
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Lecture</span>
              </Link>
            )}
          </div>

          {/* Lectures List */}
          {lectures.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No lectures found
              </h3>
              <p className="text-gray-600 mb-4">
                {user.role === "teacher"
                  ? "Create your first lecture to get started."
                  : "No lectures are available at the moment."}
              </p>
              {user.role === "teacher" && (
                <Link to="/create-lecture" className="btn btn-primary">
                  Create Lecture
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((lecture) => (
                <div
                  key={lecture._id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="card-header">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {lecture.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          lecture.status
                        )}`}
                      >
                        {getStatusIcon(lecture.status)}
                        <span className="ml-1 capitalize">
                          {lecture.status}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      by {lecture.teacher.firstName} {lecture.teacher.lastName}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(lecture.createdAt).toLocaleDateString()}
                    </div>

                    {lecture.participants && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {lecture.participants.length} participants
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {lecture.notes.length} notes
                    </div>

                    {user.role === "student" &&
                      lectureQuizzes[lecture._id] > 0 && (
                        <div className="flex items-center text-sm text-purple-600">
                          <Award className="h-4 w-4 mr-2" />
                          {lectureQuizzes[lecture._id]} quiz
                          {lectureQuizzes[lecture._id] > 1 ? "zes" : ""} available
                        </div>
                      )}

                    <div className="pt-4 border-t border-gray-200">
                      {user.role === "teacher" ? (
                        <div className="flex space-x-2">
                          {lecture.status === "scheduled" && (
                            <button
                              onClick={() => handleStartLecture(lecture._id)}
                              className="btn btn-success flex-1 flex items-center justify-center space-x-2"
                            >
                              <Play className="h-4 w-4" />
                              <span>Start</span>
                            </button>
                          )}

                          {lecture.status === "active" && (
                            <button
                              onClick={() => handleEndLecture(lecture._id)}
                              className="btn btn-danger flex-1 flex items-center justify-center space-x-2"
                            >
                              <Pause className="h-4 w-4" />
                              <span>End</span>
                            </button>
                          )}

                          <Link
                            to={`/lecture/${lecture._id}`}
                            className="btn btn-secondary flex-1 text-center"
                          >
                            Manage
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            {lecture.status === "active" && (
                              <button
                                onClick={() => handleJoinLecture(lecture._id)}
                                className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                              >
                                <Play className="h-4 w-4" />
                                <span>Join</span>
                              </button>
                            )}

                            {lecture.status === "completed" && (
                              <Link
                                to={`/lecture/${lecture._id}/notes`}
                                className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                              >
                                <BookOpen className="h-4 w-4" />
                                <span>View Notes</span>
                              </Link>
                            )}

                            <Link
                              to={`/blackboard/${lecture._id}`}
                              className="btn btn-secondary flex-1 text-center"
                            >
                              View
                            </Link>
                          </div>

                          {lecture.status === "completed" &&
                            lectureQuizzes[lecture._id] > 0 && (
                              <Link
                                to={`/lecture/${lecture._id}/quiz`}
                                className="btn w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Award className="h-4 w-4" />
                                <span>
                                  Take Quiz ({lectureQuizzes[lecture._id]})
                                </span>
                              </Link>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
