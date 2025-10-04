import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  Clock,
  MessageSquare,
  CheckCircle,
  Circle,
  Play,
  Pause,
  AlertCircle,
} from "lucide-react";

const Blackboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [notes, setNotes] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    fetchLecture();
  }, [id]);

  useEffect(() => {
    if (socket && lecture) {
      // Join lecture room
      socket.emit("join-lecture", { lectureId: id });

      // Socket event listeners
      socket.on("lecture-state", (data) => {
        setCurrentSlide(data.currentSlide || 1);
        setNotes(data.notes || []);
        setIsConnected(true);
      });

      socket.on("new-note", (note) => {
        setNotes((prev) => [...prev, note]);
      });

      socket.on("slide-changed", (data) => {
        setCurrentSlide(data.slideNumber);
      });

      socket.on("poll-started", (data) => {
        setActivePoll(data);
        setTimeLeft(data.timeLimit);
        setSelectedOption(null);
        setHasResponded(false);
        startTimer(data.timeLimit);
      });

      socket.on("poll-ended", (data) => {
        setActivePoll(null);
        setTimeLeft(0);
        setSelectedOption(null);
        setHasResponded(false);
      });

      socket.on("quiz-started", (data) => {
        setActiveQuiz(data);
        setTimeLeft(data.timeLimit);
        setSelectedOption(null);
        setHasResponded(false);
        startTimer(data.timeLimit);
      });

      socket.on("quiz-ended", (data) => {
        setActiveQuiz(null);
        setTimeLeft(0);
        setSelectedOption(null);
        setHasResponded(false);
      });

      socket.on("participant-joined", (data) => {
        setParticipants((prev) => [...prev, data.user]);
      });

      socket.on("participant-left", (data) => {
        setParticipants((prev) => prev.filter((p) => p.id !== data.user.id));
      });

      socket.on("error", (error) => {
        toast.error(error.message);
      });

      return () => {
        socket.off("lecture-state");
        socket.off("new-note");
        socket.off("slide-changed");
        socket.off("poll-started");
        socket.off("poll-ended");
        socket.off("quiz-started");
        socket.off("quiz-ended");
        socket.off("participant-joined");
        socket.off("participant-left");
        socket.off("error");
      };
    }
  }, [socket, lecture, id]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const fetchLecture = async () => {
    try {
      const response = await axios.get(`/api/lectures/${id}`);
      setLecture(response.data.lecture);
    } catch (error) {
      console.error("Error fetching lecture:", error);
      toast.error("Failed to fetch lecture");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (duration) => {
    setTimeLeft(duration);
  };

  const handleResponse = async (optionIndex) => {
    if (hasResponded) return;

    setSelectedOption(optionIndex);
    setHasResponded(true);

    try {
      if (activePoll) {
        await axios.post(`/api/quizzes/${activePoll.quizId}/respond`, {
          selectedOption: optionIndex,
        });
        toast.success("Response recorded!");
      } else if (activeQuiz) {
        await axios.post(`/api/quizzes/${activeQuiz.quizId}/respond`, {
          selectedOption: optionIndex,
        });
        toast.success("Response recorded!");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response");
      setSelectedOption(null);
      setHasResponded(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lecture not found
          </h1>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentActivity = activePoll || activeQuiz;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-white">
                {lecture.title}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-300">
                  {isConnected ? "Live" : "Disconnected"}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Users className="h-4 w-4" />
                <span>{participants.length + 1} online</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MessageSquare className="h-4 w-4" />
                <span>Slide {currentSlide}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Blackboard Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Activity (Poll/Quiz) */}
            {currentActivity && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {activePoll ? "Live Poll" : "Live Quiz"}
                  </h2>
                  {timeLeft > 0 && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Clock className="h-5 w-5" />
                      <span className="text-lg font-mono">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg text-white mb-4">
                    {currentActivity.question}
                  </h3>

                  <div className="space-y-3">
                    {currentActivity.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleResponse(index)}
                        disabled={hasResponded || timeLeft === 0}
                        className={`w-full p-4 rounded-lg text-left transition-colors ${
                          selectedOption === index
                            ? "bg-primary-600 text-white"
                            : hasResponded
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {selectedOption === index ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {hasResponded && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span>Your response has been recorded!</span>
                      </div>
                    </div>
                  )}

                  {timeLeft === 0 && !hasResponded && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <span>Time's up! No response recorded.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Notes Blackboard */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 min-h-96">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Live Notes</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Updates</span>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      Waiting for notes...
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Notes will appear here as the teacher speaks
                    </p>
                  </div>
                ) : (
                  notes.map((note, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">
                          Slide {note.slideNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div
                        className="text-white prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lecture Status */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Lecture Status
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <div className="flex items-center space-x-2">
                    {lecture.status === "active" ? (
                      <Play className="h-4 w-4 text-green-400" />
                    ) : (
                      <Pause className="h-4 w-4 text-gray-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        lecture.status === "active"
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      {lecture.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Current Slide</span>
                  <span className="text-sm text-white">{currentSlide}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Notes Count</span>
                  <span className="text-sm text-white">{notes.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Participants</span>
                  <span className="text-sm text-white">
                    {participants.length + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Online Now
              </h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.firstName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">You</p>
                    <p className="text-xs text-gray-400">Student</p>
                  </div>
                </div>

                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {participant.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {participant.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="w-full p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Scroll to Top
                </button>

                <button
                  onClick={() => {
                    const notesContainer =
                      document.querySelector(".overflow-y-auto");
                    if (notesContainer) {
                      notesContainer.scrollTop = notesContainer.scrollHeight;
                    }
                  }}
                  className="w-full p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Latest Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blackboard;
