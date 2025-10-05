import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  StopCircle,
  Plus,
  Trash2,
  Users,
  MessageSquareText,
  Presentation,
} from "lucide-react";

function Lecture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [markdownContent, setMarkdownContent] = useState("");
  const [activePoll, setActivePoll] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

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
        setMarkdownContent(data.markdownContent || "");
      });

      socket.on("markdown-updated", (note) => {
        setMarkdownContent(note.content);
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
        socket.off("markdown-updated");
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
      setLoading(true);
      const response = await axios.get(`/api/lectures/${id}`);
      setLecture(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch lecture");
      toast.error(err.response?.data?.message || "Failed to fetch lecture");
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start lecture");
    }
  };

  const endLecture = async () => {
    try {
      await axios.post(`/api/lectures/${id}/end`);
      setLecture((prev) => ({ ...prev, status: "ended" }));
      toast.success("Lecture ended!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end lecture");
    }
  };

  const generateSummaryPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const response = await axios.post(
        `/api/files/lecture/${id}/summary`,
        {},
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `lecture-summary-${lecture.title.replace(/\s+/g, "-")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF summary generated and downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateQuiz = async () => {
    try {
      setIsGeneratingQuiz(true);

      // Generate quiz questions from the markdown content using Gemini
      const quizResponse = await axios.post(
        `/api/files/lecture/${id}/generate-quiz`,
        {
          content: markdownContent,
        }
      );

      if (quizResponse.data.success) {
        const quiz = quizResponse.data.quiz;

        // Create individual quiz questions in the database
        for (const questionData of quiz.questions) {
          await axios.post(`/api/quizzes`, {
            lecture: id,
            type: "multiple_choice",
            question: questionData.question,
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            timeLimit: 30,
            explanation: questionData.explanation,
          });
        }

        toast.success(
          `Quiz generated successfully! Created ${quiz.questions.length} questions.`
        );
      } else {
        toast.error("Failed to generate quiz questions");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      toast.error(err.response?.data?.message || "Failed to generate quiz");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleNewSlide = async () => {
    try {
      const newSlideNumber = currentSlide + 1;
      await axios.post(`/api/lectures/${id}/slide`, {
        slideNumber: newSlideNumber,
      });
      setCurrentSlide(newSlideNumber);
      toast.success(`Moved to slide ${newSlideNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create new slide");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Loading lecture...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Lecture not found.</p>
      </div>
    );
  }

  // Recording mode - full screen notes view
  if (isRecording) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Controls Bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">{lecture.title}</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Recording
            </span>
            <span className="text-gray-600">Slide {currentSlide}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-600">
              Participants: {participants.length}
            </span>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center font-medium"
            >
              <MicOff className="mr-2" size={20} />
              Stop Recording
            </button>
            <button
              onClick={endLecture}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center font-medium"
            >
              <StopCircle className="mr-2" size={20} />
              End Lecture
            </button>
          </div>
        </div>

        {/* Full Screen Notes Display */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg h-full">
            <div className="p-8 h-full overflow-y-auto">
              {markdownContent ? (
                <div className="prose prose-lg max-w-none prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Mic className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">Start Speaking</h3>
                  <p className="text-center">
                    Your notes will appear here as you speak. Speak clearly and
                    the AI will generate beautiful markdown notes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Poll/Quiz Overlay */}
        {(activePoll || activeQuiz) && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-6 max-w-md">
            {activePoll && (
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  📊 Live Poll: {activePoll.question}
                </h3>
                <ul className="space-y-2">
                  {activePoll.options.map((option, index) => (
                    <li
                      key={index}
                      className="text-blue-700 bg-blue-50 p-2 rounded"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-blue-600 mt-2">
                  Time remaining: {activePoll.timeLimit}s
                </p>
              </div>
            )}

            {activeQuiz && (
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  🎯 Live Quiz: {activeQuiz.question}
                </h3>
                <ul className="space-y-2">
                  {activeQuiz.options.map((option, index) => (
                    <li
                      key={index}
                      className="text-purple-700 bg-purple-50 p-2 rounded"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-purple-600 mt-2">
                  Correct Answer: {activeQuiz.correctAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Post-lecture mode - show summary and quiz options
  if (lecture.status === "ended") {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {lecture.title} - Lecture Ended
          </h1>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Ended
            </span>
            <span className="text-gray-600">
              Participants: {participants.length}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Post-Lecture Actions */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                📚 Post-Lecture Actions
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* PDF Generation */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">
                        Generate Summary PDF
                      </h3>
                      <p className="text-blue-600 text-sm">
                        Create a comprehensive PDF summary of your lecture
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={generateSummaryPDF}
                    disabled={isGeneratingPDF}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating PDF...
                      </>
                    ) : (
                      "📄 Generate PDF Summary"
                    )}
                  </button>
                </div>

                {/* Quiz Generation */}
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-800">
                        Generate Quiz
                      </h3>
                      <p className="text-purple-600 text-sm">
                        Create quiz questions based on your lecture notes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={generateQuiz}
                    disabled={isGeneratingQuiz}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating Quiz...
                      </>
                    ) : (
                      "🎯 Generate Quiz Questions"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Lecture Notes Review */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                📝 Lecture Notes Review
              </h3>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {markdownContent ? (
                  <div className="prose prose-sm max-w-none prose-headings:mt-6 prose-headings:mb-3 prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No notes were generated during this lecture.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Normal mode - standard lecture interface
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {lecture.title} - Slide {currentSlide}
        </h1>
        <div className="flex items-center space-x-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              lecture.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {lecture.status}
          </span>
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={
              isConnected ? "Connected to server" : "Disconnected from server"
            }
          ></div>
          <span className="text-gray-600">
            Participants: {participants.length}
          </span>
          <button
            onClick={startLecture}
            disabled={lecture.status === "active"}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="inline-block mr-2" size={18} />
            Start Lecture
          </button>
          <button
            onClick={endLecture}
            disabled={lecture.status === "ended"}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopCircle className="inline-block mr-2" size={18} />
            End Lecture
          </button>
        </div>
      </header>

      <main className="flex-1 flex p-4 space-x-4">
        {/* Left Panel: Controls and Notes Preview */}
        <div className="w-1/3 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Teacher Controls
          </h2>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected || lecture.status !== "active"}
            >
              <Mic className="inline-block mr-2" size={18} />
              Start Recording
            </button>
            <button
              onClick={handleNewSlide}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={lecture.status !== "active"}
            >
              <Plus className="inline-block mr-2" size={18} />
              New Slide
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Live Notes Preview
          </h2>
          <div className="flex-1 bg-gray-50 p-4 rounded-md overflow-y-auto border border-gray-200">
            {markdownContent ? (
              <div className="prose prose-sm max-w-none prose-headings:mt-6 prose-headings:mb-3 prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdownContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500">
                No notes yet. Start recording to generate notes!
              </p>
            )}
          </div>
        </div>

        {/* Right Panel: Slides */}
        <div className="w-2/3 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Presentation Slides
          </h2>
          <div className="flex-1 bg-gray-50 p-4 rounded-md overflow-y-auto border border-gray-200">
            <p className="text-gray-500">
              Slide content will appear here. Current slide: {currentSlide}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Lecture;
