import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  ArrowLeft,
  Users,
  Clock,
  Settings,
  Download,
  FileText,
  MessageSquare,
} from "lucide-react";

const Lecture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [notes, setNotes] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    if (user.role !== "teacher") {
      navigate("/dashboard");
      return;
    }

    fetchLecture();
  }, [id, user.role, navigate]);

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

      socket.on("note-added", (note) => {
        setNotes((prev) => [...prev, note]);
      });

      socket.on("slide-changed", (data) => {
        setCurrentSlide(data.slideNumber);
        toast.success(`Moved to slide ${data.slideNumber}`);
      });

      socket.on("poll-started", (data) => {
        setActivePoll(data);
        toast.success("Poll started!");
      });

      socket.on("poll-ended", (data) => {
        setActivePoll(null);
        toast.success("Poll ended!");
      });

      socket.on("quiz-started", (data) => {
        setActiveQuiz(data);
        toast.success("Quiz started!");
      });

      socket.on("quiz-ended", (data) => {
        setActiveQuiz(null);
        toast.success("Quiz ended!");
      });

      socket.on("participant-joined", (data) => {
        setParticipants((prev) => [...prev, data.user]);
        toast.success(`${data.user.name} joined the lecture`);
      });

      socket.on("participant-left", (data) => {
        setParticipants((prev) => prev.filter((p) => p.id !== data.user.id));
        toast.info(`${data.user.name} left the lecture`);
      });

      socket.on("recording-started", () => {
        // Recording started successfully
      });

      socket.on("recording-stopped", () => {
        // Recording stopped successfully
      });

      socket.on("error", (error) => {
        toast.error(error.message);
      });

      return () => {
        socket.off("lecture-state");
        socket.off("new-note");
        socket.off("note-added");
        socket.off("slide-changed");
        socket.off("poll-started");
        socket.off("poll-ended");
        socket.off("quiz-started");
        socket.off("quiz-ended");
        socket.off("participant-joined");
        socket.off("participant-left");
        socket.off("recording-started");
        socket.off("recording-stopped");
        socket.off("error");
      };
    }
  }, [socket, lecture, id]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Deepgram expects 16kHz
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Create Web Audio API context
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: 16000,
      });

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      // Store references for cleanup
      audioContextRef.current = audioContext;
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        if (socket && isRecordingRef.current) {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);

          // Convert float32 to int16 PCM
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(
              -32768,
              Math.min(32767, inputData[i] * 32768)
            );
          }

          // Send raw PCM data to server
          socket.emit("audio-data", { audioBuffer: pcmData.buffer });
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Notify server that recording started
      if (socket) {
        socket.emit("start-recording");
      }

      setIsRecording(true);
      isRecordingRef.current = true;
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    // Notify server that recording stopped
    if (socket) {
      socket.emit("stop-recording");
    }

    // Clean up Web Audio API
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    isRecordingRef.current = false;
    toast.success("Recording stopped");
  };

  const startLecture = async () => {
    try {
      await axios.post(`/api/lectures/${id}/start`);
      setLecture((prev) => ({ ...prev, status: "active" }));
      toast.success("Lecture started!");
    } catch (error) {
      console.error("Error starting lecture:", error);
      toast.error("Failed to start lecture");
    }
  };

  const endLecture = async () => {
    try {
      await axios.post(`/api/lectures/${id}/end`);
      setLecture((prev) => ({ ...prev, status: "completed" }));
      toast.success("Lecture ended!");

      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }
    } catch (error) {
      console.error("Error ending lecture:", error);
      toast.error("Failed to end lecture");
    }
  };

  const generateSummary = async () => {
    try {
      const response = await axios.post(`/api/files/lecture/${id}/summary`);
      toast.success("Summary generated!");
      // You could open the PDF in a new tab or show a download link
      window.open(response.data.downloadUrl, "_blank");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
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
                <span className="text-sm text-gray-600">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{participants.length} participants</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Slide {currentSlide}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recording Controls */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lecture Controls
                </h3>
              </div>

              <div className="space-y-4">
                {/* Recording Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-900">
                      {isRecording ? "Recording..." : "Not Recording"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        disabled={lecture.status !== "active"}
                        className="btn btn-danger flex items-center space-x-2"
                      >
                        <Mic className="h-4 w-4" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="btn btn-secondary flex items-center space-x-2"
                      >
                        <MicOff className="h-4 w-4" />
                        <span>Stop Recording</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lecture Controls */}
                <div className="flex items-center space-x-4">
                  {lecture.status === "scheduled" && (
                    <button
                      onClick={startLecture}
                      className="btn btn-success flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Lecture</span>
                    </button>
                  )}

                  {lecture.status === "active" && (
                    <button
                      onClick={endLecture}
                      className="btn btn-danger flex items-center space-x-2"
                    >
                      <Square className="h-4 w-4" />
                      <span>End Lecture</span>
                    </button>
                  )}

                  {lecture.status === "completed" && (
                    <button
                      onClick={generateSummary}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Generate Summary</span>
                    </button>
                  )}
                </div>

                {/* Voice Commands Info */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Voice Commands
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• "AI open a new slide" - Create new slide</li>
                    <li>• "AI create a poll" - Start a poll</li>
                    <li>• "AI create a quiz" - Start a quiz</li>
                    <li>• "AI end lecture" - End the lecture</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Active Poll/Quiz */}
            {(activePoll || activeQuiz) && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activePoll ? "Active Poll" : "Active Quiz"}
                  </h3>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    {activePoll?.question || activeQuiz?.question}
                  </h4>

                  <div className="space-y-2">
                    {(activePoll?.options || activeQuiz?.options)?.map(
                      (option, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>{" "}
                          {option}
                        </div>
                      )
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    Time limit: {activePoll?.timeLimit || activeQuiz?.timeLimit}{" "}
                    seconds
                  </div>
                </div>
              </div>
            )}

            {/* Live Notes */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Live Notes
                </h3>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No notes yet. Start recording to generate notes from your
                    speech.
                  </p>
                ) : (
                  notes.map((note, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Slide {note.slideNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div
                        className="text-gray-900 prose prose-sm max-w-none"
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
            {/* Participants */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Participants
                </h3>
              </div>

              <div className="space-y-2">
                {participants.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No participants yet
                  </p>
                ) : (
                  participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {participant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.name}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lecture Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lecture Info
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      lecture.status === "active"
                        ? "bg-green-100 text-green-800"
                        : lecture.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : lecture.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {lecture.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Started</span>
                  <span className="text-sm text-gray-900">
                    {new Date(lecture.startTime).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Notes</span>
                  <span className="text-sm text-gray-900">{notes.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Slide</span>
                  <span className="text-sm text-gray-900">{currentSlide}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lecture;
