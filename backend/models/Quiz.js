const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["poll", "quiz"],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  correctAnswer: {
    type: Number, // Index of correct option
    required: function () {
      return this.type === "quiz";
    },
  },
  timeLimit: {
    type: Number, // in seconds
    default: 30,
  },
  status: {
    type: String,
    enum: ["created", "active", "completed"],
    default: "created",
  },
  responses: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      selectedOption: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  results: {
    totalResponses: {
      type: Number,
      default: 0,
    },
    optionCounts: [
      {
        optionIndex: Number,
        count: Number,
      },
    ],
    correctResponses: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Update the updatedAt field before saving
quizSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add a response to the quiz
quizSchema.methods.addResponse = function (studentId, selectedOption) {
  // Remove any existing response from this student
  this.responses = this.responses.filter(
    (response) => !response.student.equals(studentId)
  );

  // Add new response
  this.responses.push({
    student: studentId,
    selectedOption,
    timestamp: Date.now(),
  });

  // Update results
  this.updateResults();

  return this.save();
};

// Update quiz results
quizSchema.methods.updateResults = function () {
  this.results.totalResponses = this.responses.length;

  // Count responses for each option
  this.results.optionCounts = this.options.map((_, index) => ({
    optionIndex: index,
    count: this.responses.filter((r) => r.selectedOption === index).length,
  }));

  // Count correct responses for quizzes
  if (this.type === "quiz" && this.correctAnswer !== undefined) {
    this.results.correctResponses = this.responses.filter(
      (r) => r.selectedOption === this.correctAnswer
    ).length;
  }
};

// Start the quiz/poll
quizSchema.methods.start = function () {
  this.status = "active";
  return this.save();
};

// Complete the quiz/poll
quizSchema.methods.complete = function () {
  this.status = "completed";
  this.completedAt = Date.now();
  this.updateResults();
  return this.save();
};

module.exports = mongoose.model("Quiz", quizSchema);
