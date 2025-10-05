const express = require("express");
const Lecture = require("../models/Lecture");
const { requireTeacher } = require("../middleware/auth");

const router = express.Router();

// Create a new lecture (teacher only)
router.post("/", requireTeacher, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Lecture title is required" });
    }

    const lecture = new Lecture({
      title,
      teacher: req.user._id,
      status: "scheduled",
    });

    await lecture.save();

    res.status(201).json({
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error("Create lecture error:", error);
    res.status(500).json({ message: "Server error creating lecture" });
  }
});

// Get all lectures for the current user
router.get("/", async (req, res) => {
  try {
    let lectures;
    const { teacherId } = req.query;

    if (req.user.role === "teacher") {
      // Teachers see their own lectures
      lectures = await Lecture.find({ teacher: req.user._id })
        .populate("teacher", "firstName lastName email")
        .sort({ createdAt: -1 });
    } else {
      // Students see lectures filtered by teacher if provided
      const query = {
        status: { $in: ["active", "completed"] },
      };

      if (teacherId) {
        query.teacher = teacherId;
      }

      lectures = await Lecture.find(query)
        .populate("teacher", "firstName lastName email")
        .sort({ createdAt: -1 });
    }

    res.json({ lectures });
  } catch (error) {
    console.error("Get lectures error:", error);
    res.status(500).json({ message: "Server error fetching lectures" });
  }
});

// Get a specific lecture
router.get("/:id", async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate("teacher", "firstName lastName email")
      .populate("participants", "firstName lastName email");

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Check access permissions
    if (
      req.user.role === "teacher" &&
      !lecture.teacher._id.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ lecture });
  } catch (error) {
    console.error("Get lecture error:", error);
    res.status(500).json({ message: "Server error fetching lecture" });
  }
});

// Start a lecture (teacher only)
router.post("/:id/start", requireTeacher, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (lecture.status === "active") {
      return res.status(400).json({ message: "Lecture is already active" });
    }

    lecture.status = "active";
    lecture.startTime = Date.now();
    await lecture.save();

    res.json({
      message: "Lecture started successfully",
      lecture,
    });
  } catch (error) {
    console.error("Start lecture error:", error);
    res.status(500).json({ message: "Server error starting lecture" });
  }
});

// Pause a lecture (teacher only)
router.post("/:id/pause", requireTeacher, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (lecture.status !== "active") {
      return res.status(400).json({ message: "Lecture is not active" });
    }

    lecture.status = "paused";
    await lecture.save();

    res.json({
      message: "Lecture paused successfully",
      lecture,
    });
  } catch (error) {
    console.error("Pause lecture error:", error);
    res.status(500).json({ message: "Server error pausing lecture" });
  }
});

// Resume a lecture (teacher only)
router.post("/:id/resume", requireTeacher, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (lecture.status !== "paused") {
      return res.status(400).json({ message: "Lecture is not paused" });
    }

    lecture.status = "active";
    await lecture.save();

    res.json({
      message: "Lecture resumed successfully",
      lecture,
    });
  } catch (error) {
    console.error("Resume lecture error:", error);
    res.status(500).json({ message: "Server error resuming lecture" });
  }
});

// End a lecture (teacher only)
router.post("/:id/end", requireTeacher, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (lecture.status === "completed") {
      return res.status(400).json({ message: "Lecture is already completed" });
    }

    lecture.status = "completed";
    lecture.endTime = Date.now();
    await lecture.save();

    res.json({
      message: "Lecture ended successfully",
      lecture,
    });
  } catch (error) {
    console.error("End lecture error:", error);
    res.status(500).json({ message: "Server error ending lecture" });
  }
});

// Join a lecture (student only)
router.post("/:id/join", async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can join lectures" });
    }

    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (lecture.status !== "active") {
      return res.status(400).json({ message: "Lecture is not active" });
    }

    // Add student to participants if not already added
    if (!lecture.participants.includes(req.user._id)) {
      lecture.participants.push(req.user._id);
      await lecture.save();
    }

    res.json({
      message: "Joined lecture successfully",
      lecture,
    });
  } catch (error) {
    console.error("Join lecture error:", error);
    res.status(500).json({ message: "Server error joining lecture" });
  }
});

// Update lecture (teacher only)
router.put("/:id", requireTeacher, async (req, res) => {
  try {
    const { title } = req.body;
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (title) lecture.title = title;
    await lecture.save();

    res.json({
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("Update lecture error:", error);
    res.status(500).json({ message: "Server error updating lecture" });
  }
});

// Delete lecture (teacher only)
router.delete("/:id", requireTeacher, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (!lecture.teacher.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Lecture.findByIdAndDelete(req.params.id);

    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Delete lecture error:", error);
    res.status(500).json({ message: "Server error deleting lecture" });
  }
});

// Get lecture notes for students (accessible after lecture ends)
router.get("/:id/notes", async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate(
      "teacher",
      "firstName lastName email"
    );

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Only allow access if lecture is completed or user is the teacher
    if (lecture.status !== "completed" && req.user.role !== "teacher") {
      return res
        .status(403)
        .json({
          message: "Lecture notes are only available after the lecture ends",
        });
    }

    // If user is a student, check if they were a participant
    if (
      req.user.role === "student" &&
      !lecture.participants.includes(req.user._id)
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied. You were not a participant in this lecture.",
        });
    }

    res.json({
      lecture: {
        _id: lecture._id,
        title: lecture.title,
        teacher: lecture.teacher,
        status: lecture.status,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
      },
      notes: lecture.notes,
    });
  } catch (error) {
    console.error("Get lecture notes error:", error);
    res.status(500).json({ message: "Server error fetching lecture notes" });
  }
});

module.exports = router;
