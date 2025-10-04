const express = require("express");
const Quiz = require("../models/Quiz");
const Lecture = require("../models/Lecture");
const { requireTeacher } = require("../middleware/auth");

const router = express.Router();

// Get all quizzes for a lecture
router.get("/lecture/:lectureId", async (req, res) => {
  try {
    const { lectureId } = req.params;

    // Verify lecture access
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Check access permissions
    if (req.user.role === "teacher" && !lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const quizzes = await Quiz.find({ lecture: lectureId })
      .populate("teacher", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({ quizzes });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({ message: "Server error fetching quizzes" });
  }
});

// Get a specific quiz
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("lecture", "title teacher")
      .populate("teacher", "firstName lastName email");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check access permissions
    if (req.user.role === "teacher" && !quiz.teacher._id.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ quiz });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Server error fetching quiz" });
  }
});

// Create a new quiz (teacher only)
router.post("/", requireTeacher, async (req, res) => {
  try {
    const { lectureId, type, question, options, correctAnswer, timeLimit } =
      req.body;

    if (!lectureId || !type || !question || !options || options.length < 2) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify lecture exists and teacher has access
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate correct answer for quiz type
    if (
      type === "quiz" &&
      (correctAnswer === undefined ||
        correctAnswer < 0 ||
        correctAnswer >= options.length)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid correct answer for quiz" });
    }

    const quiz = new Quiz({
      lecture: lectureId,
      teacher: req.user._id,
      type,
      question,
      options: options.map((option, index) => ({
        text: option,
        isCorrect: type === "quiz" ? index === correctAnswer : false,
      })),
      correctAnswer: type === "quiz" ? correctAnswer : undefined,
      timeLimit: timeLimit || (type === "quiz" ? 30 : 60),
    });

    await quiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({ message: "Server error creating quiz" });
  }
});

// Start a quiz (teacher only)
router.post("/:id/start", requireTeacher, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!quiz.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (quiz.status === "active") {
      return res.status(400).json({ message: "Quiz is already active" });
    }

    await quiz.start();

    res.json({
      message: "Quiz started successfully",
      quiz,
    });
  } catch (error) {
    console.error("Start quiz error:", error);
    res.status(500).json({ message: "Server error starting quiz" });
  }
});

// End a quiz (teacher only)
router.post("/:id/end", requireTeacher, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!quiz.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (quiz.status !== "active") {
      return res.status(400).json({ message: "Quiz is not active" });
    }

    await quiz.complete();

    res.json({
      message: "Quiz ended successfully",
      quiz,
    });
  } catch (error) {
    console.error("End quiz error:", error);
    res.status(500).json({ message: "Server error ending quiz" });
  }
});

// Submit quiz response (student only)
router.post("/:id/respond", async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can respond to quizzes" });
    }

    const { selectedOption } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.status !== "active") {
      return res.status(400).json({ message: "Quiz is not active" });
    }

    if (
      selectedOption === undefined ||
      selectedOption < 0 ||
      selectedOption >= quiz.options.length
    ) {
      return res.status(400).json({ message: "Invalid option selected" });
    }

    await quiz.addResponse(req.user._id, selectedOption);

    res.json({
      message: "Response recorded successfully",
      quiz: {
        id: quiz._id,
        results: quiz.results,
      },
    });
  } catch (error) {
    console.error("Submit response error:", error);
    res.status(500).json({ message: "Server error submitting response" });
  }
});

// Get quiz results (teacher only)
router.get("/:id/results", requireTeacher, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "responses.student",
      "firstName lastName email"
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!quiz.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      quiz: {
        id: quiz._id,
        question: quiz.question,
        options: quiz.options,
        type: quiz.type,
        correctAnswer: quiz.correctAnswer,
        results: quiz.results,
        responses: quiz.responses,
        createdAt: quiz.createdAt,
        completedAt: quiz.completedAt,
      },
    });
  } catch (error) {
    console.error("Get quiz results error:", error);
    res.status(500).json({ message: "Server error fetching quiz results" });
  }
});

// Update quiz (teacher only)
router.put("/:id", requireTeacher, async (req, res) => {
  try {
    const { question, options, correctAnswer, timeLimit } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!quiz.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (quiz.status === "active") {
      return res.status(400).json({ message: "Cannot update active quiz" });
    }

    if (question) quiz.question = question;
    if (options) {
      quiz.options = options.map((option, index) => ({
        text: option,
        isCorrect: quiz.type === "quiz" ? index === correctAnswer : false,
      }));
    }
    if (quiz.type === "quiz" && correctAnswer !== undefined) {
      quiz.correctAnswer = correctAnswer;
    }
    if (timeLimit) quiz.timeLimit = timeLimit;

    await quiz.save();

    res.json({
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({ message: "Server error updating quiz" });
  }
});

// Delete quiz (teacher only)
router.delete("/:id", requireTeacher, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!quiz.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ message: "Server error deleting quiz" });
  }
});

module.exports = router;
