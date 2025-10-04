const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Lecture = require("../models/Lecture");
const Quiz = require("../models/Quiz");
const speechService = require("../services/speechService");
const geminiService = require("../services/geminiService");

const activeLectures = new Map(); // lectureId -> { teacherSocket, studentSockets: Set }
const userSockets = new Map(); // userId -> socket

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user || !user.isActive) {
        return next(new Error("User not found or inactive"));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.user = user;

      userSockets.set(socket.userId, socket);
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.email} connected`);

    // Join lecture room
    socket.on("join-lecture", async (data) => {
      try {
        const { lectureId } = data;

        // Verify lecture exists and user has access
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
          socket.emit("error", { message: "Lecture not found" });
          return;
        }

        // Check access permissions
        if (socket.userRole === "student") {
          // Students can join any active lecture
          if (lecture.status !== "active") {
            socket.emit("error", { message: "Lecture is not active" });
            return;
          }
        } else if (socket.userRole === "teacher") {
          // Teachers can only join their own lectures
          if (!lecture.teacher.equals(socket.userId)) {
            socket.emit("error", { message: "Access denied" });
            return;
          }
        }

        socket.join(lectureId);
        socket.currentLectureId = lectureId;

        // Initialize lecture room if it doesn't exist
        if (!activeLectures.has(lectureId)) {
          activeLectures.set(lectureId, {
            teacherSocket: null,
            studentSockets: new Set(),
            currentSlide: 1,
            notes: [],
          });
        }

        const lectureRoom = activeLectures.get(lectureId);

        if (socket.userRole === "teacher") {
          lectureRoom.teacherSocket = socket;
        } else {
          lectureRoom.studentSockets.add(socket);
        }

        // Send current lecture state to the user
        socket.emit("lecture-state", {
          lecture,
          currentSlide: lectureRoom.currentSlide,
          notes: lectureRoom.notes,
          slides: lecture.slides,
        });

        // Notify other users about new participant
        socket.to(lectureId).emit("participant-joined", {
          user: {
            id: socket.userId,
            name: `${socket.user.firstName} ${socket.user.lastName}`,
            role: socket.userRole,
          },
        });
      } catch (error) {
        console.error("Join lecture error:", error);
        socket.emit("error", { message: "Failed to join lecture" });
      }
    });

    // Handle audio chunks from teacher
    socket.on("audio-chunk", async (data) => {
      try {
        if (socket.userRole !== "teacher" || !socket.currentLectureId) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        const { audioData } = data;
        const audioBuffer = Buffer.from(audioData, "base64");

        // Transcribe audio
        const transcription = await speechService.streamTranscribe(audioBuffer);

        if (transcription.success && transcription.text.trim()) {
          const lectureRoom = activeLectures.get(socket.currentLectureId);
          if (!lectureRoom) return;

          // Check for voice commands
          const commandDetection = await geminiService.detectCommand(
            transcription.text
          );

          if (commandDetection.success && commandDetection.hasCommand) {
            await handleVoiceCommand(socket, commandDetection, lectureRoom);
          } else {
            // Generate notes from normal speech
            const notesResult = await geminiService.generateNotes(
              transcription.text
            );

            if (notesResult.success) {
              // Add note to lecture room
              const note = {
                content: notesResult.notes,
                timestamp: Date.now(),
                slideNumber: lectureRoom.currentSlide,
              };

              lectureRoom.notes.push(note);

              // Broadcast to all students
              socket.to(socket.currentLectureId).emit("new-note", note);
              socket.emit("note-added", note);

              // Save to database
              await saveNoteToDatabase(socket.currentLectureId, note);
            }
          }
        }
      } catch (error) {
        console.error("Audio processing error:", error);
        socket.emit("error", { message: "Failed to process audio" });
      }
    });

    // Handle quiz responses from students
    socket.on("quiz-response", async (data) => {
      try {
        if (socket.userRole !== "student") {
          socket.emit("error", {
            message: "Only students can respond to quizzes",
          });
          return;
        }

        const { quizId, selectedOption } = data;

        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.status !== "active") {
          socket.emit("error", { message: "Quiz not found or not active" });
          return;
        }

        // Add response
        await quiz.addResponse(socket.userId, selectedOption);

        // Broadcast updated results to all participants
        io.to(socket.currentLectureId).emit("quiz-results-updated", {
          quizId,
          results: quiz.results,
        });

        socket.emit("response-recorded", { quizId, selectedOption });
      } catch (error) {
        console.error("Quiz response error:", error);
        socket.emit("error", { message: "Failed to record response" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.user?.email} disconnected`);

      userSockets.delete(socket.userId);

      if (socket.currentLectureId) {
        const lectureRoom = activeLectures.get(socket.currentLectureId);
        if (lectureRoom) {
          if (socket.userRole === "teacher") {
            lectureRoom.teacherSocket = null;
          } else {
            lectureRoom.studentSockets.delete(socket);
          }

          // If no more participants, clean up the room
          if (
            !lectureRoom.teacherSocket &&
            lectureRoom.studentSockets.size === 0
          ) {
            activeLectures.delete(socket.currentLectureId);
          }
        }

        // Notify other participants
        socket.to(socket.currentLectureId).emit("participant-left", {
          user: {
            id: socket.userId,
            name: `${socket.user.firstName} ${socket.user.lastName}`,
            role: socket.userRole,
          },
        });
      }
    });
  });

  // Helper function to handle voice commands
  async function handleVoiceCommand(socket, commandDetection, lectureRoom) {
    const { commandType, parameters } = commandDetection;

    switch (commandType) {
      case "slide":
        await handleNewSlideCommand(socket, parameters, lectureRoom);
        break;
      case "poll":
        await handlePollCommand(socket, parameters, lectureRoom);
        break;
      case "quiz":
        await handleQuizCommand(socket, parameters, lectureRoom);
        break;
      case "timer":
        await handleTimerCommand(socket, parameters, lectureRoom);
        break;
      case "end":
        await handleEndLectureCommand(socket, lectureRoom);
        break;
    }
  }

  async function handleNewSlideCommand(socket, parameters, lectureRoom) {
    const slideTitle =
      parameters.slideTitle || `Slide ${lectureRoom.currentSlide + 1}`;

    // Update current slide
    lectureRoom.currentSlide++;

    // Broadcast slide change
    io.to(socket.currentLectureId).emit("slide-changed", {
      slideNumber: lectureRoom.currentSlide,
      slideTitle,
      timestamp: Date.now(),
    });

    // Save to database
    const lecture = await Lecture.findById(socket.currentLectureId);
    await lecture.addSlide(slideTitle);
  }

  async function handlePollCommand(socket, parameters, lectureRoom) {
    const { question, options } = parameters;

    if (!question || !options || options.length < 2) {
      socket.emit("error", { message: "Invalid poll parameters" });
      return;
    }

    // Create poll in database
    const quiz = new Quiz({
      lecture: socket.currentLectureId,
      teacher: socket.userId,
      type: "poll",
      question,
      options: options.map((option) => ({ text: option, isCorrect: false })),
      timeLimit: 60, // Default 1 minute for polls
    });

    await quiz.save();
    await quiz.start();

    // Broadcast poll to students
    socket.to(socket.currentLectureId).emit("poll-started", {
      quizId: quiz._id,
      question,
      options,
      timeLimit: quiz.timeLimit,
    });

    // Set timer to end poll
    setTimeout(async () => {
      await quiz.complete();
      io.to(socket.currentLectureId).emit("poll-ended", {
        quizId: quiz._id,
        results: quiz.results,
      });
    }, quiz.timeLimit * 1000);
  }

  async function handleQuizCommand(socket, parameters, lectureRoom) {
    const { question, options, timeLimit } = parameters;

    if (!question || !options || options.length < 2) {
      socket.emit("error", { message: "Invalid quiz parameters" });
      return;
    }

    // Create quiz in database
    const quiz = new Quiz({
      lecture: socket.currentLectureId,
      teacher: socket.userId,
      type: "quiz",
      question,
      options: options.map((option, index) => ({
        text: option,
        isCorrect: index === 0, // Assuming first option is correct for now
      })),
      correctAnswer: 0,
      timeLimit: timeLimit || 30,
    });

    await quiz.save();
    await quiz.start();

    // Broadcast quiz to students
    socket.to(socket.currentLectureId).emit("quiz-started", {
      quizId: quiz._id,
      question,
      options,
      timeLimit: quiz.timeLimit,
    });

    // Set timer to end quiz
    setTimeout(async () => {
      await quiz.complete();
      io.to(socket.currentLectureId).emit("quiz-ended", {
        quizId: quiz._id,
        results: quiz.results,
        correctAnswer: quiz.correctAnswer,
      });
    }, quiz.timeLimit * 1000);
  }

  async function handleTimerCommand(socket, parameters, lectureRoom) {
    // Implement timer functionality
    socket.to(socket.currentLectureId).emit("timer-started", {
      duration: parameters.timeLimit || 30,
    });
  }

  async function handleEndLectureCommand(socket, lectureRoom) {
    const lecture = await Lecture.findById(socket.currentLectureId);
    if (lecture) {
      lecture.status = "completed";
      lecture.endTime = Date.now();
      await lecture.save();
    }

    io.to(socket.currentLectureId).emit("lecture-ended", {
      timestamp: Date.now(),
    });

    // Clean up the room
    activeLectures.delete(socket.currentLectureId);
  }

  async function saveNoteToDatabase(lectureId, note) {
    try {
      const lecture = await Lecture.findById(lectureId);
      if (lecture) {
        await lecture.addNote(note.content, note.slideNumber);
      }
    } catch (error) {
      console.error("Error saving note to database:", error);
    }
  }
};
