const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "active", "paused", "completed"],
    default: "scheduled",
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  notes: [
    {
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      slideNumber: {
        type: Number,
        default: 1,
      },
    },
  ],
  slides: [
    {
      slideNumber: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        default: "",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  transcript: {
    type: String,
    default: "",
  },
  summary: {
    type: String,
    default: "",
  },
  pdfPath: {
    type: String,
    default: "",
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
lectureSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add a note to the lecture
lectureSchema.methods.addNote = function (content, slideNumber = 1) {
  this.notes.push({
    content,
    slideNumber,
    timestamp: Date.now(),
  });
  return this.save();
};

// Add a slide to the lecture
lectureSchema.methods.addSlide = function (title, content = "") {
  const slideNumber = this.slides.length + 1;
  this.slides.push({
    slideNumber,
    title,
    content,
    createdAt: Date.now(),
  });
  return this.save();
};

// Update current slide
lectureSchema.methods.updateCurrentSlide = function (content) {
  if (this.slides.length > 0) {
    this.slides[this.slides.length - 1].content = content;
  }
  return this.save();
};

module.exports = mongoose.model("Lecture", lectureSchema);
