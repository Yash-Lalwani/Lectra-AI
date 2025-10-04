const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Lecture = require("./models/Lecture");
const Quiz = require("./models/Quiz");

const seedDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/lectra",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Clear existing demo data
    await User.deleteMany({
      email: { $in: ["teacher@demo.com", "student@demo.com"] },
    });
    await Lecture.deleteMany({ title: { $regex: /Demo Lecture/i } });

    console.log("Cleared existing demo data");

    // Create demo users
    const teacherPassword = await bcrypt.hash("password123", 10);
    const studentPassword = await bcrypt.hash("password123", 10);

    const teacher = new User({
      email: "teacher@demo.com",
      password: teacherPassword,
      firstName: "John",
      lastName: "Smith",
      role: "teacher",
      isActive: true,
    });

    const student = new User({
      email: "student@demo.com",
      password: studentPassword,
      firstName: "Jane",
      lastName: "Doe",
      role: "student",
      isActive: true,
    });

    await teacher.save();
    await student.save();

    console.log("Created demo users");

    // Create demo lectures
    const demoLecture1 = new Lecture({
      title: "Demo Lecture: Introduction to AI",
      teacher: teacher._id,
      status: "completed",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      notes: [
        {
          content:
            "<ul><li>AI is transforming industries</li><li>Machine learning is a subset of AI</li><li>Deep learning uses neural networks</li></ul>",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
          slideNumber: 1,
        },
        {
          content:
            "<ul><li>Supervised learning uses labeled data</li><li>Unsupervised learning finds patterns</li><li>Reinforcement learning learns from rewards</li></ul>",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
          slideNumber: 2,
        },
        {
          content:
            "<ul><li>Applications in healthcare</li><li>Autonomous vehicles</li><li>Natural language processing</li></ul>",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000),
          slideNumber: 3,
        },
      ],
      slides: [
        {
          slideNumber: 1,
          title: "What is AI?",
          content: "Introduction to Artificial Intelligence",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          slideNumber: 2,
          title: "Types of Machine Learning",
          content: "Supervised, Unsupervised, and Reinforcement Learning",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
        },
        {
          slideNumber: 3,
          title: "AI Applications",
          content: "Real-world applications of AI technology",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 20 * 60 * 1000),
        },
      ],
      transcript:
        "Welcome to our introduction to artificial intelligence. AI is transforming industries across the globe. Machine learning is a subset of AI that enables computers to learn from data. Deep learning uses neural networks to process information. There are three main types of machine learning: supervised learning uses labeled data, unsupervised learning finds patterns in data, and reinforcement learning learns from rewards. AI has many applications including healthcare, autonomous vehicles, and natural language processing.",
      summary:
        "This lecture covered the fundamentals of artificial intelligence, including machine learning types and real-world applications.",
      participants: [student._id],
    });

    const demoLecture2 = new Lecture({
      title: "Demo Lecture: Web Development Basics",
      teacher: teacher._id,
      status: "active",
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      notes: [
        {
          content:
            "<ul><li>HTML structures web pages</li><li>CSS styles the appearance</li><li>JavaScript adds interactivity</li></ul>",
          timestamp: new Date(Date.now() - 30 * 60 * 1000 + 5 * 60 * 1000),
          slideNumber: 1,
        },
        {
          content:
            "<ul><li>React is a popular JavaScript library</li><li>Components are reusable UI elements</li><li>State management is crucial</li></ul>",
          timestamp: new Date(Date.now() - 30 * 60 * 1000 + 15 * 60 * 1000),
          slideNumber: 2,
        },
      ],
      slides: [
        {
          slideNumber: 1,
          title: "Web Technologies",
          content: "HTML, CSS, and JavaScript fundamentals",
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          slideNumber: 2,
          title: "React Framework",
          content: "Building modern web applications with React",
          createdAt: new Date(Date.now() - 30 * 60 * 1000 + 10 * 60 * 1000),
        },
      ],
      participants: [student._id],
    });

    await demoLecture1.save();
    await demoLecture2.save();

    console.log("Created demo lectures");

    // Create demo quiz for completed lecture
    const demoQuiz = new Quiz({
      lecture: demoLecture1._id,
      teacher: teacher._id,
      type: "quiz",
      question: "Which of the following is a type of machine learning?",
      options: [
        { text: "Supervised Learning", isCorrect: true },
        { text: "Binary Learning", isCorrect: false },
        { text: "Linear Learning", isCorrect: false },
        { text: "Static Learning", isCorrect: false },
      ],
      correctAnswer: 0,
      timeLimit: 30,
      status: "completed",
      responses: [
        {
          student: student._id,
          selectedOption: 0,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 5 * 60 * 1000),
        },
      ],
      results: {
        totalResponses: 1,
        optionCounts: [
          { optionIndex: 0, count: 1 },
          { optionIndex: 1, count: 0 },
          { optionIndex: 2, count: 0 },
          { optionIndex: 3, count: 0 },
        ],
        correctResponses: 1,
      },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 30 * 1000),
    });

    await demoQuiz.save();

    console.log("Created demo quiz");

    console.log("\n🎉 Demo data seeded successfully!");
    console.log("\nDemo Accounts:");
    console.log("Teacher: teacher@demo.com / password123");
    console.log("Student: student@demo.com / password123");
    console.log("\nDemo Lectures:");
    console.log('- "Demo Lecture: Introduction to AI" (completed)');
    console.log('- "Demo Lecture: Web Development Basics" (active)');
  } catch (error) {
    console.error("Error seeding demo data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the seeder
seedDemoData();
